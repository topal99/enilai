// File: app/(protected)/admin/users/page.tsx
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
import { Input } from "@/components/ui/input";
import UserFormModal from "@/components/UserFormModal"; // <-- Impor modal

// Impor komponen lain yang mungkin Anda gunakan dari shadcn/ui atau library lain

// Definisikan tipe data
interface Role {
  id: number;
  name: string;
}
interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}
interface PaginatedUsers {
  data: User[];
  current_page: number;
  last_page: number;
  total: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<PaginatedUsers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State untuk modal (akan kita buat komponennya nanti)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchUsers(users?.current_page || 1, searchTerm); // Refresh data
  };

  const fetchUsers = async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/users?page=${page}&search=${search}`);
      setUsers(response.data);
    } catch (error) {
      console.error("Gagal memuat data pengguna:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const handler = setTimeout(() => {
      fetchUsers(1, searchTerm);
    }, 500); // Tunggu 500ms setelah user berhenti mengetik

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);
  
  const handleDelete = async (userId: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
        try {
            await api.delete(`/admin/users/${userId}`);
            alert('Pengguna berhasil dihapus!');
            fetchUsers(users?.current_page, searchTerm); // Refresh data
        } catch (error: any) {
            alert(`Gagal menghapus: ${error.response?.data?.message || error.message}`);
        }
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Manajemen Pengguna</h1>
      
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Cari nama atau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleOpenAddModal}>Tambah Pengguna Baru</Button> {/* <-- Hubungkan aksi */}
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
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : users && users.data.length > 0 ? (
              users.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role.name}</TableCell>
                  <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(user)}>Edit</Button> {/* <-- Hubungkan aksi */}
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>Hapus</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="text-center">Tidak ada data pengguna.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Di sini kita akan tambahkan komponen Paginasi */}
      <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers(users!.current_page - 1, searchTerm)}
            disabled={!users || users.current_page <= 1}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers(users!.current_page + 1, searchTerm)}
            disabled={!users || users.current_page >= users.last_page}
          >
            Berikutnya
          </Button>
        </div>
      {/* Modal untuk form pengguna */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        userToEdit={editingUser}
      />
    </div>
  );
}