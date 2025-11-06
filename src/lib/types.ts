
export interface DoctorProfile {
  id: string;
  name: string;
  dateOfBirth: string;
  age: number;
  speciality: string;
  idCardNumber: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  dateOfBirth: string;
  emergencyContactNumber: string;
  historicalDisease: string;
  medicines: string;
  sensorData: SensorData[];
}

// Re-using PatientProfile and naming it Patient for component compatibility
export type Patient = PatientProfile;


export interface SensorData {
  id: string;
  patientId: string;
  o2Level: number;
  gazLevel: number;
  heartbeat: number;
  temperature: number;
  humidity: number;
  timestamp: string;
}

export interface PatientStatus {
  level: 'stable' | 'warning' | 'critical' | 'unknown';
  label: string;
}

export const getPatientStatusFromReading = (reading: SensorData): PatientStatus => {
  if (reading.o2Level < 92 || reading.heartbeat > 120 || reading.heartbeat < 50 || reading.temperature > 38.5) {
    return { level: 'critical', label: 'Critical' };
  }
  if (reading.o2Level < 95 || reading.heartbeat > 100 || reading.heartbeat < 60 || reading.temperature > 37.8) {
    return { level: 'warning', label: 'Warning' };
  }
  return { level: 'stable', label: 'Stable' };
};
