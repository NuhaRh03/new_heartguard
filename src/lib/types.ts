
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
  date_of_birth: string;
  emergency_contact: string;
  historical_diseases: string[];
  current_medications: string[];
  last_update?: string; // or a Timestamp type if you prefer
  createdBy: string; // UID of the doctor who created the patient
  sensors?: {
    heart_beat: number;
    humidity: number;
    o2_level: number;
    room_temperature: number;
  };
}

// This is now part of the Patient type, but we can keep it for status calculation
export interface SensorData {
  heart_beat: number;
  o2_level: number;
  room_temperature: number;
  humidity: number;
}


export interface PatientStatus {
  level: 'stable' | 'warning' | 'critical' | 'unknown';
  label: string;
}

export const getPatientStatusFromReading = (reading: SensorData): PatientStatus => {
  if (reading.heart_beat > 120 || reading.heart_beat < 50 || reading.o2_level < 90) {
    return { level: 'critical', label: 'Critical' };
  }
  if (reading.heart_beat > 100 || reading.heart_beat < 60 || reading.o2_level < 94) {
    return { level: 'warning', label: 'Warning' };
  }
  return { level: 'stable', label: 'Stable' };
};
