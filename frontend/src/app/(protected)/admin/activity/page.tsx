// File: app/(protected)/admin/activity/page.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Icons
const ActivityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// Definisikan tipe data
interface Log {
  id: number;
  activity: string;
  user: { name: string } | null;
  ip_address: string;
  created_at: string;
}
interface PaginatedLogs {
  data: Log[];
  current_page: number;
  last_page: number;
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<PaginatedLogs | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/activity-logs?page=${page}`);
      setLogs(response.data);
    } catch (error) {
      console.error("Gagal memuat log aktivitas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActivityTypeColor = (activity: string) => {
    if (activity.includes('login') || activity.includes('masuk')) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (activity.includes('logout') || activity.includes('keluar')) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (activity.includes('create') || activity.includes('tambah')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (activity.includes('update') || activity.includes('edit')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (activity.includes('delete') || activity.includes('hapus')) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else {
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} jam yang lalu`;
    
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-indigo-100">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <EyeIcon />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Monitor Aktivitas Sistem
              </h1>
              <p className="text-gray-600 text-sm mt-1">Pantau semua aktivitas pengguna dalam sistem</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-indigo-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ActivityIcon />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Aktivitas</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {logs ? logs.data.length : '-'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserIcon />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pengguna Aktif</p>
                <p className="text-2xl font-bold text-green-600">
                  {logs ? new Set(logs.data.filter(log => log.user).map(log => log.user!.name)).size : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ClockIcon />
              </div>
              <div>
                <p className="text-sm text-gray-600">Halaman Saat Ini</p>
                <p className="text-2xl font-bold text-purple-600">
                  {logs?.current_page || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <TableHead className="font-semibold text-indigo-700">Aktivitas</TableHead>
                  <TableHead className="font-semibold text-indigo-700">Dilakukan Oleh</TableHead>
                  <TableHead className="font-semibold text-indigo-700">Alamat IP</TableHead>
                  <TableHead className="font-semibold text-indigo-700">Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="text-indigo-600 font-medium">Memuat data aktivitas...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs && logs.data.length > 0 ? (
                  logs.data.map((log) => (
                    <TableRow 
                      key={log.id} 
                      className="hover:bg-indigo-50/50 transition-colors duration-150 group"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActivityTypeColor(log.activity)}`}>
                              {log.activity}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center">
                            {log.user ? (
                              <span className="text-indigo-600 font-semibold text-xs">
                                {log.user.name.charAt(0).toUpperCase()}
                              </span>
                            ) : (
                              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-150">
                              {log.user?.name || 'Sistem'}
                            </p>
                            {!log.user && (
                              <p className="text-xs text-gray-500">Proses otomatis</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <GlobeIcon />
                          </div>
                          <span className="text-sm text-gray-600 font-mono">
                            {log.ip_address}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <ClockIcon />
                          </div>
                          <div>
                            <p className="text-sm text-gray-900 font-medium">
                              {formatDate(log.created_at)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(log.created_at).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <ActivityIcon />
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Belum ada aktivitas</p>
                          <p className="text-sm text-gray-400 mt-1">Aktivitas sistem akan muncul di sini</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {logs && logs.last_page > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Halaman {logs.current_page} dari {logs.last_page}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchLogs(logs.current_page - 1)}
                    disabled={logs.current_page <= 1}
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <ChevronLeftIcon />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchLogs(logs.current_page + 1)}
                    disabled={logs.current_page >= logs.last_page}
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <span className="hidden sm:inline">Berikutnya</span>
                    <ChevronRightIcon />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}