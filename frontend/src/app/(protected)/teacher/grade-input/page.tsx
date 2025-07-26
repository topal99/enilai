"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Tipe Data
interface MasterData {
  classes: { id: number; level: number; name: string }[];
  subjects: { id: number; name: string }[];
  grade_types: { id: number; name: string }[];
}
interface Student { id: number; name: string; }
interface Grades { [key: number]: string; } // { student_id: score }

export default function GradeInputPage() {
  const { activeSemester, activeSemesterId } = useAuth(); // Kita akan tambahkan activeSemesterId ke AuthContext
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filters, setFilters] = useState({ classId: "", subjectId: "", gradeTypeId: "" });
  const [examDate, setExamDate] = useState("");
  const [grades, setGrades] = useState<Grades>({});
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  useEffect(() => {
    api.get('/teacher/grade-input-data').then(res => setMasterData(res.data));
  }, []);

  useEffect(() => {
    if (filters.classId) {
      setIsLoadingStudents(true);
      api.get(`/teacher/students-by-class?class_id=${filters.classId}`)
        .then(res => setStudents(res.data))
        .finally(() => setIsLoadingStudents(false));
    } else {
      setStudents([]);
    }
  }, [filters.classId]);

  const handleGradeChange = (studentId: number, score: string) => {
    setGrades(prev => ({ ...prev, [studentId]: score }));
  };

  const handleSubmit = async () => {
    if (!activeSemesterId || !filters.subjectId || !filters.gradeTypeId || !examDate) {
      alert("Harap lengkapi semua filter dan tanggal ujian.");
      return;
    }
    
    const gradesPayload = Object.entries(grades)
      .filter(([_, score]) => score.trim() !== "")
      .map(([studentId, score]) => ({
        student_id: Number(studentId),
        score: Number(score),
      }));

    if (gradesPayload.length === 0) {
      alert("Tidak ada nilai yang diinput.");
      return;
    }

    try {
      await api.post('/teacher/grades/bulk-store', {
        semester_id: activeSemesterId,
        subject_id: filters.subjectId,
        grade_type_id: filters.gradeTypeId,
        exam_date: examDate,
        grades: gradesPayload,
      });
      alert("Nilai berhasil disimpan!");
      setGrades({}); // Kosongkan input setelah berhasil
    } catch (error: any) {
      alert(`Gagal menyimpan: ${error.response?.data?.message || 'Error'}`);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Input Nilai Siswa</h1>
      <Card>
        <CardHeader>
          <CardTitle>Filter Data Penilaian</CardTitle>
          <p className="text-muted-foreground">Semester Aktif: <strong>{activeSemester || 'Belum Diatur'}</strong></p>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Select onValueChange={value => setFilters(f => ({...f, classId: value}))}>
            <SelectTrigger><SelectValue placeholder="Pilih Kelas..." /></SelectTrigger>
            <SelectContent>{masterData?.classes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.level}-{c.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select onValueChange={value => setFilters(f => ({...f, subjectId: value}))}>
            <SelectTrigger><SelectValue placeholder="Pilih Mapel..." /></SelectTrigger>
            <SelectContent>{masterData?.subjects.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select onValueChange={value => setFilters(f => ({...f, gradeTypeId: value}))}>
            <SelectTrigger><SelectValue placeholder="Pilih Jenis Ujian..." /></SelectTrigger>
            <SelectContent>{masterData?.grade_types.map(gt => <SelectItem key={gt.id} value={String(gt.id)}>{gt.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} />
        </CardContent>
      </Card>

      {students.length > 0 && (
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Murid</TableHead>
                <TableHead className="w-48">Input Nilai (0-100)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingStudents ? (
                <TableRow><TableCell colSpan={2} className="text-center">Memuat daftar murid...</TableCell></TableRow>
              ) : (
                students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={grades[student.id] || ""}
                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                        placeholder="--"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="text-right mt-4">
            <Button onClick={handleSubmit}>Simpan Semua Nilai</Button>
          </div>
        </div>
      )}
    </div>
  );
}