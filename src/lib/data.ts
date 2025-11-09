import type { DoctorProfile, Patient, SensorData } from './types';
import { subMinutes } from 'date-fns';

export const doctorProfile: Omit<DoctorProfile, 'id'> = {
  name: 'Dr. Evelyn Reed',
  age: 42,
  dateOfBirth: '1982-03-15',
  speciality: 'Cardiology',
  idCardNumber: 'DOC-12345'
};

export const generateSensorData = (count: number, baseline: Partial<SensorData>, doctorId: string): Omit<SensorData, 'id'>[] => {
  const data: Omit<SensorData, 'id'>[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const timestamp = subMinutes(now, (count - i) * 5).toISOString();
    
    const isAnomaly = i > count - 10 && Math.random() < 0.2;
    const isCritical = isAnomaly && Math.random() < 0.3;

    data.push({
      timestamp,
      heartRate: (baseline.heartRate || 75) + (isCritical ? 20 : isAnomaly ? 10 : 0) + (Math.random() * 6 - 3),
      roomOxygen: (baseline.roomOxygen || 20.9) + (isCritical ? -1 : isAnomaly ? -0.5 : 0) + (Math.random() * 0.2 - 0.1),
      roomHumidity: (baseline.roomHumidity || 45) + (Math.random() * 10 - 5),
      roomTemperature: (baseline.roomTemperature || 24) + (isCritical ? 1.5 : isAnomaly ? 0.8 : 0) + (Math.random() * 0.4 - 0.2),
      collectedBy: doctorId,
    });
  }
  return data;
};
