
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
  createdAt: string;
  createdBy: string; // UID of the doctor who created the patient
}

export interface SensorData {
  id: string;
  timestamp: string;
  heartRate: number;
  roomOxygen: number;
  roomHumidity: number;
  roomTemperature: number;
  collectedBy: string; // UID of the doctor who collected the data
}


export interface PatientStatus {
  level: 'stable' | 'warning' | 'critical' | 'unknown';
  label: string;
}

export const getPatientStatusFromReading = (reading: SensorData): PatientStatus => {
  // Note: These thresholds are examples. The new schema doesn't have patient-specific vitals like O2 level or temp.
  // This function is now based on heartRate only.
  if (reading.heartRate > 120 || reading.heartRate < 50) {
    return { level: 'critical', label: 'Critical' };
  }
  if (reading.heartRate > 100 || reading.heartRate < 60) {
    return { level: 'warning', label: 'Warning' };
  }
  return { level: 'stable', label: 'Stable' };
};
