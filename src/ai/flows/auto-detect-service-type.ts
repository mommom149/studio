'use server';
/**
 * @fileOverview Automatically identifies the appropriate medical service type (NICU, PICU, ICU) based on patient age.
 *
 * - detectServiceType - A function that handles the service type detection process.
 * - DetectServiceTypeInput - The input type for the detectServiceType function.
 * - DetectServiceTypeOutput - The return type for the detectServiceType function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectServiceTypeInputSchema = z.object({
  ageInMonths: z
    .number()
    .describe('The age of the patient in months. Use decimal format if needed.'),
});
export type DetectServiceTypeInput = z.infer<typeof DetectServiceTypeInputSchema>;

const DetectServiceTypeOutputSchema = z.object({
  serviceType: z
    .enum(['NICU', 'PICU', 'ICU'])
    .describe('The detected service type based on the patient age.'),
  justification: z
    .string()
    .describe('The justification for the service type assignment based on age.'),
});
export type DetectServiceTypeOutput = z.infer<typeof DetectServiceTypeOutputSchema>;

export async function detectServiceType(input: DetectServiceTypeInput): Promise<DetectServiceTypeOutput> {
  return detectServiceTypeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectServiceTypePrompt',
  input: {schema: DetectServiceTypeInputSchema},
  output: {schema: DetectServiceTypeOutputSchema},
  prompt: `You are an expert medical triage assistant. Based on the patient's age in months, determine the appropriate medical service type (NICU, PICU, or ICU).

Here are the age ranges for each service type:
- NICU: < 1 month
- PICU: 1 month - 18 years
- ICU: > 18 years

Age: {{{ageInMonths}}} months

Based on the age, what is the most appropriate service type? Provide a brief justification for your choice.

Ensure that the serviceType field is one of 'NICU', 'PICU', or 'ICU'. Make sure that output is valid JSON.`,
});

const detectServiceTypeFlow = ai.defineFlow(
  {
    name: 'detectServiceTypeFlow',
    inputSchema: DetectServiceTypeInputSchema,
    outputSchema: DetectServiceTypeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
