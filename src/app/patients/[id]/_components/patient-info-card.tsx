import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, FileText, Pill } from "lucide-react";
import type { Patient } from "@/lib/types";

interface PatientInfoCardProps {
  patient: Patient;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-1">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function PatientInfoCard({ patient }: PatientInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><User size={16} /> Contact Details</h3>
            <InfoRow icon={<Phone size={14}/>} label="Emergency Contact" value={patient.emergencyContact} />
        </div>
        
        {patient.historical_diseases && patient.historical_diseases.length > 0 && (
          <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2"><FileText size={16} /> Medical History</h3>
              <p className="text-sm text-muted-foreground">{patient.historical_diseases.join(', ')}</p>
          </div>
        )}

        {patient.current_medications && patient.current_medications.length > 0 && (
          <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2"><Pill size={16} /> Current Medications</h3>
              <p className="text-sm text-muted-foreground">{patient.current_medications.join(', ')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
