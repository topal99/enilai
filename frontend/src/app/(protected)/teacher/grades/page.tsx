"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Download, Filter, RotateCcw, ScrollText, ScrollTextIcon } from "lucide-react";

// Tipe Data (tidak berubah)
interface Grade {
  id: number;
  score: number;
  exam_date: string;
  student_profile: {
    user: { name: string };
    class_model: { level: number; name: string; };
  };
  subject: { name: string };
  grade_type: { name: string };
}
interface MasterData {
  classes: { id: number; level: number; name: string }[];
  subjects: { id: number; name: string }[];
  grade_types: { id: number; name: string }[];
}
interface PaginatedGrades {
  data: Grade[];
  current_page: number;
  last_page: number;
}
interface Filters {
  classId: string;
  subjectId: string;
  gradeTypeId: string;
  examDate: string;
}

export default function GradesListPage() {
  const { activeSemester } = useAuth();
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [grades, setGrades] = useState<PaginatedGrades | null>(null);
  const [filters, setFilters] = useState<Filters>({ classId: "", subjectId: "", gradeTypeId: "", examDate: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await api.post('/teacher/grades/export', {
        class_id: filters.classId,
        subject_id: filters.subjectId,
        grade_type_id: filters.gradeTypeId,
        exam_date: filters.examDate,
      }, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'daftar-nilai.xlsx';
      if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
          if (fileNameMatch.length === 2)
              fileName = fileNameMatch[1];
      }
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);

    } catch (error) {
      console.error("Gagal mengekspor data:", error);
      alert("Gagal mengekspor data.");
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    api.get('/teacher/grade-input-data').then(res => setMasterData(res.data));
  }, []);

  const fetchGrades = async (page = 1, currentFilters: Filters) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        exam_date: currentFilters.examDate,
        class_id: currentFilters.classId,
        subject_id: currentFilters.subjectId,
        grade_type_id: currentFilters.gradeTypeId,
      });
      
      Object.keys(currentFilters).forEach(key => {
        if (!params.get(key === 'examDate' ? 'exam_date' : key)) {
          params.delete(key === 'examDate' ? 'exam_date' : key);
        }
      });

      const response = await api.get(`/teacher/grades?${params.toString()}`);
      setGrades(response.data);
    } catch (error) {
      console.error("Gagal memuat daftar nilai:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFilterChange = (filterName: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };
  
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (Object.values(filters).every(val => val === "")) {
        alert("Pilih minimal satu filter untuk memulai pencarian.");
        return;
    }
    fetchGrades(1, filters);
  };

  const resetFilters = () => {
    setFilters({ classId: "", subjectId: "", gradeTypeId: "", examDate: "" });
    setGrades(null);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className=" sm:text-left space-y-2 mb-4">
          <div className="flex items-center sm:justify-start gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ScrollTextIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Daftar Nilai
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Kelola dan pantau nilai siswa Anda dengan mudah. Gunakan filter untuk menemukan data yang Anda butuhkan.
          </p>
        </div>

        {/* Filter Card */}
        <Card className="mb-6 shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Filter className="h-5 w-5 text-primary" />
                Filter Pencarian Nilai
              </CardTitle>
              <div className="text-xs sm:text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                Semester: <strong>{activeSemester || 'Belum Diatur'}</strong>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Grid Filter - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Kelas Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Kelas</Label>
                  <Select value={filters.classId} onValueChange={value => handleFilterChange('classId', value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Semua Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterData?.classes.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.level}-{c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mata Pelajaran Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Mata Pelajaran</Label>
                  <Select value={filters.subjectId} onValueChange={value => handleFilterChange('subjectId', value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Semua Mapel" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterData?.subjects.map(s => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Jenis Ujian Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Jenis Ujian</Label>
                  <Select value={filters.gradeTypeId} onValueChange={value => handleFilterChange('gradeTypeId', value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Semua Jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterData?.grade_types.map(gt => (
                        <SelectItem key={gt.id} value={String(gt.id)}>
                          {gt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tanggal Ujian Filter */}
                <div className="space-y-2">
                  <Label htmlFor="exam_date" className="text-sm font-medium">Tanggal Ujian</Label>
                  <Input 
                    id="exam_date" 
                    type="date" 
                    value={filters.examDate} 
                    onChange={e => handleFilterChange('examDate', e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button type="submit" className="flex-1 sm:flex-none h-10 p-2" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Cari Data
                </Button>
                <Button type="button" variant="outline" onClick={resetFilters} className="flex-1 sm:flex-none h-10 p-2" size="sm">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Filter
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Export Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-muted-foreground">
            {grades && `Menampilkan ${grades.data.length} dari total data`}
          </div>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            variant="default"
            size="sm"
            className="shadow-lg"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Mengekspor...' : 'Ekspor Excel'}
          </Button>
        </div>

        {/* Table Card */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Tanggal</TableHead>
                  <TableHead className="font-semibold">Nama Murid</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Kelas</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Mata Pelajaran</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Jenis Ujian</TableHead>
                  <TableHead className="font-semibold text-right">Nilai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground">Memuat data nilai...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : grades && grades.data.length > 0 ? (
                  grades.data.map(grade => (
                    <TableRow key={grade.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        <div className="text-sm">
                          {new Date(grade.exam_date).toLocaleDateString('id-ID', { 
                            day: '2-digit', 
                            month: 'short' 
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {grade.student_profile.user.name}
                          </div>
                          {/* Mobile: Show class info */}
                          <div className="text-xs text-muted-foreground sm:hidden">
                            {grade.student_profile.class_model.level}-{grade.student_profile.class_model.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm font-medium">
                          {grade.student_profile.class_model.level}-{grade.student_profile.class_model.name}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{grade.subject.name}</div>
                          {/* Mobile-md: Show grade type */}
                          <div className="text-xs text-muted-foreground lg:hidden">
                            {grade.grade_type.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">{grade.grade_type.name}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-primary">
                            {grade.score}
                          </div>
                          {/* Mobile: Show subject and grade type */}
                          <div className="text-xs text-muted-foreground md:hidden">
                            {grade.subject.name}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="rounded-full bg-muted p-3">
                          <Filter className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1 text-center">
                          <p className="font-medium">
                            {hasSearched ? "Tidak ada data nilai" : "Belum ada pencarian"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {hasSearched 
                              ? "Coba ubah filter pencarian Anda." 
                              : "Silakan pilih filter di atas untuk menampilkan data."
                            }
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Pagination */}
        {grades && grades.data.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-sm text-muted-foreground">
              Halaman {grades.current_page} dari {grades.last_page}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline" 
                size="sm"
                onClick={() => fetchGrades(grades.current_page - 1, filters)}
                disabled={grades.current_page <= 1}
                className="w-24"
              >
                Sebelumnya
              </Button>
              <div className="text-sm font-medium px-3 py-1 bg-muted rounded">
                {grades.current_page}
              </div>
              <Button
                variant="outline" 
                size="sm"
                onClick={() => fetchGrades(grades.current_page + 1, filters)}
                disabled={grades.current_page >= grades.last_page}
                className="w-24"
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}