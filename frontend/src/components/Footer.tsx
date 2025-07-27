import Link from 'next/link';
import { School } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-screen-xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex justify-center sm:justify-start items-center space-x-3">
            <School className="h-8 w-8" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap">SMP Teladan</span>
          </div>
          <p className="mt-4 text-sm text-center text-gray-400 lg:mt-0 lg:text-right">
            Copyright &copy; {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 sm:flex sm:items-center sm:justify-between">
            <div className="text-sm text-gray-400">
                <p>Jl. Pendidikan No. 1, Purworejo, Jawa Tengah</p>
                <p>Email: info@smpteladan.sch.id | Telp: (0275) 123-456</p>
            </div>
            {/* Tambahkan link social media jika ada */}
        </div>
      </div>
    </footer>
  );
}