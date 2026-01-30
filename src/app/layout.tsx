'use client';

import { useAuth, AuthProvider } from '@/context/AuthContext';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950 text-white">Loading...</div>;

  // Direct access enabled - no login check
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full p-8 ml-64">
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "antialiased")}>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
