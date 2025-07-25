// File: app/(protected)/student/layout.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Cek apakah perannya BUKAN murid
      if (user.role.name !== 'murid') {
        alert("Akses ditolak. Anda bukan murid.");
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role.name !== 'murid') {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div>Memverifikasi akses...</div>
        </div>
    );
  }

  return <>{children}</>;
}