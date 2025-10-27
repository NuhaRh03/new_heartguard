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
import { ArrowRight } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { AddPatientDialog } from "@/components/add-patient-dialog";
import { Patient, getPatientStatusFromReading } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const patientImages = PlaceHolderImages.filter(p => p.id.startsWith('patient-'));
  const firestore = useFirestore();

  const patientsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "patients"));
  }, [firestore]);

  const { data: patients, isLoading } = useCollection<Patient>(patientsQuery);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
        <AddPatientDialog />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Patients</CardTitle>
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
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && patients?.map((patient, index) => {
                const latestReading = patient.sensorData?.[patient.sensorData.length - 1];
                const status = latestReading ? getPatientStatusFromReading(latestReading) : { level: 'unknown', label: 'No Data' };
                const patientImage = patientImages.find(img => img.id === `patient-${(patient.id.charCodeAt(0) % 4) + 1}`);

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
                      {patient.age}
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
                      {latestReading?.heartRate ? `${latestReading.heartRate.toFixed(0)} bpm` : 'N/A'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {latestReading?.o2Level ? `${latestReading.o2Level.toFixed(0)}%` : 'N/A'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {latestReading?.patientTemperature ? latestReading.patientTemperature.toFixed(1) : 'N/A'}
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
        </CardContent>
      </Card>
    </div>
  );
}
