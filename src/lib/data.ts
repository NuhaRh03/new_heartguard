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

const arabicNames = [
  "خالد الأحمد", "فاطمة العبدالله", "علي الحسن", "عائشة علي", "محمد محمد", "زينب السيد", "يوسف المحمود", "مريم الأحمد"
];

export const mockPatients: Patient[] = arabicNames.map((name, index) => ({
    id: `patient-${index + 1}`,
    name,
    age: Math.floor(Math.random() * 60) + 20,
    gender: Math.random() > 0.5 ? 'Male' : 'Female',
    doctorId: 'doc1',
    contact: {
        phone: `555-01${Math.floor(Math.random() * 90) + 10}`,
        email: `patient.${index + 1}@example.com`
    },
    emergencyContact: {
        name: "قريب",
        relation: "Friend",
        phone: `555-02${Math.floor(Math.random() * 90) + 10}`
    },
    medicalHistory: ['Hypertension'],
    currentMedications: ['Lisinopril'],
    sensorData: generateSensorData(100, {
        o2Level: 97,
        roomTemperature: 22,
        patientTemperature: 37.0,
        heartRate: 75,
        roomHumidity: 45,
    }),
}));
