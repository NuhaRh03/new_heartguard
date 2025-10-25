
'use client';
import { notFound } from "next/navigation";
import { PatientHeader } from "./_components/patient-header";
import { VitalsMonitor } from "./_components/vitals-monitor";
import { PatientInfoCard } from "./_components/patient-info-card";
import { AnomalyDetector } from "./_components/anomaly-detector";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Patient } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemoFirebase } from "@/firebase/provider";

interface PatientPageProps {
  params: {
    id: string;
  };
}

export default function PatientPage({ params }: PatientPageProps) {
  const firestore = useFirestore();

  const patientRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, "patients", params.id);
  }, [firestore, params.id]);

  const { data: patient, isLoading } = useDoc<Patient>(patientRef);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-6 md:col-span-3 lg:col-span-3">
             <div className="grid gap-4 md:grid-cols-2">
                {Array.from({length: 4}).map((_,i) => <Skeleton key={i} className="h-[126px] w-full" />)}
             </div>
          </div>
          <div className="space-y-6 lg:col-span-1">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <PatientHeader patient={patient} />
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        <div className="space-y-6 md:col-span-3 lg:col-span-3">
          {patient.sensorData && patient.sensorData.length > 0 ? (
            <VitalsMonitor patient={patient} />
          ) : (
             <div className="grid gap-4 md:grid-cols-2">
                <p>No sensor data available for this patient.</p>
             </div>
          )}
        </div>
        <div className="space-y-6 lg:col-span-1">
           {patient.sensorData && patient.sensorData.length > 0 ? (
            <AnomalyDetector patient={patient} />
          ) : (
            <p>No sensor data to analyze.</p>
          )}
          <PatientInfoCard patient={patient} />
        </div>
      </div>
    </div>
  );
}
