
'use client';

import { useParams, notFound } from 'next/navigation';
import { collection, doc, query, orderBy, limit } from 'firebase/firestore';
import { useDoc, useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { Patient, SensorData } from '@/lib/types';
import { PatientInfoCard } from './_components/patient-info-card';
import { DashboardLayout } from '@/components/dashboard-layout';
import { VitalsMonitor } from './_components/vitals-monitor';
import { SensorHistory } from './_components/sensor-history';
import { AnomalyDetector } from './_components/anomaly-detector';
import { PatientHeader } from './_components/patient-header';

export default function PatientPage() {
  const params = useParams<{ id: string }>();
  const id = String(params.id);
  const firestore = useFirestore();
  const { user } = useUser();

  // Memoized reference to the patient document
  const patientDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'patients', id);
  }, [firestore, id]);

  const {
    data: patient,
    isLoading: isLoadingPatient,
    error: patientError,
  } = useDoc<Patient>(patientDocRef);

  // Memoized query for the sensor data subcollection
  const sensorDataQuery = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return query(
      collection(firestore, `patients/${id}/sensorData`),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
  }, [firestore, id]);

  const {
    data: sensorHistory,
    isLoading: isLoadingHistory,
  } = useCollection<SensorData>(sensorDataQuery);

  // If after loading, the patient doesn't exist, show 404
  // We also check ownership here as a secondary client-side check.
  // The primary security is Firestore rules.
  if (!isLoadingPatient && (!patient || (patient && user && patient.createdBy !== user.uid))) {
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
    // This case will likely be caught by the notFound() above, but is here as a fallback.
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
