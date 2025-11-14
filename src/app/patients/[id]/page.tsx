// app/patients/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import type { Patient } from "@/lib/types";
import { PatientInfoCard } from "./_components/patient-info-card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { VitalsMonitor } from "./_components/vitals-monitor";
import { SensorHistory } from "./_components/sensor-history";
import { AnomalyDetector } from "./_components/anomaly-detector";


export default function PatientPage() {
  const params = useParams<{ id: string }>();
  const id = String(params.id);
  const firestore = useFirestore();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore || !id) return;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const ref = doc(firestore, "patients", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError("Patient not found in Firestore");
        } else {
          const data = { ...snap.data(), id: snap.id } as Patient;
          setPatient(data);
        }
      } catch (e: any) {
        console.error("Error loading patient:", e);
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, firestore]);

  if (loading) {
    return (
      <DashboardLayout>
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading patient…</p>
        </main>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <main className="min-h-screen flex items-center justify-center">
          <div className="border rounded-xl p-6 text-sm text-red-600 max-w-md">
            <p className="font-semibold mb-1">Error</p>
            <p>{error}</p>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
       <DashboardLayout>
        <main className="min-h-screen flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No patient data found.</p>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <VitalsMonitor patient={patient} />
            <SensorHistory sensorHistory={null} isLoading={false} />
        </div>
        <div className="grid auto-rows-max items-start gap-4 md:gap-8">
            <PatientInfoCard patient={patient} />
            <AnomalyDetector patient={patient} sensorHistory={null} />
        </div>
      </main>
    </DashboardLayout>
  );
}
