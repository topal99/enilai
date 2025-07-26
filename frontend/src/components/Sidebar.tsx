"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Users, BookCopy, School, UserCheck, UserCog, FileText, ClipboardCheck, History, BrainCircuit, Settings, UserCheck2, X, GraduationCap, BookCheck } from "lucide-react";
import { Button } from "./ui/button";

// Definisikan props baru
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Konfigurasi menu (tidak berubah)
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
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["murid"] },
  { href: "/student/grades", label: "Nilai Saya", icon: GraduationCap, roles: ["murid"] },

  // Menu Guru
  { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["guru"] },
  { href: "/teacher/attendance", label: "Absensi", icon: UserCheck2, roles: ["guru"] }, 
  { href: "/teacher/attendance-report", label: "Laporan Absensi", icon: FileText, roles: ["guru"] }, 
  { href: "/teacher/grade-input", label: "Input Nilai", icon: ClipboardCheck, roles: ["guru"] },
  { href: "/teacher/grades", label: "Daftar Nilai", icon: History, roles: ["guru"] }, 
  { href: "/teacher/recommendation", label: "Rekomendasi AI", icon: BrainCircuit, roles: ["guru"] }, 
  { href: "/teacher/settings", label: "Pengaturan Akun", icon: Settings, roles: ["guru"] }, 

  // Menu Wali Kelas
  { href: "/homeroom/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["walikelas"] },
  { href: "/homeroom/report", label: "Rapor Siswa", icon: FileText, roles: ["walikelas"] },

];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const accessibleMenuItems = menuItems.filter(item => 
    user?.role?.name && item.roles.includes(user.role.name)
  );

  return (
    <aside className={`
      w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col
      fixed md:relative inset-y-0 left-0 z-50
      transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
      md:translate-x-0 transition-transform duration-300 ease-in-out
    `}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
        <span className="text-2xl font-bold">E-Nilai</span>
        {/* Tombol close, hanya muncul di mobile */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      <nav className="flex-grow p-4">
        <ul>
          {accessibleMenuItems.map((item) => (
            <li key={item.href} className="mb-2">
              <Link
                href={item.href}
                onClick={onClose} // Tutup sidebar saat link diklik di mobile
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