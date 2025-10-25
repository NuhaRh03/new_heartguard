"use client";

import type { Patient, SensorReading } from "@/lib/types";
import { useEffect, useState } from "react";
import { VitalCard } from "./vital-card";
import { Heart, Thermometer, Droplets, Gauge } from "lucide-react";

interface VitalsMonitorProps {
  patient: Patient;
}

const O2Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M12 15a3 3 0 0 0-3 3c0 1.7 1.3 3 3 3s3-1.3 3-3a3 3 0 0 0-3-3Z"/><path d="M12 12v-1"/><path d="M12 8V7"/><path d="M12 4V3"/><path d="M18.8 17.5a3 3 0 0 1-2.1 2.1"/><path d="M17.5 5.2a3 3 0 0 1 2.1 2.1"/><path d="M5.2 6.5a3 3 0 0 1 2.1-2.1"/><path d="M6.5 18.8a3 3 0 0 1-2.1-2.1"/></svg>
);


const CHART_DATA_POINTS = 30;

export function VitalsMonitor({ patient }: VitalsMonitorProps) {
  const [currentIndex, setCurrentIndex] = useState(patient.sensorData.length - CHART_DATA_POINTS);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= patient.sensorData.length) {
          // Loop back for demo purposes
          return patient.sensorData.length - CHART_DATA_POINTS;
        }
        return nextIndex;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [patient.sensorData.length]);

  const currentData = patient.sensorData[currentIndex];
  const chartData = patient.sensorData.slice(
    Math.max(0, currentIndex - CHART_DATA_POINTS + 1),
    currentIndex + 1
  );

  if (!currentData) {
    return <div>Loading vitals...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <VitalCard
        title="Heart Rate"
        value={currentData.heartRate}
        unit="bpm"
        Icon={Heart}
        data={chartData}
        dataKey="heartRate"
        color="hsl(var(--chart-1))"
        normalRange={[60, 100]}
      />
      <VitalCard
        title="O2 Saturation"
        value={currentData.o2Level}
        unit="%"
        Icon={O2Icon}
        data={chartData}
        dataKey="o2Level"
        color="hsl(var(--chart-2))"
        normalRange={[95, 100]}
      />
      <VitalCard
        title="Patient Temperature"
        value={currentData.patientTemperature}
        unit="°C"
        Icon={Thermometer}
        data={chartData}
        dataKey="patientTemperature"
        color="hsl(var(--chart-3))"
        normalRange={[36.5, 37.5]}
      />
      <VitalCard
        title="Room Humidity"
        value={currentData.roomHumidity}
        unit="%"
        Icon={Droplets}
        data={chartData}
        dataKey="roomHumidity"
        color="hsl(var(--chart-4))"
        normalRange={[30, 60]}
      />
    </div>
  );
}
