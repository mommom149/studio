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
});

export async function getServiceTypeAction(ageInMonths: number) {
  try {
    const result = await detectServiceType({ ageInMonths });
    return result;
  } catch (error) {
    console.error('AI service detection failed:', error);
    return {
      serviceType: 'ICU',
      justification: 'تعذر التحديد التلقائي، تم التعيين إلى ICU افتراضيًا.',
    };
  }
}

export async function submitCaseAction(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  
  // Quick validation, more robust validation should be here
  const validatedData = FormSchema.safeParse(rawFormData);
  if (!validatedData.success) {
    // Handle error - in a real app, you'd return this to the form
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
