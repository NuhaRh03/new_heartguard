import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { doctorProfile } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Award, Mail, User } from "lucide-react";

export default function ProfilePage() {
  const doctorImage = PlaceHolderImages.find(p => p.id === 'doctor-avatar');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="text-3xl font-bold tracking-tight">Doctor Profile</h1>
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
                <AvatarImage src={doctorImage?.imageUrl} alt={doctorProfile.name} data-ai-hint={doctorImage?.imageHint} />
                <AvatarFallback className="text-3xl">{doctorProfile.name.split(" ").map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
          <CardTitle className="text-2xl">{doctorProfile.name}</CardTitle>
          <CardDescription>Medical License: {doctorProfile.license}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-md border bg-secondary/50">
                <User className="text-muted-foreground" />
                <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-semibold">{doctorProfile.age}</p>
                </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-md border bg-secondary/50">
                <Mail className="text-muted-foreground" />
                <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{doctorProfile.email}</p>
                </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-md border bg-secondary/50">
                <Award className="text-muted-foreground" />
                <div>
                    <p className="text-sm text-muted-foreground">Specialty</p>
                    <p className="font-semibold">Cardiology & Internal Medicine</p>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
