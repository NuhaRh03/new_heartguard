
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  age: z.coerce.number().min(0, "Age must be a positive number.").max(120),
  gender: z.enum(["Male", "Female", "Other"]),
  contactPhone: z.string().min(10, "Enter a valid phone number."),
  contactEmail: z.string().email("Enter a valid email."),
  emergencyContactName: z.string().min(2, "Name must be at least 2 characters."),
  emergencyContactRelation: z.string().min(2, "Relation must be at least 2 characters."),
  emergencyContactPhone: z.string().min(10, "Enter a valid phone number."),
});

type PatientFormData = z.infer<typeof patientSchema>;

export function AddPatientDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: "Male"
    }
  });

  const onSubmit = (data: PatientFormData) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to add a patient.' });
        return;
    }
    startTransition(() => {
        const patientData = {
            name: data.name,
            age: data.age,
            gender: data.gender,
            doctorId: user.uid,
            contact: {
                phone: data.contactPhone,
                email: data.contactEmail,
            },
            emergencyContact: {
                name: data.emergencyContactName,
                relation: data.emergencyContactRelation,
                phone: data.emergencyContactPhone,
            },
            medicalHistory: [], // Default empty values
            currentMedications: [],
            sensorData: [],
            createdAt: serverTimestamp(),
        };

        const patientsCollection = collection(firestore, 'patients');
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
          <h3 className="font-semibold text-lg">Patient Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" {...register("age")} />
              {errors.age && <p className="text-destructive text-sm mt-1">{errors.age.message}</p>}
            </div>
            <div>
                <Label htmlFor="gender">Gender</Label>
                <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                 {errors.gender && <p className="text-destructive text-sm mt-1">{errors.gender.message}</p>}
            </div>
             <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input id="contactPhone" {...register("contactPhone")} />
              {errors.contactPhone && <p className="text-destructive text-sm mt-1">{errors.contactPhone.message}</p>}
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input id="contactEmail" type="email" {...register("contactEmail")} />
              {errors.contactEmail && <p className="text-destructive text-sm mt-1">{errors.contactEmail.message}</p>}
            </div>
          </div>
         
          <h3 className="font-semibold text-lg mt-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContactName">Full Name</Label>
                <Input id="emergencyContactName" {...register("emergencyContactName")} />
                {errors.emergencyContactName && <p className="text-destructive text-sm mt-1">{errors.emergencyContactName.message}</p>}
            </div>
            <div>
                <Label htmlFor="emergencyContactRelation">Relation</Label>
                <Input id="emergencyContactRelation" {...register("emergencyContactRelation")} />
                {errors.emergencyContactRelation && <p className="text-destructive text-sm mt-1">{errors.emergencyContactRelation.message}</p>}
            </div>
            <div className="col-span-1 md:col-span-2">
                <Label htmlFor="emergencyContactPhone">Phone</Label>
                <Input id="emergencyContactPhone" {...register("emergencyContactPhone")} />
                {errors.emergencyContactPhone && <p className="text-destructive text-sm mt-1">{errors.emergencyContactPhone.message}</p>}
            </div>
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
