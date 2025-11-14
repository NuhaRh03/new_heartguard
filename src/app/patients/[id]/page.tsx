
'use client';

import { useParams, notFound } from 'next/navigation';
import { collection, doc, query, orderBy, limit, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useDoc, useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { Patient, SensorData } from '@/lib/types';
import { PatientInfoCard } from './_components/patient-info-card';
import { DashboardLayout } from '@/components/dashboard-layout';
import { VitalsMonitor } from './_components/vitals-monitor';
import { SensorHistory } from './_components/sensor-history';
import { AnomalyDetector } from './_components/anomaly-detector';
import { PatientHeader } from './_components/patient-header';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getPatientStatusFromSensorData } from '@/lib/types';

export default function PatientPage() {
  const params = useParams<{ id: string }>();
  const id = String(params.id);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [isSensing, setIsSensing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const sensorIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
  
  const handleStartSensors = () => {
    if (!user || !patientDocRef) return;
    setIsSensing(true);
    toast({ title: 'Sensor simulation started.' });

    sensorIntervalRef.current = setInterval(() => {
      startTransition(async () => {
        const newSensorReading: Omit<SensorData, 'id'> = {
          timestamp: new Date().toISOString(),
          heartRate: 70 + Math.random() * 10 - 5,
          roomOxygen: 20.5 + Math.random() * 0.5 - 0.25,
          roomHumidity: 45 + Math.random() * 10 - 5,
          roomTemperature: 22 + Math.random() * 2 - 1,
          patientTemperature: 36.5 + Math.random() * 1.5 - 0.5,
          gasValue: 300 + Math.random() * 50 - 25,
          collectedBy: user.uid,
        };

        const sensorDataCollection = collection(firestore, patientDocRef.path, 'sensorData');
        await addDoc(sensorDataCollection, newSensorReading);
        
        const newStatus = getPatientStatusFromSensorData(newSensorReading);
        
        // Update the parent patient document with the latest data
        await updateDoc(patientDocRef, {
            latestSensorData: newSensorReading,
            lastReadingAt: newSensorReading.timestamp,
            status: newStatus,
        });

      });
    }, 5000); // Add a new reading every 5 seconds
  };
  
  const handleStopSensors = () => {
    setIsSensing(false);
    toast({ title: 'Sensor simulation stopped.' });
    if (sensorIntervalRef.current) {
      clearInterval(sensorIntervalRef.current);
      sensorIntervalRef.current = null;
    }
  };

  useEffect(() => {
    // Cleanup interval on component unmount
    return () => {
      if (sensorIntervalRef.current) {
        clearInterval(sensorIntervalRef.current);
      }
    };
  }, []);


  // If after loading, the patient doesn't exist, show 404
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
                <Card>
                    <CardHeader>
                        <CardTitle>Sensor Controls</CardTitle>
                        <CardDescription>Simulate real-time sensor data for this patient.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <Button onClick={handleStartSensors} disabled={isSensing || isPending} className="w-full">
                            <Play className="mr-2"/>
                            Start Sensors
                        </Button>
                        <Button onClick={handleStopSensors} disabled={!isSensing || isPending} variant="outline" className="w-full">
                            <Square className="mr-2"/>
                            Stop Sensors
                        </Button>
                    </CardContent>
                </Card>
                <PatientInfoCard patient={patient} />
                <AnomalyDetector patient={patient} sensorHistory={sensorHistory} />
            </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
