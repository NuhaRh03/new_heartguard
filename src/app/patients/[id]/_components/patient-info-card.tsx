import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
            <InfoRow icon={<Phone size={14}/>} label="Emergency Contact" value={patient.emergencyContactNumber} />
        </div>
        
        {patient.historicalDisease && (
          <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2"><FileText size={16} /> Medical History</h3>
              <p className="text-sm text-muted-foreground">{patient.historicalDisease}</p>
          </div>
        )}

        {patient.medicines && (
          <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2"><Pill size={16} /> Current Medications</h3>
              <p className="text-sm text-muted-foreground">{patient.medicines}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
