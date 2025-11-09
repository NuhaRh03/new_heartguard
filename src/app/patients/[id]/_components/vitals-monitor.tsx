"use client";

import type { Patient, SensorData } from "@/lib/types";
import { VitalCard } from "./vital-card";
import { Heart, Thermometer, Droplets } from "lucide-react";

interface VitalsMonitorProps {
  patient: Patient;
}

const O2Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M12 15a3 3 0 0 0-3 3c0 1.7 1.3 3 3 3s3-1.3 3-3a3 3 0 0 0-3-3Z"/><path d="M12 12v-1"/><path d="M12 8V7"/><path d="M12 4V3"/><path d="M18.8 17.5a3 3 0 0 1-2.1 2.1"/><path d="M17.5 5.2a3 3 0 0 1 2.1 2.1"/><path d="M5.2 6.5a3-3 0 0 1 2.1-2.1"/><path d="M6.5 18.8a3 3 0 0 1-2.1-2.1"/></svg>
);


const GazIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M4 14h16"/><path d="M6 14l-2 5h16l-2-5"/><path d="M6 11h12v-1a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3v1Z"/></svg>
);


export function VitalsMonitor({ patient }: VitalsMonitorProps) {
  const currentData = patient.sensors;

  if (!currentData) {
    return <div className="text-center py-12 text-muted-foreground">No sensor data available. Click "Start Sensors" to see live data.</div>;
  }

  // Since we only have one data point, we pass an array with that single point to the chart
  const chartData = [{ ...currentData, timestamp: patient.last_update || new Date().toISOString() }];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <VitalCard
        title="Heart Rate"
        value={currentData.heart_beat}
        unit="bpm"
        Icon={Heart}
        data={chartData}
        dataKey="heart_beat"
        color="hsl(var(--chart-1))"
        normalRange={[60, 100]}
      />
      <VitalCard
        title="O2 Level"
        value={currentData.o2_level}
        unit="%"
        Icon={O2Icon}
        data={chartData}
        dataKey="o2_level"
        color="hsl(var(--chart-2))"
        normalRange={[95, 100]}
      />
      <VitalCard
        title="Room Temperature"
        value={currentData.room_temperature}
        unit="°C"
        Icon={Thermometer}
        data={chartData}
        dataKey="room_temperature"
        color="hsl(var(--chart-3))"
        normalRange={[20, 25]}
      />
       <VitalCard
        title="Room Humidity"
        value={currentData.humidity}
        unit="%"
        Icon={Droplets}
        data={chartData}
        dataKey="humidity"
        color="hsl(var(--chart-4))"
        normalRange={[30, 60]}
      />
       <VitalCard
        title="Gas Level (Placeholder)"
        value={0}
        unit="ppm"
        Icon={GazIcon}
        data={chartData}
        dataKey={"gazLevel" as any}
        color="hsl(var(--chart-5))"
        normalRange={[0, 10]}
      />
    </div>
  );
}
