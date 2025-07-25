"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import HomeroomFormModal from "@/components/HomeroomFormModal";

// Tipe data yang dibutuhkan
interface ClassModel { id: number; level: number; name: string; }
interface HomeroomTeacher {
  id: number; name: string; email: string; homeroom_classes: ClassModel[];
}
interface PaginatedData {
  data: HomeroomTeacher[]; current_page: number; last_page: number;
}

export default function ManageHomeroomsPage() {
  const [homerooms, setHomerooms] = useState<PaginatedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<HomeroomTeacher | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/homerooms?page=${page}&search=${search}`);
      setHomerooms(response.data);
    } catch (error) { console.error("Gagal memuat data wali kelas:", error); } 
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Efek untuk debouncing pencarian
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData(1, searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, fetchData]);
  
  // Handler untuk modal dan hapus
  const handleModalSuccess = () => { setIsModalOpen(false); fetchData(homerooms?.current_page, searchTerm); };
  const handleOpenAddModal = () => { setEditingUser(null); setIsModalOpen(true); };
  const handleOpenEditModal = (user: HomeroomTeacher) => { setEditingUser(user); setIsModalOpen(true); };
  
  const handleDelete = async (userId: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus wali kelas ini?")) {
        try {
            await api.delete(`/admin/homerooms/${userId}`);
            alert('Wali kelas berhasil dihapus!');
            fetchData(); // Kembali ke halaman pertama setelah hapus
        } catch (error: any) { 
            alert(`Gagal menghapus: ${error.response?.data?.message || 'Error'}`);
        }
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Kelola Wali Kelas</h1>
        <Button onClick={handleOpenAddModal}>Tambah Wali Kelas</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Cari nama atau email wali kelas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Kelas yang Diampu</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? ( <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow> ) 
            : homerooms && homerooms.data.length > 0 ? (
              homerooms.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {/* KOREKSI: Menampilkan kelas dengan format Tingkat-Nama */}
                      {user.homeroom_classes.length > 0 ? user.homeroom_classes.map(cls => 
                        <Badge key={cls.id} variant="outline">{cls.level}-{cls.name}</Badge>
                      ) : '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(user)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>Hapus</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : ( <TableRow><TableCell colSpan={4} className="text-center">Tidak ada data wali kelas.</TableCell></TableRow> )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm" onClick={() => fetchData(homerooms!.current_page - 1, searchTerm)} disabled={!homerooms || homerooms.current_page <= 1}>
            Sebelumnya
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchData(homerooms!.current_page + 1, searchTerm)} disabled={!homerooms || homerooms.current_page >= homerooms.last_page}>
            Berikutnya
          </Button>
      </div>
      
      <HomeroomFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        userToEdit={editingUser}
      />
    </div>
  );
}