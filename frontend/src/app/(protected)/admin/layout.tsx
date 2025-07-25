// File: app/(protected)/admin/layout.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Setelah loading selesai dan ada user
    if (!isLoading && user) {
      // Cek apakah perannya BUKAN admin
      if (user.role.name !== 'admin') {
        // Jika bukan admin, tendang ke halaman login atau halaman utama
        alert("Akses ditolak. Anda bukan admin.");
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  // Selama loading atau jika bukan admin, jangan render apa-apa
  if (isLoading || !user || user.role.name !== 'admin') {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div>Memverifikasi akses...</div>
        </div>
    );
  }

  // Jika user adalah admin, tampilkan halaman
  return <>{children}</>;
}