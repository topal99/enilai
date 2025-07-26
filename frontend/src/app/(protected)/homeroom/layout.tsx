"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomeroomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role.name !== 'walikelas') {
        alert("Akses ditolak. Anda bukan Wali Kelas.");
        router.push('/login'); // Arahkan ke login atau halaman lain yang sesuai
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role.name !== 'walikelas') {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <div>Memverifikasi akses wali kelas...</div>
      </div>
    );
  }

  return <>{children}</>;
}