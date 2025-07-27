"use client";

import { useEffect, useState, FormEvent } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Download,
  FileText,
  UserCheck2
} from "lucide-react";

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

const statusConfig = {
  hadir_count: { label: "Hadir", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  sakit_count: { label: "Sakit", icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-100" },
  izin_count: { label: "Izin", icon: Clock, color: "text-blue-600", bg: "bg-blue-100" },
  alpa_count: { label: "Alpa", icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
};

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

  const getSelectedClassName = () => {
    if (!filters.classId) return "";
    const selectedClass = classes.find(c => c.id === Number(filters.classId));
    return selectedClass ? `${selectedClass.level}-${selectedClass.name}` : "";
  };

  const getDateRange = () => {
    if (!filters.startDate || !filters.endDate) return "";
    const start = new Date(filters.startDate).toLocaleDateString('id-ID');
    const end = new Date(filters.endDate).toLocaleDateString('id-ID');
    return `${start} - ${end}`;
  };

  const getOverallStats = () => {
    if (summaryData.length === 0) return null;
    
    // KOREKSI: Gunakan nama kunci yang sama dengan data API (_count)
    const totals = summaryData.reduce((acc, student) => ({
      hadir_count: acc.hadir_count + student.hadir_count,
      sakit_count: acc.sakit_count + student.sakit_count,
      izin_count: acc.izin_count + student.izin_count,
      alpa_count: acc.alpa_count + student.alpa_count,
    }), { hadir_count: 0, sakit_count: 0, izin_count: 0, alpa_count: 0 });

    const totalDays = totals.hadir_count + totals.sakit_count + totals.izin_count + totals.alpa_count;
    const avgPercentage = summaryData.reduce((sum, student) => sum + student.percentage, 0) / summaryData.length;

    return { ...totals, totalDays, avgPercentage };
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const overallStats = getOverallStats();

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
              Laporan Kehadiran Siswa
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Gunakan fitur ini untuk melihat rekap kehadiran siswa berdasarkan kelas dan rentang tanggal yang dipilih. 
            Laporan ini memberikan gambaran lengkap tentang kehadiran siswa, termasuk jumlah hari hadir, sakit, izin, dan alpa.
          </p>
        </div>


        {/* Filter Card */}
        <Card className="mb-6 shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <BarChart3 className="h-5 w-5 text-primary" />
              Filter Laporan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Kelas Selection */}
                <div className="sm:col-span-2 lg:col-span-2 space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Kelas
                  </Label>
                  <Select value={filters.classId} onValueChange={v => setFilters(f => ({...f, classId: v}))}>
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

                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="start_date" className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Tanggal Mulai
                  </Label>
                  <Input 
                    id="start_date" 
                    type="date" 
                    value={filters.startDate} 
                    onChange={e => setFilters(f => ({...f, startDate: e.target.value}))}
                    className="h-10"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor="end_date" className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Tanggal Akhir
                  </Label>
                  <Input 
                    id="end_date" 
                    type="date" 
                    value={filters.endDate} 
                    onChange={e => setFilters(f => ({...f, endDate: e.target.value}))}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto h-10" 
                  disabled={!filters.classId || !filters.startDate || !filters.endDate}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Tampilkan Rekap
                </Button>
              </div>

              {/* Selected Filter Info */}
              {filters.classId && filters.startDate && filters.endDate && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-muted">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Kelas: {getSelectedClassName()}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Period: {getDateRange()}
                    </Badge>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Overall Stats Cards */}
        {overallStats && summaryData.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Siswa</p>
                    <p className="text-lg font-bold">{summaryData.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {Object.entries(statusConfig).map(([key, config]) => {
              const Icon = config.icon;
              const count = overallStats[key as keyof typeof overallStats] as number;
              return (
                <Card key={key} className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${config.bg}`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{config.label}</p>
                        <p className="text-lg font-bold">{count}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Results Section */}
        {hasSearched && (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <FileText className="h-5 w-5 text-primary" />
                  Rekap Kehadiran Siswa
                  {summaryData.length > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {summaryData.length} siswa
                    </Badge>
                  )}
                </CardTitle>
                {summaryData.length > 0 && overallStats && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      Rata-rata: {overallStats.avgPercentage.toFixed(1)}%
                    </span>
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
                    <p className="text-muted-foreground">Memuat data rekap...</p>
                  </div>
                ) : summaryData.length > 0 ? (
                  summaryData.map((student, index) => (
                    <div key={student.user.name} className="p-4 border border-border/50 rounded-lg bg-background/50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                            {index + 1}
                          </div>
                          <span className="font-medium text-sm">{student.user.name}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-semibold ${getPercentageColor(student.percentage)}`}
                        >
                          {student.percentage}%
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Kehadiran</span>
                          <span>{student.percentage}%</span>
                        </div>
                        <Progress 
                          value={student.percentage} 
                          className="h-2"
                        />
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(statusConfig).map(([key, config]) => {
                          const Icon = config.icon;
                          const count = student[key as keyof SummaryData] as number;
                          return (
                            <div key={key} className="flex items-center gap-2 p-2 rounded border border-border/30">
                              <Icon className={`h-4 w-4 ${config.color}`} />
                              <div className="text-xs">
                                <div className="font-medium">{count}</div>
                                <div className="text-muted-foreground">{config.label}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="rounded-full bg-muted p-4 w-fit mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-2">Tidak Ada Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Tidak ada data absensi pada rentang tanggal yang dipilih.
                    </p>
                  </div>
                )}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-16 font-semibold">#</TableHead>
                      <TableHead className="font-semibold">Nama Murid</TableHead>
                      <TableHead className="font-semibold text-center">Hadir</TableHead>
                      <TableHead className="font-semibold text-center">Sakit</TableHead>
                      <TableHead className="font-semibold text-center">Izin</TableHead>
                      <TableHead className="font-semibold text-center">Alpa</TableHead>
                      <TableHead className="font-semibold text-center">Kehadiran (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-muted-foreground">Memuat data rekap...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : summaryData.length > 0 ? (
                      summaryData.map((student, index) => (
                        <TableRow key={student.user.name} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="text-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary mx-auto">
                              {index + 1}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{student.user.name}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              {student.hadir_count}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                              {student.sakit_count}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              {student.izin_count}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-red-600 border-red-200">
                              {student.alpa_count}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`font-bold text-lg ${getPercentageColor(student.percentage)}`}>
                                {student.percentage}%
                              </span>
                              <Progress 
                                value={student.percentage} 
                                className="w-20 h-1"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center space-y-3">
                            <div className="rounded-full bg-muted p-3">
                              <FileText className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-1 text-center">
                              <p className="font-medium">Tidak Ada Data Absensi</p>
                              <p className="text-sm text-muted-foreground">
                                Tidak ada data absensi pada rentang tanggal yang dipilih.
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!hasSearched && (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="py-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-muted p-4">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Siap untuk Analisis</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Pilih kelas dan rentang tanggal di atas untuk melihat rekap kehadiran siswa dalam bentuk laporan yang komprehensif.
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