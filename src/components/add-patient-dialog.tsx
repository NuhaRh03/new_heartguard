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
import { useToast } from "@/hooks/use-toast";
import type { Patient } from "@/lib/types";


const arabicName = () => {
    const names = ["خالد", "فاطمة", "علي", "عائشة", "محمد", "زينب", "يوسف", "مريم"];
    const families = ["الأحمد", "العبدالله", "الحسن", "علي", "محمد", "السيد", "المحمود"];
    return `${names[Math.floor(Math.random() * names.length)]} ${families[Math.floor(Math.random() * families.length)]}`;
}

const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").default(arabicName),
  age: z.coerce.number().min(0, "Age must be a positive number.").max(120).default(() => Math.floor(Math.random() * 60) + 20),
  gender: z.enum(["Male", "Female", "Other"]),
  contactPhone: z.string().min(10, "Enter a valid phone number.").default(() => `555-01${Math.floor(Math.random() * 90) + 10}`),
  contactEmail: z.string().email("Enter a valid email.").default(() => `patient.${Math.floor(Math.random() * 1000)}@example.com`),
  emergencyContactName: z.string().min(2, "Name must be at least 2 characters.").default(arabicName),
  emergencyContactRelation: z.string().min(2, "Relation must be at least 2 characters.").default(() => ["Friend", "Spouse", "Parent", "Sibling"][Math.floor(Math.random() * 4)]),
  emergencyContactPhone: z.string().min(10, "Enter a valid phone number.").default(() => `555-02${Math.floor(Math.random() * 90) + 10}`),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface AddPatientDialogProps {
  onPatientAdd: (patient: Omit<Patient, 'id' | 'sensorData'>) => void;
}


export function AddPatientDialog({ onPatientAdd }: AddPatientDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
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
      gender: "Male",
      ...patientSchema.partial().default({})
    }
  });

  const onSubmit = (data: PatientFormData) => {
    startTransition(() => {
        const patientData = {
            name: data.name,
            age: data.age,
            gender: data.gender,
            doctorId: "doc1", 
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
        };

        onPatientAdd(patientData);
        
        toast({
            title: "Patient Added",
            description: `${data.name} has been added to your patient list.`,
        });

        reset(patientSchema.partial().default({}));
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
            Enter the details for the new patient. Click "Add Patient" to save. New patients are generated with random Arabic names.
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
