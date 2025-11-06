'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Award, Mail, User, Cake, VenetianMask } from "lucide-react";
import { useAuth, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { DoctorProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function ProfilePage() {
  const doctorImage = PlaceHolderImages.find(p => p.id === 'doctor-avatar');
  const { user } = useAuth();
  const firestore = useFirestore();

  const doctorDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `doctors/${user.uid}`);
  },[firestore, user]);

  const { data: doctorProfile, isLoading } = useDoc<DoctorProfile>(doctorDocRef);


  if (isLoading || !doctorProfile) {
    return (
        <DashboardLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <h1 className="text-3xl font-bold tracking-tight">Doctor Profile</h1>
                 <Card className="max-w-2xl mx-auto">
                    <CardHeader className="text-center">
                        <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                        <Skeleton className="h-8 w-48 mx-auto" />
                        <Skeleton className="h-4 w-32 mx-auto mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h1 className="text-3xl font-bold tracking-tight">Doctor Profile</h1>
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
                  <AvatarImage src={doctorImage?.imageUrl} alt={doctorProfile.name} data-ai-hint={doctorImage?.imageHint} />
                  <AvatarFallback className="text-3xl">{doctorProfile.name.split(" ").map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
            <CardTitle className="text-2xl">{doctorProfile.name}</CardTitle>
            <CardDescription>ID Card: {doctorProfile.idCardNumber}</CardDescription>
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
                  <Cake className="text-muted-foreground" />
                  <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-semibold">{new Date(doctorProfile.dateOfBirth).toLocaleDateString()}</p>
                  </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-md border bg-secondary/50">
                  <Mail className="text-muted-foreground" />
                  <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold">{user?.email}</p>
                  </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-md border bg-secondary/50">
                  <Award className="text-muted-foreground" />
                  <div>
                      <p className="text-sm text-muted-foreground">Specialty</p>
                      <p className="font-semibold">{doctorProfile.speciality}</p>
                  </div>
              </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
