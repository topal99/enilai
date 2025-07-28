"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, BookOpen, TrendingUp, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@radix-ui/react-label";


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

interface Stats {
  total: number;
  average: string;
  highest: number;
  lowest: number;
}

interface Subject { id: number; name: string; }

export default function MyGradesPage() {
  const { activeSemester } = useAuth();
  const [grades, setGrades] = useState<PaginatedGrades | null>(null);
  const [stats, setStats] = useState<Stats | null>(null); // <-- State baru untuk statistik
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(""); // "" berarti semua mapel

  const fetchGrades = useCallback(async (page = 1, subjectId = "") => {
    setIsLoading(true);
    try {
      // Tambahkan subject_id sebagai parameter
      const finalSubjectId = subjectId === "all" ? "" : subjectId;
      const response = await api.get(`/student/grades?page=${page}&subject_id=${finalSubjectId}`);
      setGrades(response.data);
      setStats(response.data.stats);
    } catch (error) {
      console.error("Gagal memuat daftar nilai:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ambil daftar mapel saat komponen dimuat
  useEffect(() => {
    api.get('/student/subjects-with-grades').then(res => setSubjects(res.data));
  }, []);

  // Ambil data nilai saat komponen dimuat atau saat filter berubah
  useEffect(() => {
    fetchGrades(1, selectedSubjectId);
  }, [fetchGrades, selectedSubjectId]);


  // Fungsi untuk mendapatkan warna skor berdasarkan nilai
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 80) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  if (isLoading && !grades) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-6 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

  // Komponen Table untuk Desktop
  const DesktopTable = () => (
    <div className="hidden lg:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold">Mata Pelajaran</TableHead>
            <TableHead className="font-semibold">Nama Guru</TableHead>
            <TableHead className="font-semibold">Jenis Ujian</TableHead>
            <TableHead className="font-semibold">Tanggal</TableHead>
            <TableHead className="text-right font-semibold">Skor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground">Memuat data nilai...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : grades && grades.data.length > 0 ? (
            grades.data.map(grade => (
              <TableRow key={grade.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">{grade.subject.name}</TableCell>
                <TableCell className="text-muted-foreground">{grade.teacher.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {grade.grade_type.name}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(grade.exam_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Badge className={`text-lg font-bold border ${getScoreColor(grade.score)}`}>
                    {grade.score}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="rounded-full bg-muted p-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Belum Ada Nilai</h3>
                    <p className="text-sm text-muted-foreground">
                      Belum ada data nilai di semester ini.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  // Komponen Grid Cards untuk Mobile
  const MobileGrid = () => (
    <div className="block lg:hidden space-y-4">
      {isLoading ? (
        <div className="flex flex-col items-center space-y-2 py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Memuat data nilai...</p>
        </div>
      ) : grades && grades.data.length > 0 ? (
        grades.data.map(grade => (
          <div
            key={grade.id}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${getScoreColor(grade.score)}`}
          >
            {/* Header Card dengan Subject dan Score */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-lg truncate">
                  {grade.subject.name}
                </h3>
                <Badge variant="outline" className="text-xs mt-1">
                  {grade.grade_type.name}
                </Badge>
              </div>
              <div className={`ml-3 px-3 py-2 rounded-lg border ${getScoreColor(grade.score)}`}>
                <span className="text-2xl font-bold">{grade.score}</span>
              </div>
            </div>

            {/* Grid Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1 block">Guru:</Label>
                <span className="text-gray-900">{grade.teacher.name}</span>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1 block">Tanggal:</Label>
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
        ))
      ) : (
        <div className="text-center py-12">
          <div className="rounded-full bg-muted p-4 mx-auto w-fit mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Belum Ada Nilai</h3>
            <p className="text-sm text-muted-foreground">
              Belum ada data nilai di semester ini.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Daftar Nilai Saya
              </h1>
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Berikut adalah daftar nilai yang telah Anda peroleh di semester ini.
            Pantau perkembangan akademik Anda dengan mudah.
          </p>
        </div>

        
        {/* Statistics Cards */}
        {/* KOREKSI: Tampilkan stats hanya jika sudah dihitung */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Nilai</CardTitle>
                <BookOpen className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">Nilai yang tercatat</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{stats.average}</div>
                <p className="text-xs text-muted-foreground mt-1">Nilai rata-rata</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tertinggi</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{stats.highest}</div>
                <p className="text-xs text-muted-foreground mt-1">Nilai tertinggi</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Terendah</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{stats.lowest}</div>
                <p className="text-xs text-muted-foreground mt-1">Nilai terendah</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Card */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <BookOpen className="h-5 w-5 text-primary" />
                Riwayat Nilai
              </CardTitle>
              {grades && grades.data.length > 0 && (
                <Badge variant="secondary" className="w-fit">
                  {grades.data.length} nilai ditampilkan
                </Badge>
              )}
            </div>
          </CardHeader>

            {/* Filter Mata Pelajaran */}
        <div className="max-w-xs px-6">
          <label className="text-sm font-medium flex items-center gap-1 mb-1.5"><Filter className="h-4 w-4" /> Filter Mata Pelajaran</label>
          <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
            <SelectTrigger><SelectValue placeholder="Tampilkan Semua Mapel" /></SelectTrigger>
            <SelectContent>
              {/* KOREKSI: Baris di bawah ini dihapus untuk menghilangkan warning */}
              <SelectItem value="all">Tampilkan Semua Mapel</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={String(subject.id)}>{subject.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

          <CardContent>
            {/* Desktop Table */}
            <DesktopTable />

            {/* Mobile Grid */}
            <MobileGrid />
          </CardContent>
        </Card>

        {/* Pagination */}
           {grades && grades.data.length > 0 && grades.last_page > 1 && (
            <Card className="shadow-sm border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <span className="hidden sm:inline">Halaman </span>
                    {grades.current_page} dari {grades.last_page}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline" size="sm" className="h-8"
                      onClick={() => fetchGrades(grades.current_page - 1, selectedSubjectId)}
                      disabled={isLoading || grades.current_page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Sebelumnya</span>
                    </Button>
                    <Button
                      variant="outline" size="sm" className="h-8"
                      onClick={() => fetchGrades(grades.current_page + 1, selectedSubjectId)}
                      disabled={isLoading || grades.current_page >= grades.last_page}
                    >
                      <span className="hidden sm:inline">Berikutnya</span>
                      <ChevronRight className="h-4 w-4 sm:ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
           )}

        {/* Empty State */}
        {!isLoading && (!grades || grades.data.length === 0) && (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="py-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-muted p-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Belum Ada Nilai</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Belum ada nilai yang tercatat untuk semester ini. 
                    Nilai akan muncul setelah guru menginput hasil ujian atau tugas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}