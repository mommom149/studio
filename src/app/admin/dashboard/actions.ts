'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp, doc, updateDoc } from 'firebase/firestore';

// Shape of case data from Firestore, with fields marked as optional to reflect real-world data
interface CaseFromFirestore {
  patientName?: string;
  dob?: string; // ISO string
  serviceType?: 'NICU' | 'PICU' | 'ICU';
  status?: 'Received' | 'Reviewed' | 'Admitted' | 'Assigned';
  medicalReportUrl?: string;
  submissionDate?: Timestamp;
  adminNote?: string;
  assignedTo?: string;
  assignedBy?: string;
  assignedAt?: Timestamp;
  [key: string]: any;
}

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

function calculateAge(dob: string): string {
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
      return 'عمر غير معروف';
    }
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

      // Guard against documents missing critical data
      if (!data.submissionDate || typeof data.submissionDate.toDate !== 'function') {
        console.warn(`Document ${doc.id} is missing a valid submissionDate. Skipping.`);
        return null;
      }
      if (!data.patientName || !data.dob || !data.serviceType) {
        console.warn(`Document ${doc.id} is missing critical data (patientName, dob, or serviceType). Skipping.`);
        return null;
      }
      
      return {
        id: doc.id,
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
    }).filter((c): c is CaseForClient => c !== null); // Filter out any null entries

    return cases;
  } catch (error) {
    console.error("Error fetching cases from Firestore:", error);
    // Return empty array on error to prevent crashing the client
    return [];
  }
}

export async function getHospitals(): Promise<HospitalData[]> {
    try {
        const hospitalsRef = collection(db, 'hospitals');
        const q = query(hospitalsRef, orderBy('name'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        const hospitals: HospitalData[] = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || 'اسم مستشفى غير معروف',
                beds: data.beds || { icu: 0, nicu: 0, picu: 0 },
                lastUpdated: (data.lastUpdated as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            };
        });

        return hospitals;

    } catch (error) {
        console.error("Error fetching hospitals from Firestore:", error);
        return [];
    }
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
