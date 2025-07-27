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
  AlertCircle
} from "lucide-react";
import Link from "next/link";

// Definisikan tipe data
interface Student {
  id: number;
  name: string;
}
interface DashboardData {
  class_name: string;
  student_count: number;
  students: Student[];
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto p-4 md:p- lg:p-8 space-y-6">
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
        <div className="container mx-auto p-4 md:p-0 lg:p-0">
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              Gagal memuat data dasbor. Silakan coba lagi nanti.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12 ? 'Selamat Pagi' : 
                  currentTime.getHours() < 17 ? 'Selamat Siang' : 'Selamat Sore';

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
                  <GraduationCap className="h-8 w-8" />
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Dasbor Wali Kelas</h1>
                </div>
                <p className="text-lg md:text-xl opacity-90">{greeting}, {user?.name}! 👋</p>
                <div className="flex items-center gap-2 mt-2 text-sm opacity-80">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="text-lg font-medium">
                  {currentTime.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Class Info Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <BookOpen className="h-5 w-5" />
                Kelas Perwalian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {data.class_name}
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="font-medium">{data.student_count} Siswa</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <UserCheck className="h-5 w-5" />
                Total Siswa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400">
                  {data.student_count}
                </p>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Aktif
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Performance Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <TrendingUp className="h-5 w-5" />
                Rata-rata Kelas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400">
                  85.2
                </p>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Baik
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Activities Card */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <Star className="h-5 w-5" />
                Kegiatan Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400">
                  3
                </p>
                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Terjadwal
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students List */}
          <Card className="lg:col-span-2 shadow-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <Users className="h-6 w-6" />
                Daftar Siswa Kelas {data.class_name}
              </CardTitle>
              <CardDescription className="text-indigo-600 dark:text-indigo-400">
                Klik pada nama siswa untuk melihat rapor akademik dan membuat catatan.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {data.students.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {data.students.map((student, index) => (
                    <div key={student.id} className="group">
                      <Link href={`/homeroom/report/${student.id}`}>
                        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950 dark:hover:to-purple-950 transition-all duration-300 cursor-pointer group-hover:shadow-md">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                                {student.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {student.id}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900 dark:hover:bg-indigo-800 dark:text-indigo-300"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Lihat Rapor
                            </Button>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                    Belum ada siswa di kelas ini
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Hubungi administrator untuk menambahkan siswa.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Star className="h-5 w-5" />
                  Aksi Cepat
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Link href="/homeroom/report">
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
                    <FileText className="h-4 w-4 mr-2" />
                    Kelola Semua Rapor
                  </Button>
                </Link>
                <Button variant="outline" className="w-full border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analisis Kelas
                </Button>
                <Button variant="outline" className="w-full border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950">
                  <Calendar className="h-4 w-4 mr-2" />
                  Jadwal Kegiatan
                </Button>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card className="shadow-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                  <Clock className="h-5 w-5" />
                  Jadwal Hari Ini
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">Rapat Wali Kelas</p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">09:00 - 10:00</p>
                    </div>
                    <Badge className="bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                      Upcoming
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">Konsultasi Siswa</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">13:00 - 14:00</p>
                    </div>
                    <Badge className="bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                      Scheduled
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">Evaluasi Mingguan</p>
                      <p className="text-sm text-green-600 dark:text-green-400">15:00 - 16:00</p>
                    </div>
                    <Badge className="bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">
                      Planned
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}