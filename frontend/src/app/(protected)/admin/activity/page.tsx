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

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Monitor Aktivitas Sistem</h1>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aktivitas</TableHead>
              <TableHead>Dilakukan Oleh</TableHead>
              <TableHead>Alamat IP</TableHead>
              <TableHead>Waktu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : logs && logs.data.length > 0 ? (
              logs.data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.activity}</TableCell>
                  <TableCell>{log.user?.name || 'Sistem'}</TableCell>
                  <TableCell>{log.ip_address}</TableCell>
                  <TableCell>{new Date(log.created_at).toLocaleString('id-ID')}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="text-center">Belum ada aktivitas.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Komponen Paginasi */}
      <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs(logs!.current_page - 1)}
            disabled={!logs || logs.current_page <= 1}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs(logs!.current_page + 1)}
            disabled={!logs || logs.current_page >= logs.last_page}
          >
            Berikutnya
          </Button>
      </div>
    </div>
  );
}