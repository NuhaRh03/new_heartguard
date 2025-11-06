'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Logo } from '@/components/icons';
import { FirebaseError } from 'firebase/app';

export default function LoginPage() {
  const [email, setEmail] = useState('e.reed@pulseguard.io');
  const [password, setPassword] = useState('password');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Login Successful',
          description: 'Welcome back, Doctor!',
        });
        router.push('/');
      } catch (error) {
        if (error instanceof FirebaseError && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
          // If user does not exist, try creating a new user
          try {
            await createUserWithEmailAndPassword(auth, email, password);
            toast({
              title: 'Account Created & Logged In',
              description: 'Welcome, Doctor! A new account has been created for you.',
            });
            router.push('/');
          } catch (createError) {
             console.error('Sign up failed:', createError);
             toast({
                variant: 'destructive',
                title: 'Sign-up Failed',
                description: 'Could not create a new account. Please try again.',
             });
          }
        } else {
            console.error('Login failed:', error);
            toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'An unexpected error occurred. Please try again.',
            });
        }
      }
    });
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
            <Logo className="w-12 h-12 mx-auto mb-2 text-primary" />
          <CardTitle className="text-2xl">HeartGuard</CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Logging in...' : 'Login / Sign Up'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
