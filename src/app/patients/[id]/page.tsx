
'use client';
import { notFound, useParams } from "next/navigation";
import { PatientHeader } from "./_components/patient-header";
import { VitalsMonitor } from "./_components/vitals-monitor";
import { PatientInfoCard } from "./_components/patient-info-card";
import { AnomalyDetector } from "./_components/anomaly-detector";
import type { Patient, SensorData } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, addDoc, updateDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getPatientStatusFromSensorData } from "@/lib/types";
import { SensorHistory } from "./_components/sensor-history";

export default function PatientPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const params = useParams();
  const patientId = params.id as string;

  const patientDocRef = useMemoFirebase(() => {
      if (!firestore || !patientId) return null;
      return doc(firestore, `patients/${patientId}`);
  }, [firestore, patientId]);

  const { data: patient, isLoading: isPatientLoading } = useDoc<Patient>(patientDocRef);

  const sensorDataColRef = useMemoFirebase(() => {
    if (!firestore || !patientId) return null;
    return collection(firestore, `patients/${patientId}/sensorData`);
  }, [firestore, patientId]);

  const recentSensorDataQuery = useMemoFirebase(() => {
    if (!sensorDataColRef) return null;
    return query(sensorDataColRef, orderBy("timestamp", "desc"), limit(10));
  }, [sensorDataColRef]);

  const { data: sensorHistory, isLoading: isHistoryLoading } = useCollection<SensorData>(recentSensorDataQuery);


  const handleStartSensors = async () => {
    if (!user || !patient || !sensorDataColRef || !patientDocRef) return;

    toast({
      title: "Sensors Activated",
      description: `Live sensor monitoring has started for ${patient.name}.`,
    });

    // Simulate new sensor data based on your snippet
    const now = new Date();
    const newSensorReading: Omit<SensorData, 'id'> = {
      timestamp: now.toISOString(),
      heartRate: 75 + (Math.random() * 10 - 5),
      roomOxygen: 20.9 + (Math.random() * 0.2 - 0.1),
      roomHumidity: 45 + (Math.random() * 10 - 5),
      roomTemperature: 24 + (Math.random() * 2 - 1),
      patientTemperature: 37 + (Math.random() * 0.5 - 0.25),
      gasValue: 300 + (Math.random() * 100 - 50),
      collectedBy: user.uid,
    };
    
    // Add the new reading to the subcollection
    const docRef = await addDoc(sensorDataColRef, newSensorReading);
    const readingWithId = { ...newSensorReading, id: docRef.id };

    // Determine status from the new reading
    const status = getPatientStatusFromSensorData(readingWithId);

    // Update the main patient document
    await updateDoc(patientDocRef, {
      status: status,
      lastReadingAt: now.toISOString(),
      latestSensorData: newSensorReading,
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
          <div className="md:col-span-3 lg:col-span-3 space-y-6">
            <VitalsMonitor patient={patient} />
            <SensorHistory sensorHistory={sensorHistory} isLoading={isHistoryLoading} />
          </div>
          <div className="space-y-6 lg:col-span-1">
            <AnomalyDetector patient={patient} sensorHistory={sensorHistory} />
            <PatientInfoCard patient={patient} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
