"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { 
  FileText, 
  User, 
  Search, 
  GraduationCap, 
  Users, 
  TrendingUp,
  Filter,
  Download,
  Eye,
  ChevronRight,
  BookOpen,
  AlertCircle,
  UserCheck,
  X
} from "lucide-react";
import Link from "next/link";

// Tipe data
interface Student {
  id: number;
  name: string;
  average_score: number;
  attendance_percentage: number;
}
interface ReportPageData {
  class_name: string;
  students: Student[];
}

export default function ReportPage() {
  const [data, setData] = useState<ReportPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  useEffect(() => {
    // Kita gunakan lagi API dashboard untuk mendapatkan daftar siswa
    api.get('/homeroom/dashboard-summary')
      .then(res => {
        setData(res.data);
        setFilteredStudents(res.data.students);
      })
      .catch(err => console.error("Gagal memuat data siswa.", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (data) {
      const filtered = data.students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, data]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          {/* Mobile Header Skeleton */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-4 w-64" />
          </div>
           
          {/* Search Skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Cards Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-16" />
                  <Skeleton className="h-12 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Gagal memuat data siswa. Silakan coba lagi nanti.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="px-4 py-6 sm:px-6 lg:px-8 mx-auto space-y-6">
        
        {/* Header Section - Optimized for mobile */}
        <div className="bg-gradient-to-r from-indigo-500 to-blue-400 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <div className="flex flex-col space-y-4">
            <div className="flex items-start justify-between">
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">Rapor Siswa</h1>
                </div>
                <p className="text-base sm:text-lg font-medium opacity-90 mb-1">Kelas {data.class_name}</p>
                <p className="text-sm sm:text-base opacity-75 leading-relaxed">Kelola dan lihat laporan akademik siswa</p>
              </div> 

              <div className="flex flex-col items-end gap-2 ml-4">
                <Badge className="bg-white/20 text-white border-white/30 text-xs sm:text-sm whitespace-nowrap">
                  {data.students.length} Siswa
                </Badge>
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs">
                    {filteredStudents.length} hasil
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 py-3 w-full border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Students List */}
        {filteredStudents.length > 0 ? (
          <>
            {/* Desktop Grid View - Hidden on mobile */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredStudents.map((student) => (
                <Link key={student.id} href={`/homeroom/report/${student.id}`}>
                  {/* Kartu dibuat menjadi flex-col untuk kontrol layout vertikal */}
                  <Card className="flex h-full flex-col cursor-pointer border-gray-200 transition-all duration-300 group hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1">
                    <CardContent className="flex flex-col items-center text-center p-2">
                      <div>
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-lg font-semibold text-white shadow-sm">
                            <span className="leading-none">{student.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-base font-bold text-gray-900 transition-colors group-hover:text-indigo-600">
                              {student.name}
                            </h3>
                              <div className="mt-2">
                                <Badge variant="outline" className="border-green-200 bg-green-50 text-xs text-green-700">
                                  <UserCheck className="mr-1 h-3 w-3" />
                                  Aktif
                                </Badge>
                              </div>
                          </div>
                        </div>
                      </div>

                      {/* BAGIAN BAWAH: Statistik */}
                      <div className="pt-6">
                        <div className="flex justify-between gap-10">
                          <div>
                            <p className="text-xl font-bold text-indigo-600">{student.average_score}</p>
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Rata-rata</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold text-green-600">{student.attendance_percentage}%</p>
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Kehadiran</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Mobile List View - Shown only on mobile */}
            <div className="space-y-4 md:hidden">
              {filteredStudents.map((student) => (
                <Link key={student.id} href={`/homeroom/report/${student.id}`}>
                  <Card className="cursor-pointer mb-4 border-gray-200 transition-all duration-200 hover:border-indigo-400 hover:shadow-lg active:scale-[0.98]">
                    <CardContent className="flex flex-col items-center gap-3  text-center">
                      {/* Avatar */}
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-xl font-bold text-white">
                        <span className="leading-none">{student.name.charAt(0).toUpperCase()}</span>
                      </div>

                      {/* Info Utama */}
                      <div className="mt-1">
                        <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                        <div className="mt-2">
                          <Badge variant="outline" className="border-green-200 bg-green-50 text-xs text-green-700">
                            <UserCheck className="mr-1 h-3 w-3" />
                            Aktif
                          </Badge>
                        </div>
                      </div>

                      {/* Statistik */}
                      <div className="flex w-full items-center justify-around gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-indigo-600">{student.average_score}</p>
                          <p className="text-xs uppercase tracking-wider text-gray-500">Rata-rata</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">{student.attendance_percentage}%</p>
                          <p className="text-xs uppercase tracking-wider text-gray-500">Kehadiran</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {/* Summary Footer */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Menampilkan <span className="font-semibold text-gray-900">{filteredStudents.length}</span> dari{' '}
                  <span className="font-semibold text-gray-900">{data.students.length}</span> siswa
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled className="text-xs sm:text-sm">
                    Sebelumnya
                  </Button>
                  <Button variant="outline" size="sm" disabled className="text-xs sm:text-sm">
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl p-8 sm:p-12 shadow-sm">
            <div className="text-center">
              {searchTerm ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Tidak ada siswa ditemukan
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      Coba ubah kata kunci pencarian untuk menemukan siswa yang Anda cari
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={clearSearch}
                      className="border-indigo-200 hover:bg-indigo-50 text-indigo-700"
                    >
                      Hapus Pencarian
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Belum ada siswa
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      Belum ada siswa di kelas perwalian Anda. Hubungi administrator untuk menambahkan siswa.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}