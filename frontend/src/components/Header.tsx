"use client";

import { useAuth } from "@/context/AuthContext";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between md:justify-end h-16 px-4 bg-white border-b">
      {/* Tombol Hamburger Menu, hanya muncul di mobile */}
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
        <Menu className="h-6 w-6" />
      </Button>
      
      {/* Tampilkan nama user di header (opsional, bagus untuk mobile) */}
      <div className="text-sm font-medium">
        Halo, {user?.name}!
      </div>
    </header>
  );
}