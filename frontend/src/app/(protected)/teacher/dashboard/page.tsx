"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Users, Book, Star, ClipboardEdit, GraduationCap, School, LayoutDashboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Definisikan tipe data untuk state
interface Subject { id: number; name: string; }
interface ClassModel { id: number; level: number; name: string; }
interface TopStudent {
  student_id: number;
  average_score: string;
  student_profile: { user: { name: string; }; };
}
interface DashboardData {
  active_semester_name: string;
  stats: {
    subjects_taught: number;
    total_students: number;
    average_score: string;
  };
  top_students: TopStudent[];
  details: {
    subjects: Subject[];
    classes: ClassModel[];
  };
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/teacher/dashboard-summary');
        setData(response.data);
      } catch (err) {
        setError("Gagal memuat data dasbor.");
        console.error(err);
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

  if (error) return <div className="p-4 sm:p-8 text-red-500">{error}</div>;
  if (!data) return <div className="p-4 sm:p-8">Data tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-4 sm:p-6 lg:p-8 mx-auto space-y-6 sm:space-y-8">
        {/* Header Halaman */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className=" sm:text-left space-y-2 mb-4">
          <div className="flex items-center sm:justify-start gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <LayoutDashboard className="h-6 w-6 text-purple-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Selamat Datang, {user?.name || "Guru"}
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Ini adalah dasbor Anda untuk mengelola kelas, melihat statistik, dan mengakses fitur penting lainnya.
            Silakan jelajahi dan gunakan fitur yang tersedia.
          </p>
        </div>

          <div className="text-sm sm:text-base font-semibold text-gray-600 bg-white border px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-sm">
            <span className="block sm:inline">Semester Aktif:</span>
            <span className="block sm:inline sm:ml-1 font-bold">{data.active_semester_name}</span>
          </div>
        </div>

        {/* Kartu Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Mapel Diajar</CardTitle>
              <Book className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-800">{data.stats.subjects_taught}</div>
              <p className="text-xs text-muted-foreground mt-1">Mata pelajaran</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Murid</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-800">{data.stats.total_students}</div>
              <p className="text-xs text-muted-foreground mt-1">Murid di semua kelas</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Rata-rata Nilai</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-800">{data.stats.average_score}</div>
              <p className="text-xs text-muted-foreground mt-1">Dari semua nilai semester ini</p>
            </CardContent>
          </Card>
        </div>

        {/* Kartu Rincian Mapel dan Kelas */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Detail Mengajar Anda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="flex items-center font-semibold text-gray-700">
                  <GraduationCap className="h-5 w-5 mr-2 text-blue-500" />
                  Mata Pelajaran yang Diampu
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data?.details?.subjects?.length > 0 ? (
                    data.details.subjects.map(subject => (
                      <Badge variant="secondary" key={subject.id} className="text-xs sm:text-sm">
                        {subject.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Tidak ada mata pelajaran</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="flex items-center font-semibold text-gray-700">
                  <School className="h-5 w-5 mr-2 text-green-500" />
                  Kelas yang Diajar
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data?.details?.classes?.length > 0 ? (
                    data.details.classes.map(cls => (
                      <Badge key={cls.id} variant="secondary" className="text-xs sm:text-sm">
                        {cls.level}-{cls.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Tidak ada kelas</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aksi Cepat dan Murid Berprestasi */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Aksi Cepat */}
          <div className="xl:col-span-1">
            <Card className="h-full shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Aksi Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Langsung menuju halaman input nilai untuk memulai penilaian.
                </p>
                <Link href="/teacher/grade-input" passHref>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 transition-colors">
                    <ClipboardEdit className="mr-2 h-4 w-4" /> 
                    Input Nilai Sekarang
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Murid Berprestasi */}
          <div className="xl:col-span-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">🏆 3 Murid Berprestasi Teratas</CardTitle>
                <p className="text-sm text-muted-foreground">Berdasarkan rata-rata nilai di semester ini.</p>
              </CardHeader>
              <CardContent>
                {data.top_students.length > 0 ? (
                  <div className="space-y-3">
                    {data.top_students.map((student, index) => (
                      <div key={student.student_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            'bg-orange-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm sm:text-base">
                              {student.student_profile.user.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-blue-600">{student.average_score}</div>
                          <p className="text-xs text-muted-foreground">rata-rata</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">📊</div>
                    <p className="text-sm text-muted-foreground">
                      Belum ada data nilai untuk ditampilkan.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}