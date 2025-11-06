'use client';
import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { Skeleton } from './ui/skeleton';
import { Toaster } from './ui/toaster';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isUserLoading) return; // Wait until user status is resolved

        const isAuthPage = pathname === '/login';

        if (!user && !isAuthPage) {
            router.replace('/login');
        }
        
        if (user && isAuthPage) {
            router.replace('/');
        }

    }, [user, isUserLoading, router, pathname]);

    if (isUserLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
               <div className="flex items-center gap-2">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8 text-primary animate-pulse"
                    >
                    <path d="M3 12h2.5l1.5-4 3 8 2-5 1.5 3.5H19" />
                    <circle cx="12" cy="12" r="10" />
                    </svg>
                <span className="text-xl font-semibold text-muted-foreground">Loading HeartGuard...</span>
               </div>
            </div>
        );
    }
    
    if (user && pathname !== '/login') {
        return <DashboardLayout>{children}</DashboardLayout>;
    }
    
    if (!user && pathname === '/login') {
        return <><Toaster />{children}</>;
    }

    return null;
}
