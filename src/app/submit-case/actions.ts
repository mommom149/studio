
'use server';

import { detectServiceType } from '@/ai/flows/auto-detect-service-type';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const FormSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required.'),
  dob: z.string().min(1, 'Date of birth is required.'),
  contactPhone: z.string().min(1, 'Contact phone is required.'),
  otherContactPhone: z.string().optional(),
  contactEmail: z.string().email(),
  referringHospital: z.string().min(1, 'Referring hospital is required.'),
  serviceType: z.string(),
  hasInsurance: z.preprocess((val) => val === 'true', z.boolean()),
  medicalReport: z.instanceof(File, { message: 'Medical report is required.' }).refine(file => file.size > 0, 'Medical report is required.'),
  identityDocument: z.instanceof(File, { message: 'Identity document is required.' }).refine(file => file.size > 0, 'Identity document is required.'),
});


async function uploadFile(file: File, caseId: string, type: string): Promise<string> {
  const bucket = adminStorage.bucket();
  const filePath = `cases/${caseId}/${type}-${file.name}`;
  const fileRef = bucket.file(filePath);

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  await fileRef.save(fileBuffer, {
    metadata: {
      contentType: file.type,
    },
  });

  // Make the file public and get the URL
  await fileRef.makePublic();
  return fileRef.publicUrl();
}


export async function getServiceTypeAction(ageInMonths: number) {
  try {
    const result = await detectServiceType({ ageInMonths });
    return result;
  } catch (error) {
    console.error('AI service detection failed:', error);
    // Fallback in case of AI error
    if (ageInMonths < 1) {
      return { serviceType: 'NICU', justification: 'تم التعيين إلى NICU بناءً على العمر (أقل من شهر).' };
    } else if (ageInMonths <= 18 * 12) {
      return { serviceType: 'PICU', justification: 'تم التعيين إلى PICU بناءً على العمر (بين شهر و 18 عامًا).' };
    } else {
      return { serviceType: 'ICU', justification: 'تم التعيين إلى ICU بناءً على العمر (أكبر من 18 عامًا).' };
    }
  }
}

export async function submitCaseAction(formData: FormData): Promise<{ success: boolean; error?: string; }> {
  const rawFormData = Object.fromEntries(formData.entries());
  
  const validatedData = FormSchema.safeParse(rawFormData);
  if (!validatedData.success) {
    console.error("Form validation failed", validatedData.error.flatten().fieldErrors);
    const firstError = Object.values(validatedData.error.flatten().fieldErrors)[0]?.[0] || "البيانات المدخلة غير صالحة.";
    return { success: false, error: firstError };
  }

  const { serviceType, medicalReport, identityDocument, ...caseData } = validatedData.data;

  const date = new Date();
  const dateString = `${date.getFullYear()}${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  const caseId = `${serviceType.toUpperCase()}-${dateString}-${randomNumber}`;
  
  let medicalReportUrl = '';
  let identityDocumentUrl = '';

  try {
    // 1. Upload files to Firebase Storage with proper error handling
    try {
        medicalReportUrl = await uploadFile(medicalReport, caseId, 'medical-report');
    } catch (error) {
        console.error("Medical report upload failed:", error);
        return { success: false, error: "فشل تحميل التقرير الطبي. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى." };
    }

    try {
        identityDocumentUrl = await uploadFile(identityDocument, caseId, 'identity-document');
    } catch (error) {
        console.error("Identity document upload failed:", error);
        return { success: false, error: "فشل تحميل وثيقة الهوية. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى." };
    }


    // 2. Save case data to Cloud Firestore in the 'cases' collection
    const caseRef = adminDb.collection('cases').doc(caseId);
    await caseRef.set({
      ...caseData,
      id: caseId,
      status: 'Received',
      submissionDate: FieldValue.serverTimestamp(),
      serviceType: serviceType,
      medicalReportUrl,
      identityDocumentUrl,
    });

    console.log('Case submitted successfully to Firebase:', caseId);
  
  } catch (error: any) {
    console.error("Firebase submission failed:", error);
    let errorMessage = "فشل إرسال الحالة. يرجى المحاولة مرة أخرى لاحقًا.";
    if (error.code?.includes('permission-denied')) {
        errorMessage = "فشل الإرسال بسبب مشكلة في الأذونات. يرجى الاتصال بالدعم الفني.";
    }
    return { success: false, error: errorMessage };
  }

  // This will only be reached if the try block succeeds.
  redirect(`/submit-case/success?caseId=${caseId}`);
}
