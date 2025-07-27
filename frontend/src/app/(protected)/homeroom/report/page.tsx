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
  UserCheck
} from "lucide-react";
import Link from "next/link";

// Tipe data
interface Student {
  id: number;
  name: string;
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
    // Kita gunakan lagi API dasbor untuk mendapatkan daftar siswa
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-6 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              Gagal memuat data siswa. Silakan coba lagi nanti.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 md:p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-8 w-8" />
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Rapor Siswa</h1>
                </div>
                <p className="text-lg md:text-xl opacity-90">Kelas {data.class_name}</p>
                <p className="text-sm md:text-base opacity-80 mt-1">
                  Kelola dan lihat laporan akademik siswa di kelas perwalian Anda
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className="bg-white/20 text-white border-white/30">
                  {data.students.length} Siswa Total
                </Badge>
                <div className="text-sm opacity-80">
                  {filteredStudents.length} dari {data.students.length} ditampilkan
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <UserCheck className="h-5 w-5" />
                Total Siswa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{data.students.length}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Siswa aktif</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <TrendingUp className="h-5 w-5" />
                Rata-rata Kelas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">85.2</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">Performa baik</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <BookOpen className="h-5 w-5" />
                Mata Pelajaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">12</p>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Pelajaran aktif</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-t-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-xl md:text-2xl">
                  <GraduationCap className="h-6 w-6" />
                  Daftar Siswa Kelas {data.class_name}
                </CardTitle>
                <CardDescription className="text-indigo-600 dark:text-indigo-400">
                  Pilih siswa untuk melihat detail rapor akademik dan membuat catatan AI
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-indigo-200 hover:bg-indigo-50 dark:border-indigo-700 dark:hover:bg-indigo-950">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50 dark:border-green-700 dark:hover:bg-green-950">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari nama siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full md:w-96 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:focus:border-indigo-400"
              />
              {searchTerm && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Badge variant="secondary" className="text-xs">
                    {filteredStudents.length} hasil
                  </Badge>
                </div>
              )}
            </div>

            {/* Students List */}
            {filteredStudents.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map((student, index) => (
                    <div key={student.id} className="group">
                      <Link href={`/homeroom/report/${student.id}`}>
                        <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 hover:border-indigo-300 dark:border-gray-700 dark:hover:border-indigo-600 group-hover:scale-[1.02]">
                          <CardContent className="p-5">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors truncate">
                                  {student.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  ID: {student.id}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                                >
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Aktif
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 px-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900 dark:hover:bg-indigo-800 dark:text-indigo-300"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Lihat
                                </Button>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                              </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                              <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">8.5</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Rata-rata</p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-green-600 dark:text-green-400">95%</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Kehadiran</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Pagination Info */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Menampilkan <span className="font-medium">{filteredStudents.length}</span> dari{' '}
                    <span className="font-medium">{data.students.length}</span> siswa
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Sebelumnya
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                {searchTerm ? (
                  <div>
                    <Search className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                      Tidak ada siswa ditemukan
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                      Coba ubah kata kunci pencarian Anda
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchTerm("")}
                      className="border-indigo-200 hover:bg-indigo-50 dark:border-indigo-700 dark:hover:bg-indigo-950"
                    >
                      Hapus Filter
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                      Belum ada siswa di kelas perwalian Anda
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Hubungi administrator untuk menambahkan siswa ke kelas ini.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <TrendingUp className="h-5 w-5" />
                Analisis Kinerja Kelas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rata-rata Keseluruhan</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    85.2 - Baik
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tingkat Kehadiran</span>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    94.5% - Excellent
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Siswa Berprestasi</span>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {Math.round(data.students.length * 0.25)} siswa
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-green-200 hover:bg-green-50 dark:border-green-700 dark:hover:bg-green-950"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Lihat Analisis Lengkap
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <FileText className="h-5 w-5" />
                Laporan & Export
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-blue-200 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-950"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Rapor PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-green-200 hover:bg-green-50 dark:border-green-700 dark:hover:bg-green-950"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data Excel
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-purple-200 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-950"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Cetak Semua Rapor
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}