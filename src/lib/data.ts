import type { DoctorProfile, Patient, SensorReading, PatientStatus } from './types';
import { subMinutes } from 'date-fns';

export const doctorProfile: DoctorProfile = {
  id: 'doc1',
  name: 'Dr. Evelyn Reed',
  age: 42,
  license: 'MD-12345',
  email: 'e.reed@pulseguard.io'
};

const generateSensorData = (count: number, baseline: Partial<SensorReading>): SensorReading[] => {
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

// This is now mock data, the app will use Firestore
export const patients: Patient[] = [
  {
    id: '1',
    name: 'John Smith',
    age: 68,
    gender: 'Male',
    doctorId: 'doc1',
    contact: {
      phone: '555-0101',
      email: 'john.smith@example.com',
    },
    emergencyContact: {
      name: 'Jane Smith',
      relation: 'Wife',
      phone: '555-0102',
    },
    medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
    currentMedications: ['Lisinopril', 'Metformin'],
    sensorData: generateSensorData(100, {
      o2Level: 97,
      roomTemperature: 22,
      patientTemperature: 37.0,
      heartRate: 75,
      roomHumidity: 45,
    }),
  },
];
