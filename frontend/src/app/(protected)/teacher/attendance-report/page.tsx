"use client";

import { useEffect, useState, FormEvent } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Tipe Data
interface SummaryData {
  user: { name: string };
  hadir_count: number;
  sakit_count: number;
  izin_count: number;
  alpa_count: number;
  percentage: number;
}
interface ClassModel { id: number; level: number; name: string }

export default function AttendanceReportPage() {
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData[]>([]);
  const [filters, setFilters] = useState({ classId: "", startDate: "", endDate: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    api.get('/classes-all').then(res => setClasses(res.data));
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!filters.classId || !filters.startDate || !filters.endDate) {
      alert("Harap lengkapi pilihan Kelas dan kedua Tanggal.");
      return;
    }
    
    setIsLoading(true);
    setHasSearched(true);
    try {
      const params = {
        class_model_id: filters.classId,
        start_date: filters.startDate,
        end_date: filters.endDate
      };
      const response = await api.get('/teacher/attendances/summary', { params });
      setSummaryData(response.data);
    } catch (error) {
      console.error("Gagal memuat rekap absensi:", error);
      alert("Gagal memuat rekap absensi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Laporan Rekapitulasi Absensi</h1>
      <Card>
        <CardHeader><CardTitle>Pilih Kelas dan Rentang Tanggal</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2"><Label>Kelas</Label><Select value={filters.classId} onValueChange={v => setFilters(f => ({...f, classId: v}))}><SelectTrigger><SelectValue placeholder="Pilih Kelas..." /></SelectTrigger><SelectContent>{classes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.level}-{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label htmlFor="start_date">Tanggal Mulai</Label><Input id="start_date" type="date" value={filters.startDate} onChange={e => setFilters(f => ({...f, startDate: e.target.value}))} /></div>
            <div><Label htmlFor="end_date">Tanggal Akhir</Label><Input id="end_date" type="date" value={filters.endDate} onChange={e => setFilters(f => ({...f, endDate: e.target.value}))} /></div>
            <Button type="submit" className="md:col-start-4">Tampilkan Rekap</Button>
          </form>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="mt-6 rounded-md border">
          <Table>
            <TableHeader><TableRow><TableHead>Nama Murid</TableHead><TableHead>Hadir</TableHead><TableHead>Sakit</TableHead><TableHead>Izin</TableHead><TableHead>Alpa</TableHead><TableHead>Kehadiran (%)</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Memuat data rekap...</TableCell></TableRow>
              ) : summaryData.length > 0 ? (
                summaryData.map(student => (
                  <TableRow key={student.user.name}>
                    <TableCell className="font-medium">{student.user.name}</TableCell>
                    <TableCell>{student.hadir_count}</TableCell>
                    <TableCell>{student.sakit_count}</TableCell>
                    <TableCell>{student.izin_count}</TableCell>
                    <TableCell>{student.alpa_count}</TableCell>
                    <TableCell className="font-semibold">{student.percentage}%</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6} className="text-center">Tidak ada data absensi pada rentang tanggal yang dipilih.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}