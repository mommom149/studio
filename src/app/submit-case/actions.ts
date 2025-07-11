
'use server';

import { detectServiceType } from '@/ai/flows/auto-detect-service-type';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';


const FormSchema = z.object({
  patientName: z.string(),
  dob: z.string(), // Keep as string from FormData
  contactPhone: z.string(),
  otherContactPhone: z.string().optional(),
  contactEmail: z.string().email(),
  referringHospital: z.string(),
  serviceType: z.string(),
  hasInsurance: z.preprocess((val) => val === 'true', z.boolean()),
  medicalReport: z.instanceof(File, { message: 'التقرير الطبي مطلوب.' }).refine(file => file.size > 0, 'التقرير الطبي مطلوب.'),
  identityDocument: z.instanceof(File, { message: 'شهادة الميلاد أو البطاقة الشخصية مطلوبة.' }).refine(file => file.size > 0, 'شهادة الميلاد أو البطاقة الشخصية مطلوبة.'),
});

async function uploadFile(file: File, caseId: string, type: string): Promise<string> {
  const fileRef = ref(storage, `cases/${caseId}/${type}-${file.name}`);
  // Pass metadata with contentType to fix upload issues
  const snapshot = await uploadBytes(fileRef, file, { contentType: file.type });
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
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
    const caseRef = doc(db, 'cases', caseId);
    await setDoc(caseRef, {
      ...caseData,
      id: caseId,
      status: 'Received',
      submissionDate: serverTimestamp(),
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
