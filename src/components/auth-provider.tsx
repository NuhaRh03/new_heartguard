
'use client';
import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { Skeleton } from './ui/skeleton';

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
                <Skeleton className="h-12 w-12 rounded-full" />
            </div>
        );
    }
    
    if (!user && pathname !== '/login') {
        return null; // or a loading spinner, prevents flicker of content before redirect
    }

    if (user && pathname !== '/login') {
        return <DashboardLayout>{children}</DashboardLayout>;
    }

    return <>{children}</>;
}
