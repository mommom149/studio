'use server';

import { detectServiceType } from '@/ai/flows/auto-detect-service-type';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, set, serverTimestamp } from 'firebase/database';


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
  const snapshot = await uploadBytes(fileRef, file);
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

export async function submitCaseAction(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  
  const validatedData = FormSchema.safeParse(rawFormData);
  if (!validatedData.success) {
    console.error("Form validation failed", validatedData.error.flatten().fieldErrors);
    throw new Error("Invalid form data. Please check the fields and try again.");
  }

  const { serviceType, medicalReport, identityDocument, ...caseData } = validatedData.data;

  const date = new Date();
  const dateString = `${date.getFullYear()}${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  const caseId = `${serviceType.toUpperCase()}-${dateString}-${randomNumber}`;

  try {
    // 1. Upload files to Firebase Storage
    const medicalReportUrl = await uploadFile(medicalReport, caseId, 'medical-report');
    const identityDocumentUrl = await uploadFile(identityDocument, caseId, 'identity-document');

    // 2. Save case data to Firebase Realtime Database
    const caseRef = dbRef(db, `cases/${caseId}`);
    await set(caseRef, {
      ...caseData,
      id: caseId,
      status: 'Received',
      submissionDate: serverTimestamp(),
      serviceType: serviceType,
      medicalReportUrl,
      identityDocumentUrl,
    });

    console.log('Case submitted successfully to Firebase:', caseId);
  
    redirect(`/submit-case/success?caseId=${caseId}`);

  } catch (error) {
    console.error("Firebase submission failed:", error);
    // In a real app, you might want to redirect to an error page or show a toast
    throw new Error("Failed to submit the case. Please try again later.");
  }
}
