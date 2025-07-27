"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, ListCheck, ScrollText } from "lucide-react";
interface Grade {
  id: number;
  score: number;
  exam_date: string;
  subject: { name: string };
  grade_type: { name: string };
  teacher: { name: string };
}

interface PaginatedGrades {
  data: Grade[];
  current_page: number;
  last_page: number;
}

export default function MyGradesPage() {
  const { activeSemester } = useAuth();
  const [grades, setGrades] = useState<PaginatedGrades | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGrades = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/student/grades?page=${page}`);
      setGrades(response.data);
    } catch (error) {
      console.error("Gagal memuat daftar nilai:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  // Fungsi untuk mendapatkan warna skor berdasarkan nilai
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 80) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  // Komponen Table untuk Desktop
  const DesktopTable = () => (
    <div className="mt-6 rounded-md border flex-grow overflow-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50/50">
            <th className="sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10 px-4 py-3 text-left text-sm font-medium text-gray-900">
              Mata Pelajaran
            </th>
            <th className="sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10 px-4 py-3 text-left text-sm font-medium text-gray-900">
              Nama Guru
            </th>
            <th className="sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10 px-4 py-3 text-left text-sm font-medium text-gray-900">
              Jenis Ujian
            </th>
            <th className="sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10 px-4 py-3 text-left text-sm font-medium text-gray-900">
              Tanggal
            </th>
            <th className="sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10 px-4 py-3 text-right text-sm font-medium text-gray-900">
              Skor
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {isLoading ? (
            <tr>
              <td colSpan={5} className="text-center h-24 px-4 py-8">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-gray-500">Memuat data nilai...</span>
                </div>
              </td>
            </tr>
          ) : grades && grades.data.length > 0 ? (
            grades.data.map(grade => (
              <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{grade.subject.name}</td>
                <td className="px-4 py-3 text-gray-700">{grade.teacher.name}</td>
                <td className="px-4 py-3 text-gray-700">{grade.grade_type.name}</td>
                <td className="px-4 py-3 text-gray-700">
                  {new Date(grade.exam_date).toLocaleDateString('id-ID')}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-lg font-bold border ${getScoreColor(grade.score)}`}>
                    {grade.score}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center h-24 px-4 py-8 text-gray-500">
                Belum ada data nilai di semester ini.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Komponen Grid Cards untuk Mobile
  const MobileGrid = () => (
    <div className="mt-6 flex-grow overflow-auto">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-500">Memuat data nilai...</span>
          </div>
        </div>
      ) : grades && grades.data.length > 0 ? (
        <div className="grid gap-4">
          {grades.data.map(grade => (
            <div
              key={grade.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                {/* Header Card dengan Subject dan Score */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">
                      {grade.subject.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {grade.grade_type.name}
                    </p>
                  </div>
                  <div className={`ml-3 px-3 py-2 rounded-lg border ${getScoreColor(grade.score)}`}>
                    <span className="text-2xl font-bold">{grade.score}</span>
                  </div>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="block text-gray-500 font-medium mb-1">Guru:</span>
                    <span className="text-gray-900">{grade.teacher.name}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 font-medium mb-1">Tanggal:</span>
                    <span className="text-gray-900">
                      {new Date(grade.exam_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">📚</span>
          </div>
          <p className="text-center">Belum ada data nilai di semester ini.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-8 flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ListCheck className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Daftar Nilai Saya
              </h1>
              </div>
            </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Berikut adalah daftar nilai yang telah Anda peroleh di semester ini.
            </p>
        </div>

      {/* Content - Desktop Table */}
      <div className="hidden md:flex md:flex-col md:flex-grow">
        <DesktopTable />
      </div>

      {/* Content - Mobile Grid */}
      <div className="md:hidden flex flex-col flex-grow">
        <MobileGrid />
      </div>
      
      {/* Paginasi */}
      {grades && grades.data.length > 0 && (
        <div className="flex-shrink-0 flex items-center justify-between py-4 border-t border-gray-200 mt-4">
          <div className="text-sm text-gray-500">
            <span className="hidden sm:inline">Halaman </span>
            {grades.current_page} dari {grades.last_page}
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => fetchGrades(grades!.current_page - 1)}
              disabled={!grades || grades.current_page <= 1}
            >
              <span className="hidden sm:inline">Sebelumnya</span>
              <span className="sm:hidden">‹</span>
            </button>
            <button
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => fetchGrades(grades!.current_page + 1)}
              disabled={!grades || grades.current_page >= grades.last_page}
            >
              <span className="hidden sm:inline">Berikutnya</span>
              <span className="sm:hidden">›</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}