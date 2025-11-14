'use server';
/**
 * @fileOverview Uses a generative AI tool to learn patterns of physiological data, proactively recognize when a patient's condition could be starting to deteriorate, and generate alerts if the anomaly level rises above a set level.
 *
 * - predictiveAnomalyDetection - A function that handles the anomaly detection process.
 * - PredictiveAnomalyDetectionInput - The input type for the predictiveAnomalyDetection function.
 * - PredictiveAnomalyDetectionOutput - The return type for the predictiveAnomalyDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveAnomalyDetectionInputSchema = z.object({
  patientId: z.string().describe('The ID of the patient.'),
  sensorData: z.array(
    z.object({
      timestamp: z.string().describe('The timestamp of the sensor reading.'),
      o2Level: z.number().describe('The oxygen level of the patient.'),
      roomTemperature: z.number().describe('The room temperature.'),
      patientTemperature: z.number().describe('The patient temperature.'),
      roomHumidity: z.number().describe('The room humidity.'),
    })
  ).describe('An array of sensor data for the patient.'),
  alertThreshold: z.number().describe('The threshold for anomaly level to trigger an alert.'),
});
export type PredictiveAnomalyDetectionInput = z.infer<typeof PredictiveAnomalyDetectionInputSchema>;

const PredictiveAnomalyDetectionOutputSchema = z.object({
  anomalyLevel: z.number().describe('The anomaly level detected in the sensor data.'),
  alertTriggered: z.boolean().describe('Whether an alert was triggered based on the anomaly level and threshold.'),
  explanation: z.string().describe('An explanation of why the anomaly level was detected.'),
});
export type PredictiveAnomalyDetectionOutput = z.infer<typeof PredictiveAnomalyDetectionOutputSchema>;

export async function predictiveAnomalyDetection(input: PredictiveAnomalyDetectionInput): Promise<PredictiveAnomalyDetectionOutput> {
  return predictiveAnomalyDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveAnomalyDetectionPrompt',
  input: {schema: PredictiveAnomalyDetectionInputSchema},
  output: {schema: PredictiveAnomalyDetectionOutputSchema},
  prompt: `You are an AI assistant specializing in detecting anomalies in patient sensor data.

  Analyze the provided sensor data for patient {{patientId}} and determine the anomaly level.

  Sensor Data:
  {{#each sensorData}}
  - Timestamp: {{timestamp}}, O2 Level: {{o2Level}}, Room Temperature: {{roomTemperature}}, Patient Temperature: {{patientTemperature}}, Room Humidity: {{roomHumidity}}
  {{/each}}

  Consider the relationships between different sensor readings and identify any unusual patterns or deviations from the norm.

  Based on the anomaly level and the alert threshold of {{alertThreshold}}, determine whether an alert should be triggered.

  Explain the reasons for the detected anomaly level and whether an alert was triggered.

  Output in JSON format:
  { 
    anomalyLevel: number,
    alertTriggered: boolean,
    explanation: string
  }
  `,
});

const predictiveAnomalyDetectionFlow = ai.defineFlow(
  {
    name: 'predictiveAnomalyDetectionFlow',
    inputSchema: PredictiveAnomalyDetectionInputSchema,
    outputSchema: PredictiveAnomalyDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
