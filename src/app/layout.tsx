import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Toaster } from '@/components/ui/toaster';


export const metadata: Metadata = {
  title: 'HeartGuard',
  description: 'Proactive Patient Monitoring System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased'
        )}
      >
        <DashboardLayout>
          {children}
        </DashboardLayout>
        <Toaster />
      </body>
    </html>
  );
}
