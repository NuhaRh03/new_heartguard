'use client';
import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { Textarea } from "./ui/textarea";


const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format."}),
  emergencyContactNumber: z.string().min(10, "Enter a valid phone number."),
  historicalDisease: z.string().optional(),
  medicines: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface AddPatientDialogProps {
  doctorId: string;
}


export function AddPatientDialog({ doctorId }: AddPatientDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const firestore = useFirestore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const onSubmit = (data: PatientFormData) => {
    startTransition(() => {
        const patientData = {
            ...data,
            id: '', // Firestore will generate this
            sensorData: [], // Start with no sensor data
        };

        const patientsCollection = collection(firestore, `doctors/${doctorId}/patients`);
        addDocumentNonBlocking(patientsCollection, patientData);
        
        toast({
            title: "Patient Added",
            description: `${data.name} has been added to your patient list.`,
        });

        reset();
        setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Enter the details for the new patient.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
              {errors.dateOfBirth && <p className="text-destructive text-sm mt-1">{errors.dateOfBirth.message}</p>}
            </div>
            <div>
              <Label htmlFor="emergencyContactNumber">Emergency Contact</Label>
              <Input id="emergencyContactNumber" {...register("emergencyContactNumber")} />
              {errors.emergencyContactNumber && <p className="text-destructive text-sm mt-1">{errors.emergencyContactNumber.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="historicalDisease">Historical Diseases</Label>
            <Textarea id="historicalDisease" {...register("historicalDisease")} placeholder="e.g., Hypertension, Diabetes" />
            {errors.historicalDisease && <p className="text-destructive text-sm mt-1">{errors.historicalDisease.message}</p>}
          </div>
          <div>
            <Label htmlFor="medicines">Current Medicines</Label>
            <Textarea id="medicines" {...register("medicines")} placeholder="e.g., Lisinopril, Metformin" />
            {errors.medicines && <p className="text-destructive text-sm mt-1">{errors.medicines.message}</p>}
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? 'Adding Patient...' : 'Add Patient'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
