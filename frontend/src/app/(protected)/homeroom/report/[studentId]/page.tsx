"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Bar } from 'react-chartjs-2'; // Import chart
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Definisikan tipe data
interface GradeDetail { score: number; grade_type: { name: string }; exam_date: string;
}
interface SubjectReport { grades: GradeDetail[]; average: number; }
interface ReportData { [key: string]: SubjectReport; }
interface AiComment { summary: string; strengths: string; areas_for_improvement: string; recommendation: string; }
interface AttendanceSummary {
  hadir: number; sakit: number; izin: number; alpa: number;
}
interface Report {
  student: { id: number; name: string };
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
    // KOREKSI UTAMA: Tambahkan blok pengecekan di bagian atas fungsi
    if (!report || !report.report_data || Object.keys(report.report_data).length === 0) {
      alert("Tidak bisa membuat catatan. Siswa ini belum memiliki data nilai di semester ini.");
      return; // Hentikan eksekusi fungsi jika tidak ada nilai
    }

    setIsAiLoading(true);
    setAiComment(null);
    try {
      // Buat ringkasan nilai di frontend
      let gradeSummary = "";
      for (const subject in report.report_data) {
        gradeSummary += `- ${subject}: Rata-rata ${report.report_data[subject].average}\n`;
      }

      // Buat payload untuk dikirim
      const payload = {
        student_name: report.student.name,
        grade_summary: gradeSummary,
      };

      // Untuk debugging, Anda bisa lihat apa yang dikirim
      console.log("Mengirim payload ke AI:", payload);
      
      const res = await api.post('/homeroom/report/generate-comment', payload);

      setAiComment(res.data);
    } catch (error: any) {
      // Tampilkan error validasi dari Laravel jika ada
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


  if (isLoading) return <div className="p-8">Memuat Rapor Siswa...</div>;
  if (!report) return <div className="p-8 text-red-500">Gagal memuat data rapor.</div>;
  
  const chartData = {
    labels: Object.keys(report.report_data),
    datasets: [{
      label: 'Rata-rata Nilai',
      data: Object.values(report.report_data).map((sub: any) => sub.average),
      backgroundColor: 'rgba(79, 70, 229, 0.8)',
    }],
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rapor Akademik</h1>
        <p className="text-xl text-muted-foreground">{report.student.name}</p>
        <p className="text-muted-foreground">Kelas: {report.class} | Semester: {report.semester}</p>
      </div>
      
      <Card>
        <CardHeader><CardTitle>Rekap Absensi Semester</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{report.attendance_summary.hadir}</p>
              <p className="text-sm text-muted-foreground">Hadir</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{report.attendance_summary.sakit}</p>
              <p className="text-sm text-muted-foreground">Sakit</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{report.attendance_summary.izin}</p>
              <p className="text-sm text-muted-foreground">Izin</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{report.attendance_summary.alpa}</p>
              <p className="text-sm text-muted-foreground">Alpa</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Grafik Rata-rata Nilai</CardTitle></CardHeader>
        <CardContent>
          <Bar data={chartData} options={{ responsive: true }} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Catatan Wali Kelas (AI Generated)</CardTitle></CardHeader>
        <CardContent>
          {aiComment ? (
            <div className="space-y-2 text-sm">
              <p><strong>Ringkasan:</strong> {aiComment.summary}</p>
              <p><strong>Kekuatan:</strong> {aiComment.strengths}</p>
              <p><strong>Area Peningkatan:</strong> {aiComment.areas_for_improvement}</p>
              <p><strong>Rekomendasi:</strong> {aiComment.recommendation}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada catatan.</p>
          )}
          <Button onClick={handleGenerateComment} disabled={isAiLoading} className="mt-4">
            {isAiLoading ? 'Membuat Catatan...' : 'Buat Catatan dengan AI'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(report.report_data as ReportData).map(([subject, data]) => (
          <Card key={subject}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{subject}</CardTitle>
              <span className="text-2xl font-bold text-indigo-600">{data.average}</span>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                    <TableHead className="font-bold">Jenis Penilaian</TableHead>
                    <TableHead className="font-bold">Nilai</TableHead>
                    <TableHead className="font-bold">Tanggal</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                  {data.grades.map((grade, index) => (
                    <TableRow key={index}>
                        <TableCell>{grade.grade_type.name}</TableCell>
                        <TableCell>{grade.score}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            {new Date(grade.exam_date).toLocaleDateString('id-ID', {
                            day: '2-digit', month: 'short', year: 'numeric'
                            })}
                        </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}