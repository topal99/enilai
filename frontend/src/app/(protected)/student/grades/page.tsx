"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, BookOpen, TrendingUp, ChevronLeft, ChevronRight, Filter, User, Calendar } from "lucide-react";
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
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const fetchGrades = useCallback(async (page = 1, subjectId = "") => {
    setIsLoading(true);
    try {
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

  useEffect(() => {
    api.get('/student/subjects-with-grades').then(res => setSubjects(res.data));
  }, []);

  useEffect(() => {
    fetchGrades(1, selectedSubjectId);
  }, [fetchGrades, selectedSubjectId]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 80) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "text-green-700 bg-green-100 border-green-300";
    if (score >= 80) return "text-blue-700 bg-blue-100 border-blue-300";
    if (score >= 70) return "text-yellow-700 bg-yellow-100 border-yellow-300";
    return "text-red-700 bg-red-100 border-red-300";
  };

  if (isLoading && !grades) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto p-3 sm:p-4 lg:p-8 space-y-4 sm:space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-8 sm:h-10 w-60 sm:w-80" />
            <Skeleton className="h-4 sm:h-6 w-48 sm:w-64" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 sm:h-6 w-20 sm:w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12 sm:h-20 w-full" />
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

  // Komponen Grid Cards untuk Mobile - DIPERBAIKI
  const MobileGrid = () => (
    <div className="block lg:hidden space-y-3">
      {isLoading ? (
        <div className="flex flex-col items-center space-y-2 py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Memuat data nilai...</p>
        </div>
      ) : grades && grades.data.length > 0 ? (
        grades.data.map(grade => (
          <div
            key={grade.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow"
          >
            {/* Header - Subject dan Score */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-3">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate leading-tight">
                  {grade.subject.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                    {grade.grade_type.name}
                  </Badge>
                </div>
              </div>
              <div className={`flex-shrink-0 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border-2 ${getScoreBadgeColor(grade.score)}`}>
                <span className="text-xl sm:text-2xl font-bold leading-none">{grade.score}</span>
              </div>
            </div>

            {/* Info Grid - Lebih Compact */}
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground font-medium min-w-0">Guru:</span>
                <span className="text-gray-900 truncate">{grade.teacher.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground font-medium">Tanggal:</span>
                <span className="text-gray-900">
                  {new Date(grade.exam_date).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 sm:py-12">
          <div className="rounded-full bg-muted p-3 sm:p-4 mx-auto w-fit mb-3 sm:mb-4">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <h3 className="font-medium text-sm sm:text-base">Belum Ada Nilai</h3>
            <p className="text-xs sm:text-sm text-muted-foreground px-4">
              Belum ada data nilai di semester ini.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-3 sm:p-4 lg:p-8 space-y-4 sm:space-y-6">
        {/* Header - More Compact on Mobile */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg flex-shrink-0">
              <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 leading-tight">
                Daftar Nilai Saya
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Berikut adalah daftar nilai yang telah Anda peroleh di semester ini.
            Pantau perkembangan akademik Anda dengan mudah.
          </p>
        </div>

        {/* Statistics Cards - Responsive Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">Total Nilai</CardTitle>
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg sm:text-2xl font-bold text-gray-800">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">Nilai tercatat</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">Rata-rata</CardTitle>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg sm:text-2xl font-bold text-gray-800">{stats.average}</div>
                <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">Nilai rata-rata</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">Tertinggi</CardTitle>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg sm:text-2xl font-bold text-gray-800">{stats.highest}</div>
                <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">Nilai tertinggi</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">Terendah</CardTitle>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg sm:text-2xl font-bold text-gray-800">{stats.lowest}</div>
                <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">Nilai terendah</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Card */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                Riwayat Nilai
              </CardTitle>
              {grades && grades.data.length > 0 && (
                <Badge variant="secondary" className="w-fit text-xs">
                  {grades.data.length} nilai ditampilkan
                </Badge>
              )}
            </div>

            {/* Filter - Responsive Width */}
            <div className="pt-2 sm:pt-3">
              <label className="text-xs sm:text-sm font-medium flex items-center gap-1 mb-1.5">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" /> 
                Filter Mata Pelajaran
              </label>
              <div className="w-full sm:max-w-xs">
                <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                  <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Tampilkan Semua Mapel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tampilkan Semua Mapel</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={String(subject.id)}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Desktop Table */}
            <DesktopTable />

            {/* Mobile Grid */}
            <MobileGrid />
          </CardContent>
        </Card>

        {/* Pagination - Mobile Optimized */}
        {grades && grades.data.length > 0 && grades.last_page > 1 && (
          <Card className="shadow-sm border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="py-3 sm:py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <span className="hidden sm:inline">Halaman </span>
                  {grades.current_page} dari {grades.last_page}
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Button
                    variant="outline" 
                    size="sm" 
                    className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
                    onClick={() => fetchGrades(grades.current_page - 1, selectedSubjectId)}
                    disabled={isLoading || grades.current_page <= 1}
                  >
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </Button>
                  <Button
                    variant="outline" 
                    size="sm" 
                    className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
                    onClick={() => fetchGrades(grades.current_page + 1, selectedSubjectId)}
                    disabled={isLoading || grades.current_page >= grades.last_page}
                  >
                    <span className="hidden sm:inline">Berikutnya</span>
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 sm:ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && (!grades || grades.data.length === 0) && (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="py-8 sm:py-12">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4 text-center">
                <div className="rounded-full bg-muted p-3 sm:p-4">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="font-medium text-sm sm:text-base">Belum Ada Nilai</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md px-4">
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