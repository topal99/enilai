"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PieChart } from "@/components/PieChart";
import { useAuth } from "@/context/AuthContext";

// Icons (you can replace these with actual icon components)
const UserIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const TeacherIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const StudentIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

const GradeIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-indigo-600 font-medium">Data tidak ditemukan.</p>
        </div>
      </div>
    );
  }
  
  const chartData = {
    labels: data.user_composition.map(item => item.role.charAt(0).toUpperCase() + item.role.slice(1)),
    data: data.user_composition.map(item => item.total)
  };

  const statCards = [
    {
      title: "Total Pengguna",
      value: data.stats.total_users,
      icon: UserIcon,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600"
    },
    {
      title: "Total Guru & Walikelas",
      value: data.stats.total_teachers,
      icon: TeacherIcon,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "Total Murid",
      value: data.stats.total_students,
      icon: StudentIcon,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-indigo-100">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Selamat datang kembali, {user?.name}</p>
            </div>
            {activeSemester && (
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-semibold rounded-full shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                Semester Aktif: {activeSemester}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300" 
                     style={{backgroundImage: `linear-gradient(135deg, ${stat.color})`}} />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`${stat.bgColor} ${stat.textColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart and Activities */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Pie Chart */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Komposisi Pengguna
                </h3>
              </div>
              <div className="p-6">
                <PieChart chartData={chartData} />
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <ActivityIcon />
                  <span className="ml-3">Aktivitas Terbaru</span>
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {data.recent_activities.length > 0 ? (
                    data.recent_activities.map((log, index) => (
                      <div
                        key={log.id}
                        className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-indigo-50 transition-colors duration-200"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center group-hover:from-indigo-200 group-hover:to-indigo-300 transition-colors duration-200">
                          <span className="text-indigo-600 font-semibold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors duration-200">
                            {log.activity}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 space-x-2">
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {log.user?.name || 'Sistem'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(log.created_at).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">Belum ada aktivitas</p>
                      <p className="text-sm text-gray-400 mt-1">Aktivitas terbaru akan muncul di sini</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}