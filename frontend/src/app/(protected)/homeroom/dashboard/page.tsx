"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Definisikan tipe data
interface Student {
  id: number;
  name: string;
}
interface DashboardData {
  class_name: string;
  student_count: number;
  students: Student[];
}

export default function HomeroomDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/homeroom/dashboard-summary');
        setData(response.data);
      } catch (err) {
        console.error("Gagal memuat data dasbor.", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="p-8">Memuat dasbor wali kelas...</div>;
  if (!data) return <div className="p-8 text-red-500">Gagal memuat data.</div>;

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dasbor Wali Kelas</h1>
        <p className="text-muted-foreground">Selamat datang, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kartu Informasi Kelas */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Kelas Perwalian</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{data.class_name}</p>
            <div className="flex items-center text-muted-foreground mt-2">
              <Users className="h-4 w-4 mr-2" />
              <span>{data.student_count} Siswa</span>
            </div>
          </CardContent>
        </Card>

        {/* Kartu Aksi Cepat */}
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>Pilih siswa dari daftar di bawah untuk melanjutkan ke halaman rapor.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="font-semibold mb-2">Daftar Siswa di Kelas {data.class_name}:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {data.students.length > 0 ? data.students.map(student => (
                        <div key={student.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
                            <span>{student.name}</span>
                            <Link href={`/homeroom/report/${student.id}`} passHref>
                                <Button variant="outline" size="sm">
                                    Lihat Rapor
                                    <FileText className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground">Belum ada siswa di kelas ini.</p>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}