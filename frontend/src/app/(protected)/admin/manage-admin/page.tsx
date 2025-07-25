"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminFormModal from "@/components/AdminFormModal"; // <-- KOREKSI: Impor modal baru
import { Badge } from "lucide-react";

// Definisikan tipe data
interface Role { id: number; name: string; }
interface AdminUser { id: number; name: string; email: string; role: Role; }
interface PaginatedData {
  data: AdminUser[];
  current_page: number;
  last_page: number;
}

export default function ManageUsersPage() {
  const [admins, setAdmins] = useState<PaginatedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [roles, setRoles] = useState<Role[]>([]); // Tetap dibutuhkan untuk mengirim role_id
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      // API call tidak perlu filter, karena backend sudah memfilternya
      const response = await api.get(`/admin/users?page=${page}&search=${search}`);
      setAdmins(response.data);
    } catch (error) {
      console.error("Gagal memuat data admin:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    api.get("/roles").then(res => setRoles(res.data));
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handler = setTimeout(() => { fetchData(1, searchTerm); }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, fetchData]);

  const handleModalSuccess = () => { setIsModalOpen(false); fetchData(admins?.current_page, searchTerm); };
  const handleOpenAddModal = () => { setEditingUser(null); setIsModalOpen(true); };
  const handleOpenEditModal = (user: AdminUser) => { setEditingUser(user); setIsModalOpen(true); };

  const handleDelete = async (userId: number) => {
    if (confirm("Yakin ingin hapus admin ini?")) {
      try {
        await api.delete(`/admin/users/${userId}`);
        alert('Admin berhasil dihapus!');
        fetchData();
      } catch (error: any) {
        alert(`Gagal menghapus: ${error.response?.data?.message || 'Error'}`);
      }
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-4">
        {/* KOREKSI: Judul diubah */}
        <h1 className="text-2xl font-bold">Manajemen Admin</h1>
        {/* KOREKSI: Teks tombol diubah */}
        <Button onClick={handleOpenAddModal}>Tambah Admin Baru</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Cari nama atau email admin..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        {/* KOREKSI: Filter peran dihapus karena tidak relevan lagi */}
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? ( <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow> ) 
            : admins && admins.data.length > 0 ? (
              admins.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role.name}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(user)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>Hapus</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : ( <TableRow><TableCell colSpan={4} className="text-center">Tidak ada data admin.</TableCell></TableRow> )}
          </TableBody>
        </Table>
      </div>
      
      {/* Paginasi (tidak berubah) */}
      <div className="flex items-center justify-end space-x-2 py-4">
        {/* ... */}
      </div>
      
      {/* KOREKSI: Gunakan modal baru yang lebih sederhana */}
      <AdminFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        userToEdit={editingUser}
        roles={roles}
      />
    </div>
  );
}