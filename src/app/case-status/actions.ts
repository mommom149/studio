'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

// This is the shape of the data coming from Firestore
interface CaseFromFirestore {
  id: string;
  patientName: string;
  submissionDate: Timestamp;
  serviceType: 'NICU' | 'PICU' | 'ICU';
  status: 'Received' | 'Reviewed' | 'Admitted' | 'Assigned';
  adminNote?: string;
  assignedTo?: string;
}

// This is the shape of the data we'll send to the client (serializable)
export interface CaseDetails {
  caseNumber: string;
  patientName: string;
  submissionDate: string; // ISO string
  type: 'NICU' | 'PICU' | 'ICU';
  status: 'Received' | 'Reviewed' | 'Admitted' | 'Assigned';
  lastUpdateNote?: string;
  assignedTo?: string;
}

export async function getCaseDetails(caseId: string): Promise<CaseDetails | null> {
  if (!caseId) {
    return null;
  }

  try {
    const caseRef = doc(db, 'cases', caseId.trim().toUpperCase());
    const docSnap = await getDoc(caseRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as CaseFromFirestore;
      
      // Basic validation
      if (!data.patientName || !data.submissionDate || !data.serviceType || !data.status) {
          console.warn(`Case document ${caseId} is missing critical fields.`);
          return null;
      }

      return {
        caseNumber: data.id,
        patientName: data.patientName,
        submissionDate: data.submissionDate.toDate().toISOString(),
        type: data.serviceType,
        status: data.status,
        lastUpdateNote: data.adminNote,
        assignedTo: data.assignedTo,
      };
    } else {
      console.log(`No case found with ID: ${caseId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching case details for ${caseId}:`, error);
    return null;
  }
}
