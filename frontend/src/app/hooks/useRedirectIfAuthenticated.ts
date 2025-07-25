// File: app/hooks/useRedirectIfAuthenticated.ts
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export const useRedirectIfAuthenticated = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Tunggu sampai status loading selesai
    if (!isLoading && user) {
      // Jika ada user, arahkan ke dashboard sesuai perannya
      switch (user.role.name) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'murid':
          router.push('/student/dashboard');
          break;
        // Tambahkan case untuk peran lain jika perlu
        default:
          router.push('/'); // Fallback ke halaman utama
      }
    }
  }, [user, isLoading, router]);
};