'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WandSparkles, TriangleAlert, ShieldCheck } from 'lucide-react';
import { runAnomalyDetection } from '../actions';
import type { Patient, SensorData } from '@/lib/types';
import type { PredictiveAnomalyDetectionOutput } from '@/ai/flows/predictive-anomaly-detection';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface AnomalyDetectorProps {
  patient: Patient;
  sensorHistory: SensorData[] | null;
}

export function AnomalyDetector({ patient, sensorHistory }: AnomalyDetectorProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<PredictiveAnomalyDetectionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDetection = () => {
    if (!sensorHistory || sensorHistory.length === 0) {
        toast({ variant: "destructive", title: "No sensor data to analyze."});
        return;
    }
    setError(null);
    startTransition(async () => {
      // The AI flow expects a different data structure, so we need to map our sensor data
      const formattedSensorData = sensorHistory.map(d => ({
        timestamp: d.timestamp,
        o2Level: d.roomOxygen, // AI model refers to o2Level
        roomTemperature: d.roomTemperature,
        patientTemperature: d.patientTemperature,
        roomHumidity: d.roomHumidity,
      }));

      const response = await runAnomalyDetection({
        patientId: patient.id,
        sensorData: formattedSensorData,
        alertThreshold: 7, // Example threshold
      });

      if (response.success && response.data) {
        setResult(response.data);
        if(response.data.alertTriggered) {
          toast({
            variant: "destructive",
            title: "AI Alert Triggered!",
            description: `Anomaly level of ${response.data.anomalyLevel.toFixed(1)} detected for ${patient.name}.`,
          });
        }
      } else {
        setError(response.error);
        toast({
          variant: "destructive",
          title: "An Error Occurred",
          description: response.error,
        });
      }
    });
  };

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WandSparkles className="text-primary" />
          Predictive Anomaly Detection
        </CardTitle>
        <CardDescription>
          Use AI to analyze recent sensor data for hidden patterns and potential issues.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleDetection} disabled={isPending || !sensorHistory || sensorHistory.length === 0} className="w-full">
          {isPending ? 'Analyzing...' : 'Run AI Analysis'}
        </Button>

        {isPending && (
          <div className="flex items-center justify-center space-x-2">
            <WandSparkles className="animate-pulse text-primary" />
            <p className="text-sm text-muted-foreground">AI is analyzing historical data...</p>
          </div>
        )}

        {error && (
            <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Analysis Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        
        {result && (
          <div className='space-y-4'>
            <Alert variant={result.alertTriggered ? "destructive" : "default"} className={!result.alertTriggered ? 'bg-accent/20 rounded-xl' : 'rounded-xl'}>
              {result.alertTriggered ? <TriangleAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4 text-accent" />}
              <AlertTitle>Analysis Complete</AlertTitle>
              <AlertDescription>{result.explanation}</AlertDescription>
            </Alert>
            
            <div className='space-y-2'>
              <div className='flex justify-between items-center text-sm'>
                <span className='font-medium'>Anomaly Level</span>
                <Badge variant={result.alertTriggered ? 'destructive' : 'secondary'} className={!result.alertTriggered ? 'bg-accent text-accent-foreground' : ''}>{result.anomalyLevel.toFixed(1)} / 10</Badge>
              </div>
              <Progress value={result.anomalyLevel * 10} />
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
}
