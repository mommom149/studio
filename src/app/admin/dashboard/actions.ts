'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';

// Shape of data from Firestore
interface CaseFromFirestore {
  id: string;
  patientName: string;
  dob: string; // ISO string
  serviceType: 'NICU' | 'PICU' | 'ICU';
  status: 'Received' | 'Reviewed' | 'Admitted' | 'Assigned';
  medicalReportUrl: string;
  submissionDate: Timestamp;
  adminNote?: string;
  assignedTo?: string;
  assignedBy?: string;
  assignedAt?: Timestamp;
  [key: string]: any;
}

// Shape of data sent to the client (serializable)
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

function calculateAge(dob: string): string {
    const birthDate = new Date(dob);
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const ageParts: string[] = [];
    if (years > 0) {
        ageParts.push(`${years} سنة`);
        if (months > 0) ageParts.push(`${months} شهر`);
    } else if (months > 0) {
        ageParts.push(`${months} شهر`);
        if (days > 0) ageParts.push(`${days} يوم`);
    } else if (days >= 0) {
        ageParts.push(`${days} يوم`);
    }
    
    return ageParts.length > 0 ? ageParts.join(' و ') : 'حديث الولادة';
}


export async function getCases(): Promise<CaseForClient[]> {
  try {
    const casesRef = collection(db, 'cases');
    const q = query(casesRef, orderBy('submissionDate', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return [];
    }

    const cases: CaseForClient[] = querySnapshot.docs.map(doc => {
      const data = doc.data() as CaseFromFirestore;
      return {
        id: data.id,
        patientName: data.patientName,
        patientAge: calculateAge(data.dob),
        type: data.serviceType,
        status: data.status || 'Received',
        reportUrl: data.medicalReportUrl,
        adminNote: data.adminNote || '',
        submissionDate: data.submissionDate.toDate().toISOString(),
        assignedTo: data.assignedTo,
        assignedBy: data.assignedBy,
        assignedAt: data.assignedAt ? data.assignedAt.toDate().toISOString() : undefined,
      };
    });

    return cases;
  } catch (error) {
    console.error("Error fetching cases from Firestore:", error);
    return [];
  }
}
