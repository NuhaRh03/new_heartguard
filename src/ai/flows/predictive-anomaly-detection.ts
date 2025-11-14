'use server';
/**nn
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
      heartRate: z.number().describe('The heart rate of the patient in beats per minute.'),
      o2Saturation: z.number().describe('The O2 saturation of the patient in percent.'),
      roomTemperature: z.number().describe('The room temperature in Celsius.'),
      patientTemperature: z.number().describe('The patient temperature in Celsius.'),
      roomHumidity: z.number().describe('The room humidity in percent.'),
    })
  ).describe('An array of sensor data for the patient.'),
  alertThreshold: z.number().describe('The threshold for anomaly level to trigger an alert.'),
});
export type PredictiveAnomalyDetectionInput = z.infer<typeof PredictiveAnomalyDetectionInputSchema>;

const PredictiveAnomalyDetectionOutputSchema = z.object({
  anomalyLevel: z.number().describe('The anomaly level detected in the sensor data on a scale of 0-10.'),
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

  Analyze the provided sensor data for patient {{patientId}} and determine the anomaly level on a scale of 0 (no anomaly) to 10 (critical anomaly).

  Sensor Data:
  {{#each sensorData}}
  - Timestamp: {{timestamp}}, Heart Rate: {{heartRate}} bpm, Patient Temp: {{patientTemperature}}°C, Room Temp: {{roomTemperature}}°C, O₂ Saturation: {{o2Saturation}}%, Room Humidity: {{roomHumidity}}%
  {{/each}}

  Consider the relationships between different sensor readings and identify any unusual patterns or deviations from the norm. A high patient temperature, low O2 saturation, or very high/low heart rate are significant indicators.

  Based on the anomaly level and the alert threshold of {{alertThreshold}}, determine whether an alert should be triggered.

  Provide a concise, one-sentence explanation for your analysis.
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
