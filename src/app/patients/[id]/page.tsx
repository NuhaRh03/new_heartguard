
'use client';
import { notFound } from "next/navigation";
import { PatientHeader } from "./_components/patient-header";
import { VitalsMonitor } from "./_components/vitals-monitor";
import { PatientInfoCard } from "./_components/patient-info-card";
import { AnomalyDetector } from "./_components/anomaly-detector";
import type { Patient, SensorData } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoc, useFirestore, useMemoFirebase, addDocumentNonBlocking, useCollection } from "@/firebase";
import { doc, collection, query, orderBy, limit }from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { DashboardLayout } from "@/components/dashboard-layout";

interface PatientPageProps {
  params: {
    id: string;
  };
}

export default function PatientPage({ params }: PatientPageProps) {
  const firestore = useFirestore();
  const { user } = useAuth();
  const { toast } = useToast();

  const patientDocRef = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return doc(firestore, `patients/${params.id}`);
  }, [firestore, user, params.id]);

  const { data: patient, isLoading: isPatientLoading } = useDoc<Patient>(patientDocRef);

  // Fetch the latest sensor reading separately for the header status
  const latestReadingQuery = useMemoFirebase(() => {
    if (!firestore || !user || !patient) return null;
    return query(collection(firestore, `patients/${patient.id}/sensorData`), orderBy('timestamp', 'desc'), limit(1));
  }, [firestore, user, patient]);

  const { data: latestReadings } = useCollection<SensorData>(latestReadingQuery);
  const latestReading = latestReadings?.[0];

  const handleStartSensors = () => {
    if (!user || !patient) return;

    toast({
      title: "Sensors Activated",
      description: `Live sensor monitoring has started for ${patient.name}.`,
    });

    // Example of adding a new sensor reading.
    const sensorData: Omit<SensorData, 'id'> = {
      timestamp: new Date().toISOString(),
      heartRate: 75 + Math.round(Math.random() * 10 - 5),
      roomOxygen: 20.9 + Math.random() * 0.2 - 0.1,
      roomHumidity: 45 + Math.round(Math.random() * 10 - 5),
      roomTemperature: 24 + Math.random() * 2 - 1,
      collectedBy: user.uid,
    };
    
    const sensorDataCollection = collection(firestore, `patients/${patient.id}/sensorData`);
    addDocumentNonBlocking(sensorDataCollection, sensorData);
  }

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
      </DashboardLayout>
    );
  }

  if (!patient) {
    notFound();
  }

  // Security check: Make sure the logged-in user is the one who created the patient record.
  if (patient.createdBy !== user?.uid) {
     notFound(); // Or show an "Access Denied" page
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex justify-between items-start">
          <PatientHeader patient={patient} latestReading={latestReading} />
          <Button onClick={handleStartSensors}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Start Sensors
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-6 md:col-span-3 lg:col-span-3">
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
