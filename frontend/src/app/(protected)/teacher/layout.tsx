"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Setelah loading selesai dan ada user
    if (!isLoading && user) {
      // Cek apakah perannya BUKAN guru
      if (user.role.name !== 'guru') {
        // Jika bukan guru, tendang ke halaman login
        alert("Akses ditolak. Anda bukan guru.");
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  // Selama loading atau jika bukan guru, jangan render apa-apa
  if (isLoading || !user || user.role.name !== 'guru') {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div>Memverifikasi akses guru...</div>
        </div>
    );
  }

  // Jika user adalah guru, tampilkan halaman
  return <>{children}</>;
}