"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  GraduationCap, 
  BookOpen, 
  Star,
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
  UserCheck,
  AlertCircle,
  LayoutDashboard,
  School
} from "lucide-react";
import Link from "next/link";

// Definisikan tipe data
interface Student { id: number; name: string; }
interface DashboardData {
  class_name: string;
  student_count: number;
  students: Student[];
  active_semester_name?: string;
  stats: {
    average_scores_by_subject: { [key: string]: number };
  };
}

export default function HomeroomDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/homeroom/dashboard-summary');
        setData(response.data);
      } catch (err) {
        console.error("Gagal memuat data dasbor.", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="p-4 sm:p-8 text-red-500">
          Gagal memuat data dasbor. Silakan coba lagi nanti.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header Halaman */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 lg:gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-indigo-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Selamat Datang, {user?.name || "Wali Kelas"}
              </h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
              Ini adalah dasbor Anda untuk mengelola kelas perwalian, melihat statistik siswa, dan mengakses fitur penting lainnya.
              Silakan jelajahi dan gunakan fitur yang tersedia.
            </p>
          </div>

          <div className="lg:flex-shrink-0">
            <div className="text-sm sm:text-base font-semibold text-gray-600 bg-white border px-4 py-3 rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <span className="text-gray-500">Semester Aktif:</span>
                <span className="font-bold text-indigo-600">{data.active_semester_name || "2024/2025"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kartu Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-indigo-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Kelas Perwalian</CardTitle>
              <BookOpen className="h-5 w-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{data.class_name}</div>
              <p className="text-xs text-muted-foreground">Kelas yang Anda ampu</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Siswa</CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{data.student_count}</div>
              <p className="text-xs text-muted-foreground">Siswa di kelas perwalian</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-yellow-500 sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Rata-rata Nilai per Mapel</CardTitle>
              <Star className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mt-2">
                {Object.keys(data.stats.average_scores_by_subject).length > 0 ? (
                  Object.entries(data.stats.average_scores_by_subject).map(([subject, score]) => (
                    <div key={subject} className="flex justify-between items-center text-sm py-1">
                      <span className="text-muted-foreground truncate flex-1 mr-2">{subject}</span>
                      <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">{score}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Star className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Belum ada nilai</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Konten Utama */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Kartu Siswa - Mengambil 2/3 dari lebar pada layar besar */}
          <Card className="xl:col-span-2 shadow-sm border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-indigo-500" />
                  Siswa Kelas {data.class_name}
                </CardTitle>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                  {data.student_count} siswa
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {data?.students?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {data.students.map((student, index) => (
                    <Link key={student.id} href={`/homeroom/report/${student.id}`}>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-indigo-50 hover:to-blue-50 transition-all duration-200 cursor-pointer group border hover:border-indigo-200">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-800 text-sm truncate">
                              {student.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {student.id}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors flex-shrink-0 ml-2" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-500 mb-2">Tidak ada siswa</p>
                  <p className="text-sm text-muted-foreground">Belum ada siswa terdaftar di kelas ini</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Aksi Cepat - Mengambil 1/3 dari lebar pada layar besar */}
          <Card className="xl:col-span-1 shadow-sm border-0 bg-white/70 backdrop-blur-sm h-fit">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Aksi Cepat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Langsung menuju halaman pengelolaan rapor untuk melihat dan mengelola data siswa.
              </p>
              
              <div className="space-y-3">
                <Link href="/homeroom/report" passHref>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md">
                    <FileText className="mr-2 h-4 w-4" /> 
                    Kelola Rapor Siswa
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full hover:bg-gray-50 transition-all duration-200">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analisis Kelas
                </Button>
              </div>

              {/* Informasi Tambahan */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Semester: {data.active_semester_name || "2024/2025"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <School className="h-4 w-4 text-gray-400" />
                    <span>Kelas: {data.class_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{data.student_count} siswa terdaftar</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}