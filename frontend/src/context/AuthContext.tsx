// File: context/AuthContext.tsx

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

// Tipe untuk Role
interface Role {
  id: number;
  name: string;
}

// Tipe untuk User
interface User {
  id: number;
  name: string;
  email: string;
  role: Role; // Tipe untuk role diubah menjadi objek
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
  activeSemester: string | null; // <-- Tambahkan ini
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [activeSemester, setActiveSemester] = useState<string | null>(null); // <-- Tambahkan state ini

  useEffect(() => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user_data');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Ambil juga pengaturan semester
        api.get('/settings')
          .then(response => {
            setActiveSemester(response.data.active_semester_name);
          })
          .catch(err => console.error("Gagal memuat semester aktif", err));
      }
      setIsLoading(false);
    }, []);

  const login = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    
    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('auth_token', userToken);
    
    // Logika switch diubah menggunakan role.name
    switch (userData.role.name) {
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
        router.push('/login');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, activeSemester }}> {/* <-- Tambahkan activeSemester */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};