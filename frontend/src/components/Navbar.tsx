"use client";

import Link from 'next/link';
import { useState } from 'react';
import { School, Menu, X, LogIn, User } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed w-full z-20 top-0 start-0 border-b border-gray-200">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        
        {/* Logo (Sebelah Kiri) */}
        <Link href="/" className="flex items-center space-x-3">
          <School className="h-8 w-8 text-indigo-600" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap">SMP Teladan</span>
        </Link>

        {/* KOREKSI 1: Grup Tombol Sebelah Kanan */}
        <div className="flex items-center md:order-2 space-x-3">
          {/* Tombol Login - Tampil di Desktop, Sembunyi di Mobile */}
          <Link href="/login" className="hidden md:block">
            <button type="button" className="w-full text-left bg-indigo-600 text-white flex items-center p-3 rounded-lg transition-colors">
                <User className="w-5 h-5 mr-3"></User>Login
            </button>
          </Link>
          {/* Tombol Hamburger Menu - Sembunyi di Desktop, Tampil di Mobile */}
          <button onClick={() => setIsOpen(!isOpen)} type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200">
            <span className="sr-only">Buka menu utama</span>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* KOREKSI 2: Menu Navigasi */}
        <div 
          className={`
            items-center justify-between w-full md:flex md:w-auto md:order-1 
            ${isOpen ? 'block' : 'hidden'}
          `}
        >
          
          {/* KOREKSI 3: Menu untuk Mobile (muncul sebagai dropdown) */}
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 md:flex-row md:mt-0 md:border-0 md:bg-white">
            <li><Link href="#hero" onClick={() => setIsOpen(false)} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100">Beranda</Link></li>
            <li><Link href="#about" onClick={() => setIsOpen(false)} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100">Profil</Link></li>
            <li><Link href="#features" onClick={() => setIsOpen(false)} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100">Keunggulan</Link></li>
            <li><Link href="#gallery" onClick={() => setIsOpen(false)} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100">Galeri</Link></li>
            <li className="mt-2 pt-2 border-t border-gray-200 md:hidden">
              <Link href="/login" onClick={() => setIsOpen(false)} className="block py-2 px-3 text-indigo-600 font-semibold rounded hover:bg-gray-100">
              <button type="button" className="w-full bg-indigo-600 text-white flex items-center p-3 rounded-lg hover:bg-red-600 hover:text-white transition-colors">
                <User className="w-5 h-5 mr-3"></User>Login</button></Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}