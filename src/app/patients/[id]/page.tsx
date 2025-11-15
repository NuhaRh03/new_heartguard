'use client';

import { useParams, notFound } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import {
  getDatabase,
  ref,
  onValue,
} from 'firebase/database';
import {
  useDoc,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import { getPatientStatusFromSensorData, type Patient, type SensorData } from '@/lib/types';
import { PatientInfoCard } from './_components/patient-info-card';
import { DashboardLayout } from '@/components/dashboard-layout';
import { VitalsMonitor } from './_components/vitals-monitor';
import { SensorHistory } from './_components/sensor-history';
import { AnomalyDetector } from './_components/anomaly-detector';
import { PatientHeader } from './_components/patient-header';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Decrypted Data structure from the device
interface DecryptedReading {
    BPM: number;
    TempDHT: number;
    Hum: number;
    TempDS: number;
    Gaz: number;
}


async function decryptOnServer(cipherB64: string): Promise<string> {
    const response = await fetch('/api/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cipherB64 }),
    });
    if (!response.ok) {
        throw new Error('Decryption failed on server');
    }
    const data = await response.json();
    return data.plaintext;
}


export default function PatientPage() {
  const params = useParams() as any;
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;

  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [docChecked, setDocChecked] = useState(false);

  // ---------- 1) Patient from Firestore ----------
  const patientDocRef = useMemoFirebase(() => {
    if (!firestore || !id || isUserLoading) return null;
    return doc(firestore, 'patients', id);
  }, [firestore, id, isUserLoading]);

  const {
    data: patient,
    isLoading: isLoadingPatient,
    error: patientError,
  } = useDoc<Patient>(patientDocRef, () => setDocChecked(true));

  // ---------- 2) Sensor data from Realtime Database ----------
  const [sensorHistory, setSensorHistory] = useState<SensorData[] | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    if (!id || !user) return; // Wait for patient ID and authenticated user

    const db = getDatabase();
    // Path: /iot_data/data
    const streamRef = ref(db, `/iot_data/data`);

    const unsubscribe = onValue(
      streamRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const cipherB64 = snapshot.val();
          try {
            const plaintext = await decryptOnServer(cipherB64);
            const decrypted: DecryptedReading = JSON.parse(plaintext);
            
            const newReading: Omit<SensorData, 'id'> = {
              timestamp: new Date().toISOString(),
              heartRate: decrypted.BPM,
              patientTemperature: decrypted.TempDS,
              roomTemperature: decrypted.TempDHT,
              roomHumidity: decrypted.Hum,
              gasValue: decrypted.Gaz,
              roomOxygen: 0, // No O2 data in this stream, default to 0
              collectedBy: 'device-iot-01', // Or some device identifier
            };

            // Prepend new reading to history
            setSensorHistory(prev => {
                const newHistory = [
                    { ...newReading, id: `reading-${Date.now()}` }, 
                    ...(prev || [])
                ];
                // Keep history to a reasonable size, e.g., 20 readings
                return newHistory.slice(0, 20);
            });

          } catch (error) {
            console.error("Failed to process sensor data:", error);
          }
        }
        setIsLoadingHistory(false);
      },
      (error) => {
        console.error('Error loading sensor data from RTDB:', error);
        setIsLoadingHistory(false);
      }
    );

    return () => unsubscribe();
  }, [id, user]);

   // ---------- 3) Update patient's latest data in Firestore ----------
   useEffect(() => {
    if (id && sensorHistory && sensorHistory.length > 0 && firestore) {
      const latestReading = sensorHistory[0];
      const latestStatus = getPatientStatusFromSensorData(latestReading);

      // Check if an update is needed to avoid unnecessary writes
      if (!patient || latestReading.timestamp !== patient.lastReadingAt || patient.status !== latestStatus) {
         updateDoc(doc(firestore, 'patients', id), {
            latestSensorData: latestReading,
            lastReadingAt: latestReading.timestamp,
            status: latestStatus,
        }).catch(err => console.error("Failed to update patient latest data:", err));
      }
    }
  }, [id, sensorHistory, firestore, patient]);


  // ---------- 4) Loading / errors / 404 ----------
  const isStillLoading = isUserLoading || isLoadingPatient || (patientDocRef && !docChecked);

  if (!isStillLoading && !patient) {
    notFound();
  }

  if (isStillLoading || !patient) {
    return (
      <DashboardLayout>
        <main className="p-4 sm:px-6 sm:py-0 md:gap-8 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
            <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
              </div>
              <Skeleton className="h-96 rounded-xl" />
            </div>
            <div className="grid auto-rows-max items-start gap-4 md:gap-8">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  if (patientError) {
    return (
      <DashboardLayout>
        <main className="min-h-screen flex items-center justify-center">
          <div className="border rounded-xl p-6 text-sm text-red-600 max-w-md">
            <p className="font-semibold mb-1">Error</p>
            <p>{patientError.message}</p>
          </div>
        </main>
      </DashboardLayout>
    );
  }
  
  // ---------- 5) Page layout ----------
  return (
    <DashboardLayout>
      <main className="p-4 sm:px-6 sm:py-0 md:gap-8 space-y-4">
        <PatientHeader patient={patient} />
        <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <VitalsMonitor patient={patient} />
            <SensorHistory sensorHistory={sensorHistory} isLoading={isLoadingHistory} />
          </div>
          <div className="grid auto-rows-max items-start gap-4 md:gap-8">
            <AnomalyDetector patient={patient} sensorHistory={sensorHistory} />
            <PatientInfoCard patient={patient} />
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
