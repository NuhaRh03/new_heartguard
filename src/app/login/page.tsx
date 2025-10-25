
'use client';
import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Logo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('e.reed@pulseguard.io');
    const [password, setPassword] = useState('password');
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const auth = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handleLogin = () => {
        setError(null);
        startTransition(async () => {
            try {
                await signInWithEmailAndPassword(auth, email, password);
                toast({
                    title: "Login Successful",
                    description: "Welcome back!",
                });
                router.push('/');
            } catch (err: any) {
                console.error(err);
                if (err.code === 'auth/invalid-credential') {
                    setError("Invalid email or password. Please try again.");
                } else {
                    setError("An unexpected error occurred. Please try again later.");
                }
            }
        });
    };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className='flex justify-center items-center gap-2 mb-4'>
                <Logo className="w-10 h-10 text-primary" />
                <span className="text-2xl font-bold">HeartGuard</span>
            </div>
          <CardTitle>Doctor Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin} disabled={isPending}>
            {isPending ? 'Signing In...' : 'Sign In'}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
