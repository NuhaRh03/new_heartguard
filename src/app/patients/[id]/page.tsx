
'use client';

import { useParams, notFound } from 'next/navigation';
import { VitalsMonitor } from "./_components/vitals-monitor";
import { AnomalyDetector } from './_components/anomaly-detector';
import { SensorHistory } from './_components/sensor-history';
import { PatientInfoCard } from './_components/patient-info-card';
import type { Patient, SensorData } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoc, useFirestore, useMemoFirebase, useUser, useCollection } from "@/firebase";
import { doc, updateDoc, collection, query, limit, orderBy, addDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { DashboardLayout } from '@/components/dashboard-layout';
import { getPatientStatusFromSensorData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import { useTransition } from 'react';

// This function simulates a device sending a new reading
const generateSingleSensorReading = (baseline: Partial<SensorData>): Omit<SensorData, 'id' | 'timestamp' | 'collectedBy'> => {
  return {
    heartRate: (baseline.heartRate || 75) + (Math.random() * 6 - 3),
    roomOxygen: (baseline.roomOxygen || 20.9) + (Math.random() * 0.2 - 0.1),
    roomHumidity: (baseline.roomHumidity || 45) + (Math.random() * 10 - 5),
    roomTemperature: (baseline.roomTemperature || 24) + (Math.random() * 0.4 - 0.2),
    patientTemperature: (baseline.patientTemperature || 37.0) + (Math.random() * 0.5 - 0.25),
    gasValue: (baseline.gasValue || 300) + (Math.random() * 50 - 25),
  };
};

export default function PatientPage() {
  const params = useParams();
  const patientId = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();

  const patientDocRef = useMemoFirebase(() => {
    if (!firestore || !patientId) return null;
    return doc(firestore, `patients/${patientId}`);
  }, [firestore, patientId]);

  const sensorHistoryQuery = useMemoFirebase(() => {
    if (!patientDocRef) return null;
    return query(collection(patientDocRef, 'sensorData'), orderBy('timestamp', 'desc'), limit(10));
  }, [patientDocRef]);

  const { data: patient, isLoading: isPatientLoading } = useDoc<Patient>(patientDocRef);
  const { data: sensorHistory, isLoading: isHistoryLoading } = useCollection<SensorData>(sensorHistoryQuery);

  const handleStartSensors = () => {
    if (!firestore || !patient || !user) return;
    startTransition(async () => {
      const newReadingData = generateSingleSensorReading(patient.latestSensorData || {});
      const readingStatus = getPatientStatusFromSensorData(newReadingData as SensorData);
      
      const batch = writeBatch(firestore);

      // 1. Add new reading to subcollection
      const newReadingRef = doc(collection(firestore, `patients/${patient.id}/sensorData`));
      batch.set(newReadingRef, {
        ...newReadingData,
        timestamp: serverTimestamp(),
        collectedBy: user.uid
      });

      // 2. Update the patient's latest data and status
      batch.update(patientDocRef, {
        latestSensorData: newReadingData,
        status: readingStatus,
        lastReadingAt: serverTimestamp()
      });
      
      await batch.commit();
    });
  };

  const isLoading = isPatientLoading || isHistoryLoading;

  // After loading, if patient is still null, then it's a 404
  if (!isPatientLoading && !patient) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : patient ? (
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <div className="lg:col-span-1 md:col-span-3 space-y-4">
              <PatientInfoCard patient={patient} />
              <AnomalyDetector patient={patient} sensorHistory={sensorHistory} />
            </div>
            <div className="lg:col-span-3 md:col-span-3 space-y-4">
              <div className="flex items-center justify-end">
                <Button onClick={handleStartSensors} disabled={isPending}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  {isPending ? 'Sending...' : 'Start Sensors (Simulate)'}
                </Button>
              </div>
              <VitalsMonitor patient={patient} />
              <SensorHistory sensorHistory={sensorHistory} isLoading={isHistoryLoading} />
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
