import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, FileText, Pill } from "lucide-react";
import type { Patient } from "@/lib/types";

interface PatientInfoCardProps {
  patient: Patient;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
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
            <InfoRow icon={<Mail size={14}/>} label="Email" value={patient.contact.email} />
            <InfoRow icon={<Phone size={14}/>} label="Phone" value={patient.contact.phone} />
        </div>
        <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-destructive/80"><User size={16} /> Emergency Contact</h3>
            <InfoRow icon={<User size={14}/>} label="Name" value={`${patient.emergencyContact.name} (${patient.emergencyContact.relation})`} />
            <InfoRow icon={<Phone size={14}/>} label="Phone" value={patient.emergencyContact.phone} />
        </div>
        <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><FileText size={16} /> Medical History</h3>
            <div className="flex flex-wrap gap-2">
                {patient.medicalHistory.map(item => <Badge key={item} variant="secondary">{item}</Badge>)}
            </div>
        </div>
        <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Pill size={16} /> Current Medications</h3>
            <div className="flex flex-wrap gap-2">
                {patient.currentMedications.map(item => <Badge key={item} variant="outline">{item}</Badge>)}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
