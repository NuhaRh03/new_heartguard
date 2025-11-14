
export interface DoctorProfile {
  id: string;
  name: string;
  dateOfBirth: string;
  age: number;
  speciality: string;
  idCardNumber: string;
}

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  emergencyContact: string;
  historicalDiseases: string[];
  currentMedications: string[];
  createdBy: string; 
  status?: 'stable' | 'warning' | 'critical' | 'unknown';
  lastReadingAt?: string; // ISO string
  latestSensorData?: Omit<SensorData, 'id'>;
}

export interface SensorData {
  id: string;
  timestamp: string; // ISO string
  heartRate: number;
  roomOxygen: number;
  roomHumidity: number;
  roomTemperature: number;
  patientTemperature: number;
  gasValue: number;
  collectedBy: string;
}


export interface PatientStatus {
  level: 'stable' | 'warning' | 'critical' | 'unknown';
  label: string;
}

export const getPatientStatusFromSensorData = (reading: Omit<SensorData, 'id'>): PatientStatus['level'] => {
  if (reading.heartRate < 40 || reading.heartRate > 140 || reading.patientTemperature > 39.5 || reading.gasValue > 800) {
    return 'critical';
  }
  if (reading.heartRate < 50 || reading.heartRate > 120 || reading.patientTemperature > 38.5 || reading.gasValue > 600) {
    return 'warning';
  }
  return 'stable';
};


export const getPatientStatusAppearance = (status?: Patient['status']): PatientStatus => {
  switch (status) {
    case 'critical':
      return { level: 'critical', label: 'Critical' };
    case 'warning':
      return { level: 'warning', label: 'Warning' };
    case 'stable':
      return { level: 'stable', label: 'Stable' };
    default:
      return { level: 'unknown', label: 'No Data' };
  }
};
