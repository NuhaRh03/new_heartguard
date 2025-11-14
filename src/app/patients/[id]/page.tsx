
'use client';

import { useParams, notFound } from 'next/navigation';
import { doc } from 'firebase/firestore';
import {
  getDatabase,
  ref,
  onValue,
  query as rtdbQuery,
  limitToLast,
} from 'firebase/database';
import {
  useDoc,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import type { Patient, SensorData } from '@/lib/types';
import { PatientInfoCard } from './_components/patient-info-card';
import { DashboardLayout } from '@/components/dashboard-layout';
import { VitalsMonitor } from './_components/vitals-monitor';
import { SensorHistory } from './_components/sensor-history';
import { AnomalyDetector } from './_components/anomaly-detector';
import { PatientHeader } from './_components/patient-header';
import { useEffect, useState } from 'react';

export default function PatientPage() {
  const params = useParams<{ id: string }>();
  const id = String(params.id);
  const firestore = useFirestore();

  // ---------- 1) Patient from Firestore ----------
  const patientDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'patients', id);
  }, [firestore, id]);

  const {
    data: patient,
    isLoading: isLoadingPatient,
    error: patientError,
  } = useDoc<Patient>(patientDocRef);

  // ---------- 2) Sensor data from Realtime Database ----------
  const [sensorHistory, setSensorHistory] = useState<SensorData[] | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    if (!id) return;

    try {
      const db = getDatabase();
      // Path: streams/{patientId}
      const streamsRef = ref(db, `streams/${id}`);
      // Get the last 10 readings for the patient
      const q = rtdbQuery(streamsRef, limitToLast(10));

      const unsubscribe = onValue(
        q,
        (snapshot) => {
          const readings: SensorData[] = [];
          if (snapshot.exists()) {
            snapshot.forEach((readingSnap) => {
              const readingVal = readingSnap.val() as Omit<SensorData, 'id'>;
              readings.push({
                id: readingSnap.key || `${id}-${Date.now()}`,
                ...readingVal
              });
            });
          }
          
          // Sort descending by timestamp
          readings.sort((a, b) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          });

          setSensorHistory(readings);
          setIsLoadingHistory(false);
        },
        (error) => {
          console.error('Error loading sensor data from RTDB:', error);
          setIsLoadingHistory(false);
        }
      );

      return () => {
        unsubscribe();
      };
    } catch (error) {
        console.error("Firebase Realtime Database might not be initialized:", error);
        setIsLoadingHistory(false);
    }
  }, [id]);

   // ---------- 3) Update patient's latest data in Firestore ----------
   useEffect(() => {
    if (patient && sensorHistory && sensorHistory.length > 0) {
      const latestReading = sensorHistory[0];
      const latestStatus = getPatientStatusFromSensorData(latestReading);

      if (latestReading.timestamp !== patient.lastReadingAt || patient.status !== latestStatus) {
         const patientRef = doc(firestore, 'patients', patient.id);
         
         // Use the browser's import to avoid server-side issues
         import('firebase/firestore').then(({ updateDoc }) => {
            updateDoc(patientRef, {
                latestSensorData: {
                    ...latestReading,
                },
                lastReadingAt: latestReading.timestamp,
                status: latestStatus,
            }).catch(err => console.error("Failed to update patient latest data:", err));
         });
      }
    }
  }, [patient, sensorHistory, firestore]);

  // ---------- 4) Loading / errors / 404 ----------
  if (!isLoadingPatient && !patient) {
    notFound();
  }

  const isLoading = isLoadingPatient;

  if (isLoading) {
    return (
      <DashboardLayout>
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading patient…</p>
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

  if (!patient) {
    return (
      <DashboardLayout>
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No patient data found.
          </p>
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
            <PatientInfoCard patient={patient} />
            <AnomalyDetector patient={patient} sensorHistory={sensorHistory} />
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
