'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ArrowRight, PlusCircle } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Patient, getPatientStatusFromReading } from "@/lib/types";
import { useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function DashboardPage() {
  const patientImages = PlaceHolderImages.filter(p => p.id.startsWith('patient-'));
  const firestore = useFirestore();
  const { user } = useAuth();

  const patientsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `doctors/${user.uid}/patients`);
  }, [firestore, user]);

  const { data: patients, isLoading } = useCollection<Omit<Patient, 'id'>>(patientsQuery);

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };


  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
          <Button asChild>
            <Link href="/patients/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Patient
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>My Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden md:table-cell">Age</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Heart Rate</TableHead>
                  <TableHead className="hidden lg:table-cell">O2 Level</TableHead>
                  <TableHead className="hidden md:table-cell">Temp (°C)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage />
                          <AvatarFallback>...</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">Loading...</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">...</TableCell>
                    <TableCell><Badge>Loading...</Badge></TableCell>
                    <TableCell className="hidden lg:table-cell">...</TableCell>
                    <TableCell className="hidden lg:table-cell">...</TableCell>
                    <TableCell className="hidden md:table-cell">...</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm" disabled>View</Button></TableCell>
                  </TableRow>
                ))}
                {!isLoading && patients?.map((patient, index) => {
                  const latestReading = patient.sensorData?.[patient.sensorData.length - 1];
                  const status = latestReading ? getPatientStatusFromReading(latestReading) : { level: 'unknown', label: 'No Data' };
                  const imageIndex = index % patientImages.length;
                  const patientImage = patientImages[imageIndex];
                  const age = calculateAge(patient.dateOfBirth);

                  return (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={patientImage?.imageUrl} alt={patient.name} data-ai-hint={patientImage?.imageHint}/>
                            <AvatarFallback>
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{patient.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {age}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {latestReading?.heartbeat ? `${latestReading.heartbeat.toFixed(0)} bpm` : 'N/A'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {latestReading?.o2Level ? `${latestReading.o2Level.toFixed(0)}%` : 'N/A'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {latestReading?.temperature ? latestReading.temperature.toFixed(1) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/patients/${patient.id}`}>
                            View <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
             {!isLoading && patients?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <h3 className="text-lg font-semibold">No Patients Found</h3>
                <p className="text-sm">Click "Add Patient" to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
