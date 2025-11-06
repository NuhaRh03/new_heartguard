import type { DoctorProfile, Patient, SensorData } from './types';
import { subMinutes } from 'date-fns';

export const doctorProfile: Omit<DoctorProfile, 'id'> = {
  name: 'Dr. Evelyn Reed',
  age: 42,
  dateOfBirth: '1982-03-15',
  speciality: 'Cardiology',
  idCardNumber: 'DOC-12345'
};

export const generateSensorData = (count: number, baseline: Partial<SensorData>): SensorData[] => {
  const data: SensorData[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const timestamp = subMinutes(now, (count - i) * 5).toISOString();
    
    const isAnomaly = i > count - 10 && Math.random() < 0.2;
    const isCritical = isAnomaly && Math.random() < 0.3;

    data.push({
      id: `sensor-${i}`,
      patientId: 'patient-1', // Mock patient ID
      timestamp,
      o2Level: (baseline.o2Level || 98) + (isCritical ? -5 : isAnomaly ? -2 : 0) + (Math.random() * 2 - 1),
      temperature: (baseline.temperature || 37) + (isCritical ? 1.5 : isAnomaly ? 0.8 : 0) + (Math.random() * 0.4 - 0.2),
      heartbeat: (baseline.heartbeat || 75) + (isCritical ? 20 : isAnomaly ? 10 : 0) + (Math.random() * 6 - 3),
      humidity: (baseline.humidity || 45) + (Math.random() * 2 - 1),
      gazLevel: (baseline.gazLevel || 0) + (Math.random() * 5),
    });
  }
  return data;
};
