
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
  lastUpdated: string; // ISO string for serialization
}

export async function getHospitalData(hospitalId: string): Promise<HospitalData | null> {
  try {
    const hospitalRef = doc(db, 'hospitals', hospitalId);
    let docSnap = await getDoc(hospitalRef);

    // If the hospital document doesn't exist, create one automatically.
    if (!docSnap.exists()) {
      console.warn(`No hospital document found for ID: ${hospitalId}. Creating a default document.`);
      await createDefaultHospitalDoc(hospitalId);
      
      // Fetch the document again now that it has been created.
      docSnap = await getDoc(hospitalRef);

      // If it still doesn't exist, something went wrong with the creation.
      if (!docSnap.exists()) {
        console.error(`Failed to create and then fetch hospital document for ID: ${hospitalId}`);
        return null;
      }
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name || `مستشفى ${docSnap.id}`,
      beds: data.beds || { nicu: 0, picu: 0, icu: 0 },
      lastUpdated: ((data.lastUpdated as Timestamp)?.toDate() || new Date()).toISOString(),
    };
    
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

// Helper function to create a hospital document if it doesn't exist.
// This is useful for the initial setup of a new hospital user.
export async function createDefaultHospitalDoc(hospitalId: string): Promise<void> {
    try {
        const hospitalRef = doc(db, 'hospitals', hospitalId);
        await setDoc(hospitalRef, {
            name: `مستشفى ${hospitalId}`,
            beds: { icu: 0, nicu: 0, picu: 0 },
            lastUpdated: Timestamp.now(),
        });
        console.log(`Successfully created default document for ${hospitalId}`);
    } catch (error) {
        console.error(`Failed to create default doc for ${hospitalId}`, error);
    }
}
