

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { getPatientStatusFromReading, type Patient } from "@/lib/types";

interface PatientHeaderProps {
  patient: Patient;
}

function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  const latestReading = patient.sensorData?.[patient.sensorData.length - 1];
  const status = latestReading ? getPatientStatusFromReading(latestReading) : { level: 'unknown', label: 'No Data' };
  const patientImage = PlaceHolderImages.find(p => p.id === `patient-1`);
  
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={patientImage?.imageUrl} alt={patient.name} data-ai-hint={patientImage?.imageHint}/>
        <AvatarFallback className="text-2xl">
          {patient.name.split(" ").map((n) => n[0]).join("")}
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{patient.name}</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>{calculateAge(patient.dateOfBirth)} years old</span>
           <span>&bull;</span>
           <Badge
              variant={
                status.level === "critical"
                  ? "destructive"
                  : status.level === "warning"
                  ? "secondary"
                  : "default"
              }
              className={status.level === "stable" ? "bg-accent text-accent-foreground" : status.level === 'warning' ? 'bg-yellow-500 text-white' : ''}
            >
              {status.label}
            </Badge>
        </div>
      </div>
    </div>
  );
}
