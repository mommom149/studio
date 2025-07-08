
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp, setDoc } from 'firebase/firestore';

export interface BedCounts {
  nicu: number;
  picu: number;
  icu: number;
}

export interface HospitalData {
  id: string;
  name: string;
  beds: BedCounts;
  lastUpdated: Date;
}

export async function getHospitalData(hospitalId: string): Promise<HospitalData | null> {
  try {
    const hospitalRef = doc(db, 'hospitals', hospitalId);
    const docSnap = await getDoc(hospitalRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || 'اسم مستشفى غير معروف',
        beds: data.beds || { nicu: 0, picu: 0, icu: 0 },
        lastUpdated: (data.lastUpdated as Timestamp)?.toDate() || new Date(),
      };
    } else {
      console.warn(`No hospital document found for ID: ${hospitalId}`);
      // Optional: create a default document if it doesn't exist
      // await createDefaultHospitalDoc(hospitalId);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching hospital data for ${hospitalId}:`, error);
    return null;
  }
}

export async function updateHospitalBeds(hospitalId: string, beds: BedCounts): Promise<{ success: boolean; message?: string }> {
  if (!hospitalId) {
    return { success: false, message: 'Hospital ID is required.' };
  }
  try {
    const hospitalRef = doc(db, 'hospitals', hospitalId);
    await updateDoc(hospitalRef, {
      beds: beds,
      lastUpdated: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error(`Error updating beds for hospital ${hospitalId}:`, error);
    return { success: false, message: 'Failed to update bed counts.' };
  }
}

// Optional helper function to create a hospital document if it doesn't exist
// This can be useful for initial setup.
export async function createDefaultHospitalDoc(hospitalId: string): Promise<void> {
    try {
        const hospitalRef = doc(db, 'hospitals', hospitalId);
        await setDoc(hospitalRef, {
            name: `مستشفى ${hospitalId}`,
            beds: { icu: 0, nicu: 0, picu: 0 },
            lastUpdated: Timestamp.now(),
        });
    } catch (error) {
        console.error(`Failed to create default doc for ${hospitalId}`, error);
    }
}
