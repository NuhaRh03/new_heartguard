"use client";

import type { Patient } from "@/lib/types";
import { VitalCard } from "./vital-card";
import { Thermometer, Droplets, HeartPulse, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VitalsMonitorProps {
  patient: Patient;
}

const GasIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M4 14h4v4" /><path d="M6 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" /><path d="M12 17h4v4" /><path d="M14 15a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" /><path d="M19 13h4v4" /><path d="M21 11a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" /><path d="M4 7h16" /><path d="M7 4h10" /><path d="M10 4a2 2 0 1 0-4 0" /></svg>
);

export function VitalsMonitor({ patient }: VitalsMonitorProps) {
  const currentData = patient.latestSensorData;

  if (!currentData) {
    return (
        <Card className="rounded-xl">
            <CardHeader>
                <CardTitle>Live Vitals</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-12 text-muted-foreground">No sensor data available. Click "Start Sensors" to see live data.</div>
            </CardContent>
        </Card>
    );
  }

  const chartData = [{ ...currentData, timestamp: patient.lastReadingAt || new Date().toISOString() }];

  return (
    <Card className="rounded-xl">
        <CardHeader>
            <CardTitle>Live Vitals</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <VitalCard
            title="Heart Rate"
            value={currentData.heartRate}
            unit="bpm"
            Icon={HeartPulse}
            data={chartData}
            dataKey="heartRate"
            color="hsl(var(--chart-1))"
            normalRange={[60, 100]}
          />
          <VitalCard
            title="Patient Temperature"
            value={currentData.patientTemperature}
            unit="°C"
            Icon={Thermometer}
            data={chartData}
            dataKey="patientTemperature"
            color="hsl(var(--chart-2))"
            normalRange={[36.5, 37.5]}
          />
          <VitalCard
            title="Room Temperature"
            value={currentData.roomTemperature}
            unit="°C"
            Icon={Thermometer}
            data={chartData}
            dataKey="roomTemperature"
            color="hsl(var(--chart-3))"
            normalRange={[20, 25]}
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
           <VitalCard
            title="Room O₂"
            value={currentData.roomOxygen}
            unit="%"
            Icon={Wind}
            data={chartData}
            dataKey="roomOxygen"
            color="hsl(var(--chart-5))"
            normalRange={[20, 22]}
          />
          <VitalCard
            title="Air Quality"
            value={currentData.gasValue}
            unit="ppm"
            Icon={GasIcon}
            data={chartData}
            dataKey="gasValue"
            color="hsl(var(--foreground))"
            normalRange={[0, 1000]}
          />
        </CardContent>
    </Card>
  );
}
