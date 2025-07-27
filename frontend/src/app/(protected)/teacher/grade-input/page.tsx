"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Users, BookOpen, Calendar, GraduationCap, AlertCircle, ScrollText } from "lucide-react";

// Tipe Data
interface MasterData {
  classes: { id: number; level: number; name: string }[];
  subjects: { id: number; name: string }[];
  grade_types: { id: number; name: string }[];
}
interface Student { id: number; name: string; }
interface Grades { [key: number]: string; } // { student_id: score }

export default function GradeInputPage() {
  const { activeSemester, activeSemesterId } = useAuth();
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filters, setFilters] = useState({ classId: "", subjectId: "", gradeTypeId: "" });
  const [examDate, setExamDate] = useState("");
  const [grades, setGrades] = useState<Grades>({});
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      setIsSaving(true);
      await api.post('/teacher/grades/bulk-store', {
        semester_id: activeSemesterId,
        subject_id: filters.subjectId,
        grade_type_id: filters.gradeTypeId,
        exam_date: examDate,
        grades: gradesPayload,
      });
      alert("Nilai berhasil disimpan!");
      setGrades({});
    } catch (error: any) {
      alert(`Gagal menyimpan: ${error.response?.data?.message || 'Error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper functions
  const getSelectedClassName = () => {
    if (!filters.classId || !masterData) return "";
    const selectedClass = masterData.classes.find(c => c.id === Number(filters.classId));
    return selectedClass ? `${selectedClass.level}-${selectedClass.name}` : "";
  };

  const getSelectedSubjectName = () => {
    if (!filters.subjectId || !masterData) return "";
    const selectedSubject = masterData.subjects.find(s => s.id === Number(filters.subjectId));
    return selectedSubject ? selectedSubject.name : "";
  };

  const getSelectedGradeTypeName = () => {
    if (!filters.gradeTypeId || !masterData) return "";
    const selectedGradeType = masterData.grade_types.find(gt => gt.id === Number(filters.gradeTypeId));
    return selectedGradeType ? selectedGradeType.name : "";
  };

  const getFilledGradesCount = () => {
    return Object.values(grades).filter(score => score.trim() !== "").length;
  };

  const isFormComplete = () => {
    return filters.classId && filters.subjectId && filters.gradeTypeId && examDate;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className=" sm:text-left space-y-2 mb-4">
          <div className="flex items-center sm:justify-start gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ScrollText className="h-6 w-6 text-purple-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Input Nilai Siswa
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Input dan kelola nilai siswa Anda dengan mudah. Gunakan filter untuk menemukan data yang Anda butuhkan.
          </p>
        </div>

        {/* Filter Configuration Card */}
        <Card className="mb-6 shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <GraduationCap className="h-5 w-5 text-primary" />
                Konfigurasi Penilaian
              </CardTitle>
              <div className="text-xs sm:text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                Semester: <strong>{activeSemester || 'Belum Diatur'}</strong>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Grid Filter - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Kelas */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Kelas
                  </Label>
                  <Select onValueChange={value => setFilters(f => ({...f, classId: value}))}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Pilih Kelas..." />
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

                {/* Mata Pelajaran */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Mata Pelajaran
                  </Label>
                  <Select onValueChange={value => setFilters(f => ({...f, subjectId: value}))}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Pilih Mapel..." />
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

                {/* Jenis Ujian */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Jenis Ujian
                  </Label>
                  <Select onValueChange={value => setFilters(f => ({...f, gradeTypeId: value}))}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Pilih Jenis Ujian..." />
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

                {/* Tanggal Ujian */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Tanggal Ujian
                  </Label>
                  <Input 
                    type="date" 
                    value={examDate} 
                    onChange={e => setExamDate(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Selected Configuration Summary */}
              {isFormComplete() && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-muted">
                  <h3 className="text-sm font-medium mb-2">Konfigurasi Terpilih:</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Kelas: {getSelectedClassName()}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Mapel: {getSelectedSubjectName()}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Ujian: {getSelectedGradeTypeName()}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Tanggal: {new Date(examDate).toLocaleDateString('id-ID')}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Students Input Section */}
        {students.length > 0 && (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Users className="h-5 w-5 text-primary" />
                  Daftar Siswa ({students.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Terisi: {getFilledGradesCount()}/{students.length}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Mobile Card Layout */}
              <div className="block sm:hidden space-y-3">
                {isLoadingStudents ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Memuat daftar murid...</p>
                  </div>
                ) : (
                  students.map((student, index) => (
                    <div key={student.id} className="p-4 border border-border/50 rounded-lg bg-background/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                            {index + 1}
                          </div>
                          <span className="font-medium text-sm">{student.name}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Nilai (0-100)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={grades[student.id] || ""}
                          onChange={(e) => handleGradeChange(student.id, e.target.value)}
                          placeholder="Masukkan nilai..."
                          className="h-9 text-center font-medium"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-16 font-semibold">No.</TableHead>
                      <TableHead className="font-semibold">Nama Murid</TableHead>
                      <TableHead className="w-48 font-semibold text-center">Input Nilai (0-100)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingStudents ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-12">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-muted-foreground">Memuat daftar murid...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student, index) => (
                        <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="text-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary mx-auto">
                              {index + 1}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={grades[student.id] || ""}
                              onChange={(e) => handleGradeChange(student.id, e.target.value)}
                              placeholder="--"
                              className="text-center font-medium h-9"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Save Button */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-6 pt-4 border-t border-border/50">
                <div className="text-sm text-muted-foreground">
                  {getFilledGradesCount() > 0 && (
                    <span>
                      {getFilledGradesCount()} dari {students.length} nilai telah diisi
                    </span>
                  )}
                </div>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSaving || getFilledGradesCount() === 0}
                  className="w-full sm:w-auto shadow-lg"
                  size="lg"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Semua Nilai'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State when no class selected */}
        {!isLoadingStudents && students.length === 0 && filters.classId === "" && (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="py-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Pilih Kelas Terlebih Dahulu</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Untuk memulai input nilai, silakan pilih kelas, mata pelajaran, jenis ujian, dan tanggal ujian terlebih dahulu.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State when class selected but no students */}
        {!isLoadingStudents && students.length === 0 && filters.classId !== "" && (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="py-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-muted p-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Tidak Ada Siswa</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Kelas yang dipilih tidak memiliki siswa atau terjadi kesalahan saat memuat data.
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