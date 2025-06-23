import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { OfflineIndicator } from '@/components/offline-indicator';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export const metadata: Metadata = {
  title: 'NeoBridge | نيوبريدج',
  description: 'Coordinating urgent NICU, PICU, and ICU care when seconds matter.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-background">
        <SidebarProvider>
          <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-1 overflow-hidden">
              <AppSidebar />
              <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
        <OfflineIndicator />
      </body>
    </html>
  );
}
