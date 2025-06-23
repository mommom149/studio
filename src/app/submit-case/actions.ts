'use server';

import { detectServiceType } from '@/ai/flows/auto-detect-service-type';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const FormSchema = z.object({
  patientName: z.string(),
  dob: z.string(),
  contactPhone: z.string(),
  contactEmail: z.string().email(),
  referringHospital: z.string(),
  serviceType: z.string(),
  medicalReport: z.instanceof(File, { message: 'التقرير الطبي مطلوب.' }),
  birthCertificate: z.instanceof(File, { message: 'شهادة الميلاد مطلوبة.' }),
});

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
    console.error("Form validation failed", validatedData.error);
    throw new Error("Invalid form data");
  }

  const { serviceType } = validatedData.data;

  const date = new Date();
  const dateString = `${date.getFullYear()}${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  const caseId = `${serviceType.toUpperCase()}-${dateString}-${randomNumber}`;

  // Here you would save the data to a database
  console.log('Case submitted:', { caseId, ...validatedData.data });
  
  redirect(`/submit-case/success?caseId=${caseId}`);
}
