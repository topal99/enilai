"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Users, Book, Star, ClipboardEdit, GraduationCap, School } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      setIsLoading(true); // Set loading true di awal fetch
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


  if (isLoading) return <div className="p-8">Memuat dasbor guru...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!data) return <div className="p-8">Data tidak ditemukan.</div>;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header Halaman */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Selamat Datang, {user?.name}!</h1>
          <p className="text-muted-foreground">Ini adalah ringkasan aktivitas mengajar Anda.</p>
        </div>
        <div className="text-lg font-semibold text-gray-600 bg-gray-200 px-4 py-2 rounded-lg">
          Semester Aktif: {data.active_semester_name}
        </div>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mapel Diajar</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.subjects_taught}</div>
            <p className="text-xs text-muted-foreground">Mata pelajaran</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Murid Diajar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.total_students}</div>
            <p className="text-xs text-muted-foreground">Murid di semua kelas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.average_score}</div>
            <p className="text-xs text-muted-foreground">Dari semua nilai di semester ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Kartu Rincian Mapel dan Kelas */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Mengajar Anda</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="flex items-center font-semibold mb-2">
              <GraduationCap className="h-5 w-5 mr-2" />
              Mata Pelajaran yang Diampu
            </h3>
            <div className="flex flex-wrap gap-2">
              {/* Tambahkan ?. setelah data */}
              {data?.details?.subjects?.length > 0 ? (
                data.details.subjects.map(subject => (
                  <Badge variant="secondary" key={subject.id}>{subject.name}</Badge>
                ))
              ) : <p className="text-sm text-muted-foreground">Tidak ada</p>}
            </div>
          </div>
          <div>
            <h3 className="flex items-center font-semibold mb-2">
              <School className="h-5 w-5 mr-2" />
              Kelas yang Diajar
            </h3>
            <div className="flex flex-wrap gap-2">
              {/* Tambahkan ?. setelah data */}
              {data?.details?.classes?.length > 0 ? (
                data.details.classes.map(cls => (
                  <Badge key={cls.id} variant="secondary">{cls.level}-{cls.name}</Badge>
                ))
              ) : <p className="text-sm text-muted-foreground">Tidak ada</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aksi Cepat dan Murid Berprestasi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Langsung menuju halaman input nilai untuk memulai penilaian.
              </p>
              <Link href="/teacher/grade-input" passHref>
                <Button className="w-full">
                  <ClipboardEdit className="mr-2 h-4 w-4" /> Input Nilai Sekarang
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>3 Murid Berprestasi Teratas</CardTitle>
              <p className="text-sm text-muted-foreground">Berdasarkan rata-rata nilai di semester ini.</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {data.top_students.length > 0 ? (
                  data.top_students.map((student, index) => (
                    <li key={student.student_id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-bold text-lg mr-4">{index + 1}.</span>
                        <div>
                          {/* KOREKSI 2: Gunakan student_profile.user.name */}
                          <p className="font-medium">{student.student_profile.user.name}</p>
                        </div>
                      </div>
                      <div className="font-bold text-lg text-indigo-600">{student.average_score}</div>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-center text-muted-foreground py-4">
                    Belum ada data nilai untuk ditampilkan.
                  </p>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}