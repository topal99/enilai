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
import { Download } from "lucide-react";

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
  examDate: string; // Hanya satu tanggal
}

export default function GradesListPage() {
  const { activeSemester } = useAuth();
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [grades, setGrades] = useState<PaginatedGrades | null>(null);
  // KOREKSI 3: Perbarui state awal filter
  const [filters, setFilters] = useState<Filters>({ classId: "", subjectId: "", gradeTypeId: "", examDate: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isExporting, setIsExporting] = useState(false); // State baru untuk loading export

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Panggil endpoint export dengan filter yang sedang aktif
      const response = await api.post('/teacher/grades/export', {
        class_id: filters.classId,
        subject_id: filters.subjectId,
        grade_type_id: filters.gradeTypeId,
        exam_date: filters.examDate,
      }, {
        responseType: 'blob', // Penting: agar respons dianggap sebagai file
      });

      // Buat URL sementara dari file blob yang diterima
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Ambil nama file dari header respons jika ada, jika tidak, buat nama default
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'daftar-nilai.xlsx';
      if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
          if (fileNameMatch.length === 2)
              fileName = fileNameMatch[1];
      }
      link.setAttribute('download', fileName);
      
      // Klik link secara programatik untuk memulai download
      document.body.appendChild(link);
      link.click();
      
      // Hapus link setelah selesai
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
        // KOREKSI 4: Kirim exam_date, bukan start_date/end_date
        exam_date: currentFilters.examDate,
        class_id: currentFilters.classId,
        subject_id: currentFilters.subjectId,
        grade_type_id: currentFilters.gradeTypeId,
      });
      // Hapus parameter kosong
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
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Daftar Nilai</h1>
      <Card>
        <CardHeader>
          <CardTitle>Filter Pencarian Nilai</CardTitle>
          <p className="text-muted-foreground">Semester Aktif: <strong>{activeSemester || 'Belum Diatur'}</strong></p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            {/* KOREKSI 5: Sederhanakan UI Filter */}
            <div className="lg:col-span-1"><Label>Kelas</Label><Select value={filters.classId} onValueChange={value => handleFilterChange('classId', value)}><SelectTrigger><SelectValue placeholder="Semua Kelas" /></SelectTrigger><SelectContent>{masterData?.classes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.level}-{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="lg:col-span-1"><Label>Mata Pelajaran</Label><Select value={filters.subjectId} onValueChange={value => handleFilterChange('subjectId', value)}><SelectTrigger><SelectValue placeholder="Semua Mapel" /></SelectTrigger><SelectContent>{masterData?.subjects.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="lg:col-span-1"><Label>Jenis Ujian</Label><Select value={filters.gradeTypeId} onValueChange={value => handleFilterChange('gradeTypeId', value)}><SelectTrigger><SelectValue placeholder="Semua Jenis" /></SelectTrigger><SelectContent>{masterData?.grade_types.map(gt => <SelectItem key={gt.id} value={String(gt.id)}>{gt.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="lg:col-span-1"><Label htmlFor="exam_date">Tanggal Ujian</Label><Input id="exam_date" type="date" value={filters.examDate} onChange={e => handleFilterChange('examDate', e.target.value)} /></div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2 items-end">
              <Button type="submit" className="w-full">Cari</Button>
              <Button type="button" variant="outline" onClick={resetFilters} className="w-full">Reset</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tombol Ekspor */}
      <div className="flex justify-end mt-4">
        <Button onClick={handleExport} disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Mengekspor...' : 'Ekspor ke Excel'}
        </Button>
      </div>

      <div className="mt-6 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal Ujian</TableHead>
              <TableHead>Nama Murid</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Mata Pelajaran</TableHead>
              <TableHead>Jenis Ujian</TableHead>
              <TableHead className="text-right">Nilai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center">Memuat data nilai...</TableCell></TableRow>
            ) : grades && grades.data.length > 0 ? (
              grades.data.map(grade => (
                <TableRow key={grade.id}>
                  <TableCell>{new Date(grade.exam_date).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>{grade.student_profile.user.name}</TableCell>
                  <TableCell>{grade.student_profile.class_model.level}-{grade.student_profile.class_model.name}</TableCell>
                  <TableCell>{grade.subject.name}</TableCell>
                  <TableCell>{grade.grade_type.name}</TableCell>
                  <TableCell className="text-right font-bold text-lg">{grade.score}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {/* KOREKSI 3: Tampilkan pesan yang berbeda berdasarkan state */}
                  {hasSearched ? "Tidak ada data nilai yang cocok dengan filter." : "Silakan pilih filter di atas untuk menampilkan data."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Paginasi hanya ditampilkan jika ada data */}
      {grades && grades.data.length > 0 && (
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline" size="sm"
              onClick={() => fetchGrades(grades!.current_page - 1, filters)}
              disabled={!grades || grades.current_page <= 1}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline" size="sm"
              onClick={() => fetchGrades(grades!.current_page + 1, filters)}
              disabled={!grades || grades.current_page >= grades.last_page}
            >
              Berikutnya
            </Button>
        </div>
      )}
    </div>
  );
}