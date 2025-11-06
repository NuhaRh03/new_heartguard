"use client";

import type { Patient, SensorData } from "@/lib/types";
import { useEffect, useState } from "react";
import { VitalCard } from "./vital-card";
import { Heart, Thermometer, Droplets } from "lucide-react";
import { useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, limit, query, orderBy } from "firebase/firestore";

interface VitalsMonitorProps {
  patient: Patient;
}

const O2Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M12 15a3 3 0 0 0-3 3c0 1.7 1.3 3 3 3s3-1.3 3-3a3 3 0 0 0-3-3Z"/><path d="M12 12v-1"/><path d="M12 8V7"/><path d="M12 4V3"/><path d="M18.8 17.5a3 3 0 0 1-2.1 2.1"/><path d="M17.5 5.2a3 3 0 0 1 2.1 2.1"/><path d="M5.2 6.5a3-3 0 0 1 2.1-2.1"/><path d="M6.5 18.8a3 3 0 0 1-2.1-2.1"/></svg>
);


const GazIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M4 14h16"/><path d="M6 14l-2 5h16l-2-5"/><path d="M6 11h12v-1a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3v1Z"/></svg>
);

const CHART_DATA_POINTS = 30;

export function VitalsMonitor({ patient }: VitalsMonitorProps) {
  const firestore = useFirestore();
  const { user } = useAuth();
  
  const sensorDataQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, `doctors/${user.uid}/patients/${patient.id}/sensorData`),
      orderBy('timestamp', 'desc'),
      limit(CHART_DATA_POINTS)
    );
  }, [firestore, user, patient.id]);

  const { data: sensorData, isLoading } = useCollection<SensorData>(sensorDataQuery);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!sensorData || sensorData.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sensorData.length);
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [sensorData]);

  if (isLoading) {
    return <div>Loading vitals...</div>;
  }
  
  const reversedSensorData = sensorData ? [...sensorData].reverse() : [];
  const currentData = reversedSensorData[currentIndex];


  if (!currentData) {
    return <div>No vitals data available.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <VitalCard
        title="Heartbeat"
        value={currentData.heartbeat}
        unit="bpm"
        Icon={Heart}
        data={reversedSensorData}
        dataKey="heartbeat"
        color="hsl(var(--chart-1))"
        normalRange={[60, 100]}
      />
      <VitalCard
        title="O2 Saturation"
        value={currentData.o2Level}
        unit="%"
        Icon={O2Icon}
        data={reversedSensorData}
        dataKey="o2Level"
        color="hsl(var(--chart-2))"
        normalRange={[95, 100]}
      />
      <VitalCard
        title="Temperature"
        value={currentData.temperature}
        unit="°C"
        Icon={Thermometer}
        data={reversedSensorData}
        dataKey="temperature"
        color="hsl(var(--chart-3))"
        normalRange={[36.5, 37.5]}
      />
       <VitalCard
        title="Humidity"
        value={currentData.humidity}
        unit="%"
        Icon={Droplets}
        data={reversedSensorData}
        dataKey="humidity"
        color="hsl(var(--chart-4))"
        normalRange={[30, 60]}
      />
       <VitalCard
        title="Gas Level"
        value={currentData.gazLevel}
        unit="ppm"
        Icon={GazIcon}
        data={reversedSensorData}
        dataKey="gazLevel"
        color="hsl(var(--chart-5))"
        normalRange={[0, 10]}
      />
    </div>
  );
}
