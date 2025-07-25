// File: components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
// Anda bisa menambahkan ikon dari library seperti lucide-react
// npm install lucide-react
import { LayoutDashboard, Users, GraduationCap, ClipboardCheck, BookCheck, Settings, BookCopy, School, UserCheck, UserCog, History, BrainCircuit } from "lucide-react";

// Konfigurasi semua item menu yang mungkin ada
const menuItems = [
  // Menu Admin
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin"] },
  { href: "/admin/manage-subjects", label: "Manajemen Mapel", icon: BookCopy, roles: ["admin"] },
  { href: "/admin/manage-classes", label: "Manajemen Kelas", icon: School, roles: ["admin"] },
  { href: "/admin/manage-teachers", label: "Manajemen Guru", icon: UserCog, roles: ["admin"] },
  { href: "/admin/manage-students", label: "Manajemen Murid", icon: UserCog, roles: ["admin"] },
  { href: "/admin/manage-homerooms", label: "Manajemen Wali Kelas", icon: UserCog, roles: ["admin"] }, 
  { href: "/admin/manage-admin", label: "Manajemen Admin", icon: UserCog, roles: ["admin"] },
  { href: "/admin/activity", label: "Monitor Aktivitas", icon: BookCheck, roles: ["admin"] },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings, roles: ["admin"] },

  // Menu Murid
  { href: "/student/dashboard", label: "Dashboard Murid", icon: LayoutDashboard, roles: ["murid"] },
  { href: "/student/grades", label: "Nilai Saya", icon: GraduationCap, roles: ["murid"] },
  // Menu Guru
  { href: "/teacher/dashboard", label: "Dashboard Guru", icon: LayoutDashboard, roles: ["guru"] },
  { href: "/teacher/grade-input", label: "Input Nilai", icon: ClipboardCheck, roles: ["guru"] },
  { href: "/teacher/grades", label: "Daftar Nilai", icon: History, roles: ["guru"] }, // <-- TAMBAHKAN INI
  { href: "/teacher/recommendation", label: "Rekomendasi AI", icon: BrainCircuit, roles: ["guru"] }, // <-- TAMBAHKAN INI
  { href: "/teacher/settings", label: "Pengaturan Akun", icon: Settings, roles: ["guru"] }, // <-- TAMBAHKAN INI

  // Tambahkan menu untuk walikelas dan peran lain di sini
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  // Filter menu berdasarkan peran pengguna yang sedang login
  const accessibleMenuItems = menuItems.filter(item => 
    user?.role?.name && item.roles.includes(user.role.name)
  );

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
        E-Nilai
      </div>
      <nav className="flex-grow p-4">
        <ul>
          {accessibleMenuItems.map((item) => (
            <li key={item.href} className="mb-2">
              <Link
                href={item.href}
                className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors ${
                  pathname === item.href ? "bg-indigo-600" : ""
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="mb-2">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-gray-400 capitalize">{user?.role?.name}</p>
        </div>
        <button 
          onClick={logout}
          className="w-full text-left flex items-center p-3 rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}