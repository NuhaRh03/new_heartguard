'use client';
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking, useUser, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Patient } from "@/lib/types";


const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  date_of_birth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format."}),
  emergency_contact: z.string().min(10, "Enter a valid phone number."),
  historical_diseases: z.string().optional(),
  current_medications: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function AddPatientPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: doctor } = useUser();
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
        // This is an incomplete patient record according to your new schema
        // It's missing `last_update` and `sensors` which should be added when sensors start
        const patientData: Omit<Patient, 'id' | 'last_update' | 'sensors'> = {
            name: data.name,
            date_of_birth: data.date_of_birth,
            emergency_contact: data.emergency_contact,
            historical_diseases: data.historical_diseases ? data.historical_diseases.split(',').map(s => s.trim()).filter(Boolean) : [],
            current_medications: data.current_medications ? data.current_medications.split(',').map(s => s.trim()).filter(Boolean) : [],
            createdBy: doctor.uid,
        };

        const patientsCollection = collection(firestore, 'patients');
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
                                <Label htmlFor="date_of_birth">Date of Birth</Label>
                                <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
                                {errors.date_of_birth && <p className="text-destructive text-sm mt-1">{errors.date_of_birth.message}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emergency_contact">Emergency Contact Number</Label>
                            <Input id="emergency_contact" {...register("emergency_contact")} placeholder="e.g. +212612345678"/>
                            {errors.emergency_contact && <p className="text-destructive text-sm mt-1">{errors.emergency_contact.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="historical_diseases">Historical Diseases (comma-separated)</Label>
                            <Textarea id="historical_diseases" {...register("historical_diseases")} placeholder="e.g., Diabetes, Asthma" />
                            {errors.historical_diseases && <p className="text-destructive text-sm mt-1">{errors.historical_diseases.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="current_medications">Current Medications (comma-separated)</Label>
                            <Textarea id="current_medications" {...register("current_medications")} placeholder="e.g., Metformin, Lisinopril" />
                            {errors.current_medications && <p className="text-destructive text-sm mt-1">{errors.current_medications.message}</p>}
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
