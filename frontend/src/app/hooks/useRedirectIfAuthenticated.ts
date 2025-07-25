// File: app/hooks/useRedirectIfAuthenticated.ts
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export const useRedirectIfAuthenticated = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jangan lakukan apa-apa jika masih loading
    if (isLoading) return;

    // Jika loading selesai DAN ada user, lakukan redirect
    if (user) {
      const roleName = user.role.name.toLowerCase().trim();
      
      switch (roleName) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'guru':
          router.push('/teacher/dashboard');
          break;
        case 'walikelas':
          router.push('/homeroom/dashboard');
          break;
        case 'murid':
          router.push('/student/dashboard');
          break;
        default:
          router.push('/'); // Fallback
      }
    }
  }, [user, isLoading, router]); // Hook ini akan berjalan setiap kali user atau isLoading berubah
};