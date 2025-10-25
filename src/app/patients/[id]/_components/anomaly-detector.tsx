'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WandSparkles, TriangleAlert, ShieldCheck } from 'lucide-react';
import { runAnomalyDetection } from '../actions';
import type { Patient } from '@/lib/types';
import type { PredictiveAnomalyDetectionOutput } from '@/ai/flows/predictive-anomaly-detection';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface AnomalyDetectorProps {
  patient: Patient;
}

export function AnomalyDetector({ patient }: AnomalyDetectorProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<PredictiveAnomalyDetectionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDetection = () => {
    setError(null);
    startTransition(async () => {
      // For demonstration, we'll use the latest 20 readings.
      const sensorData = patient.sensorData.slice(-20).map(d => ({
        ...d,
        o2Level: Math.round(d.o2Level),
        heartRate: Math.round(d.heartRate),
      }));

      const response = await runAnomalyDetection({
        patientId: patient.id,
        sensorData,
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
    <Card>
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
        <Button onClick={handleDetection} disabled={isPending} className="w-full">
          {isPending ? 'Analyzing...' : 'Run AI Analysis'}
        </Button>

        {isPending && (
          <div className="flex items-center justify-center space-x-2">
            <WandSparkles className="animate-pulse text-primary" />
            <p className="text-sm text-muted-foreground">AI is analyzing the latest 20 data points...</p>
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
            <Alert variant={result.alertTriggered ? "destructive" : "default"} className={!result.alertTriggered ? 'bg-accent/20' : ''}>
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
