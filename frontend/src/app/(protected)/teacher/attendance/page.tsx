"use client";

import { useEffect, useState, FormEvent, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, Users, Calendar, CheckCircle2, XCircle, Clock, AlertTriangle, Save, RotateCcw, UserCheck2 } from "lucide-react";
import { toast } from "sonner";

// Tipe Data
interface ClassModel { id: number; level: number; name: string; }
interface Student { id: number; name: string; student_profile: {id: number} }
interface AttendanceRecord { status: string; notes: string; }
interface Attendances { [key: number]: AttendanceRecord; }

const statusConfig = {
  hadir: { label: "Hadir", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-200" },
  sakit: { label: "Sakit", icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
  izin: { label: "Izin", icon: Clock, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  alpa: { label: "Alpa", icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200" },
};

export default function AttendancePage() {
  const { activeSemesterId } = useAuth();
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filters, setFilters] = useState({ classId: "", attendanceDate: "" });
  const [attendances, setAttendances] = useState<Attendances>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<{ message: string; taken: boolean } | null>(null);

  useEffect(() => {
    api.get('/classes-all').then(res => setClasses(res.data));
  }, []);
  
  const checkTodayStatus = useCallback(async (classId: string) => {
    if (!classId) {
      setAttendanceStatus(null);
      return;
    }
    try {
      const res = await api.get(`/teacher/attendance/status?class_model_id=${classId}`);
      if (res.data.status === 'taken') {
        setAttendanceStatus({ message: `Sudah diabsen untuk hari ini oleh: ${res.data.teacher_name}`, taken: true });
      } else {
        setAttendanceStatus({ message: "Belum ada absensi untuk hari ini.", taken: false });
        const notifiedKey = `notified_${classId}_${new Date().toISOString().slice(0, 10)}`;
        if (!sessionStorage.getItem(notifiedKey)) {
          toast.info("Pengingat Absensi", {
            description: `Anda belum mengisi absensi untuk kelas yang dipilih hari ini.`,
            duration: 5000,
          });
          sessionStorage.setItem(notifiedKey, 'true');
        }
      }
    } catch (error) { console.error("Gagal mengecek status absensi", error); }
  }, []);

  const handleFilterChange = (filterName: 'classId' | 'attendanceDate', value: string) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);

    if (filterName === 'classId') {
      checkTodayStatus(value);
    }
  };

  const handleShowStudents = async (e: FormEvent) => {
    e.preventDefault();
    if (!filters.classId || !filters.attendanceDate) {
      alert("Harap lengkapi pilihan Kelas dan Tanggal.");
      return;
    }
    
    setIsLoading(true);
    setIsFormVisible(true);
    try {
      const studentsRes = await api.get(`/teacher/students-by-class?class_id=${filters.classId}`);
      const studentList: Student[] = studentsRes.data;
      setStudents(studentList);

      const historyParams = { class_model_id: filters.classId, attendance_date: filters.attendanceDate };
      const historyRes = await api.get('/teacher/attendances', { params: historyParams });
      const historyData: { student_id: number, status: string, notes: string }[] = historyRes.data;

      const initialAttendances: Attendances = {};
      studentList.forEach((student) => {
        const existingRecord = historyData.find(h => h.student_id === student.student_profile.id);
        initialAttendances[student.id] = {
          status: existingRecord?.status || 'hadir',
          notes: existingRecord?.notes || '',
        };
      });
      setAttendances(initialAttendances);
    } catch (error) {
      console.error("Gagal memuat data:", error);
      alert("Gagal memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendanceChange = (studentId: number, type: 'status' | 'notes', value: string) => {
    setAttendances(prev => ({ ...prev, [studentId]: { ...prev[studentId], [type]: value } }));
  };

  const resetForm = () => {
    setFilters({ classId: "", attendanceDate: "" });
    setStudents([]);
    setAttendances({});
    setIsFormVisible(false);
    setAttendanceStatus(null);
  };

  const handleSubmit = async () => {
    const payload = Object.entries(attendances).map(([studentUserId, data]) => ({
      student_user_id: Number(studentUserId), status: data.status, notes: data.notes,
    }));

    try {
      setIsSaving(true);
      await api.post('/teacher/attendances/bulk-store', {
        semester_id: activeSemesterId, class_model_id: filters.classId,
        attendance_date: filters.attendanceDate, attendances: payload,
      });
      alert("Absensi berhasil disimpan!");
      resetForm();
    } catch (error: any) { 
      alert(`Gagal menyimpan: ${error.response?.data?.message || 'Error'}`); 
    } finally {
      setIsSaving(false);
    }
  };

  const getSelectedClassName = () => {
    if (!filters.classId) return "";
    const selectedClass = classes.find(c => c.id === Number(filters.classId));
    return selectedClass ? `${selectedClass.level}-${selectedClass.name}` : "";
  };

  const getAttendanceSummary = () => {
    const summary = { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
    Object.values(attendances).forEach(record => {
      if (record.status in summary) {
        summary[record.status as keyof typeof summary]++;
      }
    });
    return summary;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className=" sm:text-left space-y-2 mb-4">
          <div className="flex items-center sm:justify-start gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserCheck2 className="h-6 w-6 text-purple-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Absensi Kehadiran Siswa
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Kelola kehadiran siswa dengan mudah. Pilih kelas dan tanggal untuk mulai mengisi absensi.
          </p>
        </div>

        {/* Status Alert */}
        {attendanceStatus && (
          <Alert className={`mb-6 border-2 ${attendanceStatus.taken ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
            <Info className="h-4 w-4" />
            <AlertTitle className="font-semibold">Status Absensi Hari Ini</AlertTitle>
            <AlertDescription className="mt-1">{attendanceStatus.message}</AlertDescription>
          </Alert>
        )}

        {/* Filter Card */}
        <Card className="mb-6 shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="h-5 w-5 text-primary" />
              Pilih Kelas dan Tanggal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleShowStudents} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Kelas Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Kelas
                  </Label>
                  <Select value={filters.classId} onValueChange={value => handleFilterChange('classId', value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Pilih Kelas..." />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.level}-{c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Tanggal Absensi
                  </Label>
                  <Input 
                    type="date" 
                    value={filters.attendanceDate} 
                    onChange={e => handleFilterChange('attendanceDate', e.target.value)}
                    className="h-10"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-end">
                  <Button type="submit" className="w-full h-10" disabled={!filters.classId || !filters.attendanceDate}>
                    <Users className="mr-2 h-4 w-4" />
                    Tampilkan Siswa
                  </Button>
                </div>
              </div>

              {/* Selected Info */}
              {filters.classId && filters.attendanceDate && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-muted">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Kelas: {getSelectedClassName()}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Tanggal: {new Date(filters.attendanceDate).toLocaleDateString('id-ID')}
                    </Badge>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Students Attendance Form */}
        {isFormVisible && (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Users className="h-5 w-5 text-primary" />
                  Daftar Kehadiran Siswa ({students.length})
                </CardTitle>
                {students.length > 0 && !isLoading && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(getAttendanceSummary()).map(([status, count]) => {
                      const config = statusConfig[status as keyof typeof statusConfig];
                      const Icon = config.icon;
                      return (
                        <Badge key={status} variant="outline" className="text-xs">
                          <Icon className="mr-1 h-3 w-3" />
                          {config.label}: {count}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Mobile Card Layout */}
              <div className="block lg:hidden space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Memuat daftar murid...</p>
                  </div>
                ) : (
                  students.map((student, index) => (
                    <div key={student.id} className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      attendances[student.id] ? statusConfig[attendances[student.id].status as keyof typeof statusConfig].bg : 'bg-background border-border/50'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                            {index + 1}
                          </div>
                          <span className="font-medium text-sm">{student.name}</span>
                        </div>
                      </div>
                      
                      {/* Status Selection */}
                      <div className="space-y-3">
                        <Label className="text-xs font-medium text-muted-foreground">Status Kehadiran</Label>
                        <RadioGroup 
                          value={attendances[student.id]?.status || 'hadir'} 
                          onValueChange={(value) => handleAttendanceChange(student.id, 'status', value)}
                          className="grid grid-cols-2 gap-2"
                        >
                          {Object.entries(statusConfig).map(([status, config]) => {
                            const Icon = config.icon;
                            return (
                              <div key={status} className="flex items-center space-x-2 p-2 rounded border border-border/50 hover:bg-muted/30 transition-colors">
                                <RadioGroupItem value={status} id={`mobile-${student.id}-${status}`} />
                                <Label htmlFor={`mobile-${student.id}-${status}`} className="flex items-center gap-1 text-xs cursor-pointer">
                                  <Icon className={`h-3 w-3 ${config.color}`} />
                                  {config.label}
                                </Label>
                              </div>
                            );
                          })}
                        </RadioGroup>
                        
                        {/* Notes Input */}
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">Catatan (Opsional)</Label>
                          <Input
                            value={attendances[student.id]?.notes || ""}
                            onChange={(e) => handleAttendanceChange(student.id, 'notes', e.target.value)}
                            placeholder="Tambahkan catatan..."
                            className="text-sm h-8"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-16 font-semibold">#</TableHead>
                      <TableHead className="font-semibold">Nama Murid</TableHead>
                      <TableHead className="font-semibold">Status Kehadiran</TableHead>
                      <TableHead className="font-semibold">Catatan (Opsional)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12">
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
                          <TableCell className="font-medium align-top pt-4">{student.name}</TableCell>
                          <TableCell>
                            <RadioGroup 
                              value={attendances[student.id]?.status || 'hadir'} 
                              onValueChange={(value) => handleAttendanceChange(student.id, 'status', value)} 
                              className="flex flex-wrap items-center gap-x-4 gap-y-2"
                            >
                              {Object.entries(statusConfig).map(([status, config]) => {
                                const Icon = config.icon;
                                return (
                                  <div key={status} className="flex items-center space-x-2">
                                    <RadioGroupItem value={status} id={`desktop-${student.id}-${status}`} />
                                    <Label htmlFor={`desktop-${student.id}-${status}`} className="flex items-center gap-1 cursor-pointer">
                                      <Icon className={`h-4 w-4 ${config.color}`} />
                                      {config.label}
                                    </Label>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={attendances[student.id]?.notes || ""} 
                              onChange={(e) => handleAttendanceChange(student.id, 'notes', e.target.value)} 
                              placeholder="Tambahkan catatan..."
                              className="min-w-[200px]"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-6 pt-4 border-t border-border/50">
                <div className="text-sm text-muted-foreground">
                  {students.length > 0 && `Total ${students.length} siswa`}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={resetForm}
                    className="shadow-lg"
                    size="sm"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSaving || isLoading || students.length === 0}
                    className="shadow-lg"
                    size="sm"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Menyimpan...' : 'Simpan Absensi'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isFormVisible && (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="py-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Siap untuk Input Absensi</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Pilih kelas dan tanggal absensi di atas untuk memulai input kehadiran siswa.
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