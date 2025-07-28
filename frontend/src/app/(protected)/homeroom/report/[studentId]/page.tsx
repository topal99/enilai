"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { 
  User, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Sparkles
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Definisikan tipe data
interface GradeDetail { 
  score: number; 
  grade_type: { name: string }; 
  exam_date: string;
}
interface SubjectReport { 
  grades: GradeDetail[]; 
  average: number; 
}
interface ReportData { 
  [key: string]: SubjectReport; 
}
interface AiComment { 
  summary: string; 
  strengths: string; 
  areas_for_improvement: string; 
  recommendation: string; 
}
interface AttendanceSummary {
  hadir: number; 
  sakit: number; 
  izin: number; 
  alpa: number;
}
interface Report {
  student: { id: number; name: string , average_score: string};
  class: string;
  semester: string;
  report_data: ReportData;
  attendance_summary: AttendanceSummary;
}

export default function StudentReportPage() {
  const params = useParams();
  const studentId = params.studentId;
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiComment, setAiComment] = useState<AiComment | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (studentId) {
      api.get(`/homeroom/student/${studentId}/report`)
        .then(res => setReport(res.data))
        .catch(err => console.error("Gagal memuat rapor", err))
        .finally(() => setIsLoading(false));
    }
  }, [studentId]);

  const handleGenerateComment = async () => {
    if (!report || !report.report_data || Object.keys(report.report_data).length === 0) {
      alert("Tidak bisa membuat catatan. Siswa ini belum memiliki data nilai di semester ini.");
      return;
    }

    setIsAiLoading(true);
    setAiComment(null);
    try {
      let gradeSummary = "";
      for (const subject in report.report_data) {
        gradeSummary += `- ${subject}: Rata-rata ${report.report_data[subject].average}\n`;
      }

      const payload = {
        student_name: report.student.name,
        grade_summary: gradeSummary,
      };

      console.log("Mengirim payload ke AI:", payload);
      
      const res = await api.post('/homeroom/report/generate-comment', payload);
      setAiComment(res.data);
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        let errorMessage = "Validasi gagal:\n";
        for (const field in validationErrors) {
          errorMessage += `- ${validationErrors[field].join(', ')}\n`;
        }
        alert(errorMessage);
      } else {
        alert("Gagal menghasilkan komentar AI.");
        console.error(error);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const getGradeColor = (average: number) => {
    if (average >= 90) return "text-green-600 dark:text-green-400";
    if (average >= 80) return "text-blue-600 dark:text-blue-400";
    if (average >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getGradeBadge = (average: number) => {
    if (average >= 90) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Excellent</Badge>;
    if (average >= 80) return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Good</Badge>;
    if (average >= 70) return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Fair</Badge>;
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Needs Improvement</Badge>;
  };

  const totalAttendance = report ? 
    report.attendance_summary.hadir + 
    report.attendance_summary.sakit + 
    report.attendance_summary.izin + 
    report.attendance_summary.alpa : 0;

  const attendanceRate = totalAttendance > 0 ? 
    Math.round((report!.attendance_summary.hadir / totalAttendance) * 100) : 0;

  const average_score = report ?
    Object.values(report.report_data).reduce((sum, sub) => sum + sub.average, 0) / Object.keys(report.report_data).length : 0;

  const subj = Object.keys(report?.report_data || {}).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              Gagal memuat data rapor. Silakan coba lagi nanti.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: Object.keys(report.report_data),
    datasets: [{
      label: 'Rata-rata Nilai',
      data: Object.values(report.report_data).map((sub: any) => sub.average),
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 md:p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <User className="h-8 w-8" />
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Rapor Akademik</h1>
            </div>
            <p className="text-xl md:text-2xl font-semibold mb-2">{report.student.name}</p>
            <div className="flex flex-wrap gap-4 text-sm md:text-base opacity-90">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Kelas: {report.class}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Semester: {report.semester}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-green-700 dark:text-green-300">{report.attendance_summary.hadir}</p>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Hadir</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300">{report.attendance_summary.sakit}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Sakit</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-yellow-700 dark:text-yellow-300">{report.attendance_summary.izin}</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Izin</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardContent className="p-4 text-center">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-red-700 dark:text-red-300">{report.attendance_summary.alpa}</p>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">Alpa</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Rate Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <TrendingUp className="h-5 w-5" />
                Tingkat Kehadiran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{attendanceRate}%</p>
                  <p className="text-sm text-muted-foreground">dari {totalAttendance} hari sekolah</p>
                </div>
                <div className="w-24 h-24 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - attendanceRate / 100)}`}
                      className="text-indigo-600 dark:text-indigo-400"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Average Score Card */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <TrendingUp className="h-5 w-5" />
                Rata-rata Nilai Keseluruhan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{average_score}</p>
                  <p className="text-sm text-muted-foreground">dari {subj} Mapel</p>
                </div>
                <div className="w-24 h-24 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - average_score / 100)}`}
                      className="text-indigo-600 dark:text-indigo-400"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Chart Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Grafik Rata-rata Nilai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 md:h-80">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
        
        {/* AI Comment Section */}
        <Card className="shadow-lg border-purple-200 dark:border-purple-800">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <MessageSquare className="h-5 w-5" />
              Catatan Wali Kelas (AI Generated)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {aiComment ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📝 Ringkasan</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{aiComment.summary}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">💪 Kekuatan</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">{aiComment.strengths}</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border-l-4 border-yellow-500">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">📈 Area Peningkatan</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">{aiComment.areas_for_improvement}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🎯 Rekomendasi</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">{aiComment.recommendation}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">Belum ada catatan AI untuk siswa ini.</p>
              </div>
            )}
            <Button 
              onClick={handleGenerateComment} 
              disabled={isAiLoading} 
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
              size="lg"
            >
              {isAiLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Membuat Catatan...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Buat Catatan dengan AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(report.report_data as ReportData).map(([subject, data]) => (
            <Card key={subject} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-lg md:text-xl">{subject}</CardTitle>
                  <div className="flex items-center gap-3">
                    {getGradeBadge(data.average)}
                    <span className={`text-2xl md:text-3xl font-bold ${getGradeColor(data.average)}`}>
                      {data.average}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold text-xs md:text-sm">Jenis Penilaian</TableHead>
                        <TableHead className="font-bold text-xs md:text-sm text-center">Nilai</TableHead>
                        <TableHead className="font-bold text-xs md:text-sm">Tanggal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.grades.map((grade, index) => (
                        <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableCell className="text-xs md:text-sm">{grade.grade_type.name}</TableCell>
                          <TableCell className="text-xs md:text-sm text-center">
                            <Badge variant="outline" className={getGradeColor(grade.score)}>
                              {grade.score}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs md:text-sm text-muted-foreground">
                            {new Date(grade.exam_date).toLocaleDateString('id-ID', {
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric'
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}