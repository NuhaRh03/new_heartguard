
'use client';
import { notFound, useParams } from "next/navigation";
import { PatientHeader } from "./_components/patient-header";
import { VitalsMonitor } from "./_components/vitals-monitor";
import { PatientInfoCard } from "./_components/patient-info-card";
import { AnomalyDetector } from "./_components/anomaly-detector";
import type { Patient } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function PatientPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const params = useParams();
  const patientId = params.id as string;

  const patientDocRef = useMemoFirebase(() => {
      if (!firestore || !user || !patientId) return null;
      return doc(firestore, `patients/${patientId}`);
  }, [firestore, user, patientId]);

  const { data: patient, isLoading: isPatientLoading } = useDoc<Patient>(patientDocRef);

  const handleStartSensors = () => {
    if (!user || !patient || !patientDocRef) return;

    toast({
      title: "Sensors Activated",
      description: `Live sensor monitoring has started for ${patient.name}.`,
    });

    const sensorData = {
      heart_beat: 75 + Math.round(Math.random() * 10 - 5),
      o2_level: 97 + Math.random() * 2 - 1,
      humidity: 45 + Math.round(Math.random() * 10 - 5),
      room_temperature: 24 + Math.random() * 2 - 1,
    };
    
    // Update the patient document with the new sensor data map
    updateDocumentNonBlocking(patientDocRef, {
      sensors: sensorData,
      last_update: new Date().toISOString()
    });
  }

  // First, handle the loading state
  if (isPatientLoading) {
    return (
      <DashboardLayout>
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
               <Skeleton className="h-[300px] w-full" />
            </div>
            <div className="space-y-6 lg:col-span-1">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // After loading, if patient is still null, it means it wasn't found or user doesn't have permission
  if (!patient) {
    notFound();
  }
  
  // If we get here, patient exists.
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex justify-between items-start">
          <PatientHeader patient={patient} />
          <Button onClick={handleStartSensors}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Start Sensors
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          <div className="md:col-span-3 lg:col-span-3">
            <VitalsMonitor patient={patient} />
          </div>
          <div className="space-y-6 lg:col-span-1">
            <AnomalyDetector patient={patient} />
            <PatientInfoCard patient={patient} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
