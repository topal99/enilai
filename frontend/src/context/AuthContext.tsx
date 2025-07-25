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
  role: Role;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
  activeSemester: string | null;
  activeSemesterId: number | null; // <-- Tambahkan ini

}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSemester, setActiveSemester] = useState<string | null>(null);
  const [activeSemesterId, setActiveSemesterId] = useState<number | null>(null); // <-- Tambahkan ini
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_data');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
         api.get('/settings')
        .then(response => {
          setActiveSemester(response.data.active_semester_name);
          setActiveSemesterId(response.data.active_semester_id); // <-- Tambahkan ini
        });
    }
    setIsLoading(false);
  }, []);
  
const login = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('auth_token', userToken);
    
    // =================================================================
    // TAMBAHKAN BARIS INI UNTUK DEBUGGING
    // =================================================================

    const roleName = userData.role.name.toLowerCase().trim();

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
        // Jika tidak cocok sama sekali, arahkan ke halaman utama
        router.push('/');
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
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, activeSemester, activeSemesterId }}>
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