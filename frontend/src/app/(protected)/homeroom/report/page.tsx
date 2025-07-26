"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, User } from "lucide-react";
import Link from "next/link";

// Tipe data
interface Student {
  id: number;
  name: string;
}
interface ReportPageData {
  class_name: string;
  students: Student[];
}

export default function ReportPage() {
  const [data, setData] = useState<ReportPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kita gunakan lagi API dasbor untuk mendapatkan daftar siswa
    api.get('/homeroom/dashboard-summary')
      .then(res => setData(res.data))
      .catch(err => console.error("Gagal memuat data siswa.", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="p-8">Memuat daftar siswa...</div>;
  if (!data) return <div className="p-8 text-red-500">Gagal memuat data.</div>;

  return (
    <div className="p-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Rapor Siswa Kelas {data.class_name}</CardTitle>
          <CardDescription>
            Silakan pilih siswa di bawah ini untuk melihat detail rapor akademik atau membuat catatan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.students.length > 0 ? data.students.map(student => (
              <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-3 text-gray-500" />
                  <span className="font-medium">{student.name}</span>
                </div>
                <Link href={`/homeroom/report/${student.id}`} passHref>
                  <Button variant="outline" size="sm">
                    Lihat Rapor
                    <FileText className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )) : (
              <p className="text-sm text-center text-muted-foreground py-4">
                Belum ada siswa di kelas perwalian Anda.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}