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
import { Info } from "lucide-react";
import { toast } from "sonner";

// Tipe Data
interface ClassModel { id: number; level: number; name: string; }
interface Student { id: number; name: string; student_profile: {id: number} }
interface AttendanceRecord { status: string; notes: string; }
interface Attendances { [key: number]: AttendanceRecord; }

export default function AttendancePage() {
  const { activeSemesterId } = useAuth();
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // KOREKSI 1: Gunakan satu state object untuk semua filter
  const [filters, setFilters] = useState({ classId: "", attendanceDate: "" });

  const [attendances, setAttendances] = useState<Attendances>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  // State untuk notifikasi status, selalu objek
  const [attendanceStatus, setAttendanceStatus] = useState<{ message: string; taken: boolean } | null>(null);

  // Ambil data kelas saat komponen dimuat
  useEffect(() => {
    // KOREKSI 2: Alamat API yang benar
    api.get('/classes-all').then(res => setClasses(res.data));
  }, []);
  
  // Cek status absensi HARI INI secara otomatis saat kelas dipilih
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
        // Tampilkan popup HANYA JIKA belum diabsen dan notif belum pernah muncul
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
  }, [toast]);

  // Handler untuk mengubah filter
  const handleFilterChange = (filterName: 'classId' | 'attendanceDate', value: string) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);

    // Jika yang berubah adalah classId, panggil checkStatus
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
      await api.post('/teacher/attendances/bulk-store', {
        semester_id: activeSemesterId, class_model_id: filters.classId,
        attendance_date: filters.attendanceDate, attendances: payload,
      });
      alert("Absensi berhasil disimpan!");
      resetForm();
    } catch (error: any) { alert(`Gagal menyimpan: ${error.response?.data?.message || 'Error'}`); }
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Input Absensi Harian</h1>

      {/* Notifikasi Status Absensi Harian (muncul setelah kelas dipilih) */}
      {attendanceStatus && (
        <Alert className="mb-4" variant={attendanceStatus.taken ? "default" : "destructive"}>
          <Info className="h-4 w-4" />
          <AlertTitle>Status Absensi Hari Ini</AlertTitle>
          <AlertDescription>{attendanceStatus.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader><CardTitle>Pilih Kelas dan Tanggal</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleShowStudents} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5"><Label>Kelas</Label><Select value={filters.classId} onValueChange={value => handleFilterChange('classId', value)}><SelectTrigger><SelectValue placeholder="Pilih Kelas..." /></SelectTrigger><SelectContent>{classes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.level}-{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5"><Label>Tanggal</Label><Input type="date" value={filters.attendanceDate} onChange={e => handleFilterChange('attendanceDate', e.target.value)} /></div>
            <Button type="submit">Tampilkan Siswa</Button>
          </form>
        </CardContent>
      </Card>

      {isFormVisible && (
        <div className="mt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader><TableRow><TableHead>Nama Murid</TableHead><TableHead>Status Kehadiran</TableHead><TableHead>Catatan (Opsional)</TableHead></TableRow></TableHeader>
              <TableBody>
                {isLoading ? ( <TableRow><TableCell colSpan={3} className="text-center">Memuat daftar murid...</TableCell></TableRow>) : (
                  students.map(student => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium align-top pt-4">{student.name}</TableCell>
                      <TableCell>
                        <RadioGroup value={attendances[student.id]?.status} onValueChange={(value) => handleAttendanceChange(student.id, 'status', value)} className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          <div className="flex items-center space-x-2"><RadioGroupItem value="hadir" id={`s${student.id}-h`} /><Label htmlFor={`s${student.id}-h`}>Hadir</Label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="sakit" id={`s${student.id}-s`} /><Label htmlFor={`s${student.id}-s`}>Sakit</Label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="izin" id={`s${student.id}-i`} /><Label htmlFor={`s${student.id}-i`}>Izin</Label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="alpa" id={`s${student.id}-a`} /><Label htmlFor={`s${student.id}-a`}>Alpa</Label></div>
                        </RadioGroup>
                      </TableCell>
                      <TableCell><Input value={attendances[student.id]?.notes || ""} onChange={(e) => handleAttendanceChange(student.id, 'notes', e.target.value)} placeholder="-" /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="text-right mt-4">
            <Button onClick={handleSubmit} disabled={isLoading}>Simpan Absensi</Button>
          </div>
        </div>
      )}
    </div>
  );
}