"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HomeroomFormModal from "@/components/HomeroomFormModal";

// Tipe data
interface ClassModel { id: number; level: number;  name: string; }
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

  const fetchData = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/homerooms?page=${page}`);
      setHomerooms(response.data);
    } catch (error) { console.error("Gagal memuat data:", error); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);
  
  const handleModalSuccess = () => { 
    setIsModalOpen(false); 
    fetchData(homerooms?.current_page); 
  };
  
  const handleDelete = async (userId: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus wali kelas ini?")) {
        try {
            await api.delete(`/admin/homerooms/${userId}`);
            alert('Wali kelas berhasil dihapus!');
            // KOREKSI: Selalu refresh ke halaman pertama untuk konsistensi
            fetchData();
        } catch (error: any) { 
            alert(`Gagal menghapus: ${error.response?.data?.message || 'Error tidak diketahui'}`);
        }
    }
  };
  
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (user: HomeroomTeacher) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Kelola Wali Kelas</h1>
        <Button onClick={handleOpenAddModal}>Tambah Wali Kelas</Button>
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
                  <TableCell><div className="flex flex-wrap gap-1">
                    {user.homeroom_classes.map(cls => 
                    <Badge key={cls.id} variant="outline">{cls.level}-{cls.name}</Badge>)}
                  </div></TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(user)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>Hapus</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : ( <TableRow><TableCell colSpan={4} className="text-center">Tidak ada data.</TableCell></TableRow> )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline" size="sm"
            onClick={() => fetchData(homerooms!.current_page - 1)}
            disabled={!homerooms || homerooms.current_page <= 1}>
            Sebelumnya
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => fetchData(homerooms!.current_page + 1)}
            disabled={!homerooms || homerooms.current_page >= homerooms.last_page}>
            Berikutnya
          </Button>
      </div>
      
      <HomeroomFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        userToEdit={editingUser as any}
      />
    </div>
  );
}