'use client';
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking, useAuth, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";


const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format."}),
  emergencyContactNumber: z.string().min(10, "Enter a valid phone number."),
  historicalDisease: z.string().optional(),
  medicines: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function AddPatientPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: doctor } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const onSubmit = (data: PatientFormData) => {
    if (!doctor) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to add a patient."});
        return;
    }

    startTransition(async () => {
        const patientData = {
            ...data,
            sensorData: [], // Start with no sensor data
        };

        const patientsCollection = collection(firestore, `doctors/${doctor.uid}/patients`);
        await addDocumentNonBlocking(patientsCollection, patientData);
        
        toast({
            title: "Patient Added",
            description: `${data.name} has been added to your patient list.`,
        });

        reset();
        router.push('/');
    });
  };

  return (
    <DashboardLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Add New Patient</h1>
            </div>
            <Card className="max-w-4xl">
                <CardHeader>
                    <CardTitle>Patient Details</CardTitle>
                    <CardDescription>Enter the details for the new patient below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" {...register("name")} placeholder="e.g. John Doe" />
                                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                                {errors.dateOfBirth && <p className="text-destructive text-sm mt-1">{errors.dateOfBirth.message}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emergencyContactNumber">Emergency Contact Number</Label>
                            <Input id="emergencyContactNumber" {...register("emergencyContactNumber")} placeholder="e.g. (123) 456-7890"/>
                            {errors.emergencyContactNumber && <p className="text-destructive text-sm mt-1">{errors.emergencyContactNumber.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="historicalDisease">Historical Diseases</Label>
                            <Textarea id="historicalDisease" {...register("historicalDisease")} placeholder="e.g., Hypertension, Diabetes" />
                            {errors.historicalDisease && <p className="text-destructive text-sm mt-1">{errors.historicalDisease.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="medicines">Current Medications</Label>
                            <Textarea id="medicines" {...register("medicines")} placeholder="e.g., Lisinopril, Metformin" />
                            {errors.medicines && <p className="text-destructive text-sm mt-1">{errors.medicines.message}</p>}
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Adding Patient...' : 'Add Patient'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    </DashboardLayout>
  );
}
