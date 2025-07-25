"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PieChart } from "@/components/PieChart"; // Impor PieChart
import { useAuth } from "@/context/AuthContext"; // Impor sekali

// Definisikan tipe data untuk state
interface DashboardData {
  stats: {
    total_users: number;
    total_teachers: number;
    total_students: number;
    total_grades: number;
  };
  user_composition: { role: string; total: number }[];
  recent_activities: { id: number; activity: string; user: { name: string }; created_at: string }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, activeSemester } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin/dashboard-summary');
        setData(response.data);
      } catch (err) {
        setError("Gagal memuat data dasbor. Anda mungkin tidak memiliki akses.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!data) return <div className="p-8">Data tidak ditemukan.</div>;
  
    const chartData = {
    labels: data.user_composition.map(item => item.role.charAt(0).toUpperCase() + item.role.slice(1)),
    data: data.user_composition.map(item => item.total)
  };

  // Di sini kita akan menambahkan komponen untuk menampilkan data
  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            {activeSemester && (
                <span className="text-lg font-semibold text-gray-600 bg-gray-200 px-4 py-2 rounded-lg">
                Semester Aktif: {activeSemester}
                </span>
            )}
        </div>      
      {/* Bagian Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Total Pengguna</h3>
          <p className="text-3xl font-semibold text-gray-800">{data.stats.total_users}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Total Guru & Walikelas</h3>
          <p className="text-3xl font-semibold text-gray-800">{data.stats.total_teachers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Total Murid</h3>
          <p className="text-3xl font-semibold text-gray-800">{data.stats.total_students}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Total Nilai Diinput</h3>
          <p className="text-3xl font-semibold text-gray-800">{data.stats.total_grades}</p>
        </div>
      </div>

      {/* Bagian Pie Chart dan Aktivitas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
          <PieChart chartData={chartData} />
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h3>
          <ul className="divide-y divide-gray-200">
            {data.recent_activities.length > 0 ? data.recent_activities.map(log => (
              <li key={log.id} className="py-3">
                <p className="text-sm text-gray-700">{log.activity}</p>
                <p className="text-xs text-gray-500">
                  oleh {log.user?.name || 'Sistem'} - {new Date(log.created_at).toLocaleString()}
                </p>
              </li>
            )) : <p className="text-sm text-gray-500">Belum ada aktivitas.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
