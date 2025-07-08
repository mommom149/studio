'use server';

import { db } from '@/lib/firebase';
import { Timestamp, doc, updateDoc } from 'firebase/firestore';

// Shape of case data sent to the client (serializable)
export interface CaseForClient {
  id: string;
  patientName:string;
  patientAge: string;
  type: 'NICU' | 'PICU' | 'ICU';
  status: 'Received' | 'Reviewed' | 'Admitted' | 'Assigned';
  reportUrl?: string;
  adminNote: string;
  submissionDate: string; // ISO string
  assignedTo?: string;
  assignedBy?: string;
  assignedAt?: string; // ISO string
}

// Shape of hospital bed counts
export interface BedCounts {
  nicu: number;
  picu: number;
  icu: number;
}

// Shape of hospital data sent to the client (serializable)
export interface HospitalData {
  id: string;
  name: string;
  beds: BedCounts;
  lastUpdated: string; // ISO string
}


export async function updateCase(caseId: string, updates: { status?: CaseForClient['status']; adminNote?: string }): Promise<{ success: boolean; message?: string }> {
  if (!caseId) {
    return { success: false, message: 'Case ID is required.' };
  }
  try {
    const caseRef = doc(db, 'cases', caseId);
    const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));

    if (Object.keys(cleanUpdates).length === 0) {
      return { success: true }; // No updates to perform
    }

    await updateDoc(caseRef, cleanUpdates);
    return { success: true };
  } catch (error) {
    console.error(`Error updating case ${caseId}:`, error);
    return { success: false, message: 'Failed to update case.' };
  }
}

export async function assignCaseToHospital(
  caseId: string, 
  hospitalName: string,
  adminUser: string = 'admin@neobridge.com' // Placeholder until we have auth
): Promise<{ success: boolean; message?: string }> {
   if (!caseId || !hospitalName) {
    return { success: false, message: 'Case ID and hospital name are required.' };
  }
  try {
    const caseRef = doc(db, 'cases', caseId);
    await updateDoc(caseRef, {
      status: 'Assigned',
      assignedTo: hospitalName,
      assignedBy: adminUser,
      assignedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error(`Error assigning case ${caseId} to hospital:`, error);
    return { success: false, message: 'Failed to assign case.' };
  }
}
