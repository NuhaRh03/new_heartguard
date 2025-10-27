import type { DoctorProfile, Patient, SensorReading, PatientStatus } from './types';
import { subMinutes } from 'date-fns';

export const doctorProfile: DoctorProfile = {
  id: 'doc1',
  name: 'Dr. Evelyn Reed',
  age: 42,
  license: 'MD-12345',
  email: 'e.reed@pulseguard.io'
};

export const generateSensorData = (count: number, baseline: Partial<SensorReading>): SensorReading[] => {
  const data: SensorReading[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const timestamp = subMinutes(now, (count - i) * 5).toISOString();
    
    const isAnomaly = i > count - 10 && Math.random() < 0.2;
    const isCritical = isAnomaly && Math.random() < 0.3;

    data.push({
      timestamp,
      o2Level: baseline.o2Level! + (isCritical ? -5 : isAnomaly ? -2 : 0) + (Math.random() * 2 - 1),
      roomTemperature: baseline.roomTemperature! + (Math.random() * 0.5 - 0.25),
      patientTemperature: baseline.patientTemperature! + (isCritical ? 1.5 : isAnomaly ? 0.8 : 0) + (Math.random() * 0.4 - 0.2),
      heartRate: baseline.heartRate! + (isCritical ? 20 : isAnomaly ? 10 : 0) + (Math.random() * 6 - 3),
      roomHumidity: baseline.roomHumidity! + (Math.random() * 2 - 1),
    });
  }
  return data;
};
