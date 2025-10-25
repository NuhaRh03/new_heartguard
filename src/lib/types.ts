export interface DoctorProfile {
  id: string;
  name: string;
  age: number;
  license: string;
  email: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  doctorId: string;
  contact: {
    phone: string;
    email: string;
  };
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  medicalHistory: string[];
  currentMedications: string[];
  sensorData: SensorReading[];
}

export interface SensorReading {
  timestamp: string;
  o2Level: number;
  roomTemperature: number;
  patientTemperature: number;
  heartRate: number;
  roomHumidity: number;
}

export interface PatientStatus {
  level: 'stable' | 'warning' | 'critical' | 'unknown';
  label: string;
}

export const getPatientStatusFromReading = (reading: SensorReading): PatientStatus => {
  if (reading.o2Level < 92 || reading.heartRate > 120 || reading.heartRate < 50 || reading.patientTemperature > 38.5) {
    return { level: 'critical', label: 'Critical' };
  }
  if (reading.o2Level < 95 || reading.heartRate > 100 || reading.heartRate < 60 || reading.patientTemperature > 37.8) {
    return { level: 'warning', label: 'Warning' };
  }
  return { level: 'stable', label: 'Stable' };
};
