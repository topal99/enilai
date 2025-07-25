"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TeacherFormModal from "@/components/TeacherFormModal";
import { Input } from "@/components/ui/input";

// Definisikan tipe data yang lebih spesifik
interface Subject { id: number; name: string; }
interface ClassModel { id: number; level: number; name: string; }
interface Role { id: number; name: string; }
interface Teacher {
  id: number;
  name: string;
  email: string;
  role: Role;
  subjects: Subject[];
  // KOREKSI 1: Tambahkan properti teaching_classes di sini
  teaching_classes: ClassModel[]; 
}
interface PaginatedTeachers {
  data: Teacher[];
  current_page: number;
  last_page: number;
}

export default function ManageTeachersPage() {
  const [teachers, setTeachers] = useState<PaginatedTeachers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Teacher | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTeachers = useCallback(async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/teachers?page=${page}&search=${search}`);
      setTeachers(response.data);
    } catch (error) {
      console.error("Gagal memuat data guru:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    api.get("/roles").then(res => setRoles(res.data));
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTeachers(1, searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, fetchTeachers]);

  const handleOpenAddModal = () => { setEditingUser(null); setIsModalOpen(true); };
  const handleOpenEditModal = (teacher: Teacher) => { setEditingUser(teacher); setIsModalOpen(true); };
  
  const handleDelete = async (userId: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
        try {
            await api.delete(`/admin/users/${userId}`);
            alert('Pengguna berhasil dihapus!');
            fetchTeachers();
        } catch (error: any) {
            alert(`Gagal menghapus: ${error.response?.data?.message || error.message}`);
        }
    }
  };
  
  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchTeachers(teachers?.current_page || 1, searchTerm);
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Manajemen Guru</h1>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Cari nama guru..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleOpenAddModal}>Tambah Guru Baru</Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Guru</TableHead>
              <TableHead>Mapel Wajib</TableHead>
              <TableHead>Kelas yang Diajar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : teachers && teachers.data.length > 0 ? (
              teachers.data.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.name}<br/>
                  <span className="text-xs text-muted-foreground">{teacher.email}</span></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map(subject => (
                        <Badge key={subject.id} variant="secondary">{subject.name}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.teaching_classes.length > 0 ? teacher.teaching_classes.map(cls => (
                        <Badge key={cls.id} variant="secondary">{cls.level}-{cls.name}</Badge>
                      )) : '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(teacher)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(teacher.id)}>Hapus</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className="text-center">Tidak ada data guru.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Paginasi */}
      <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline" size="sm"
            onClick={() => fetchTeachers(teachers!.current_page - 1)}
            disabled={!teachers || teachers.current_page <= 1}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => fetchTeachers(teachers!.current_page + 1)}
            disabled={!teachers || teachers.current_page >= teachers.last_page}
          >
            Berikutnya
          </Button>
      </div>

      <TeacherFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        userToEdit={editingUser}
        roles={roles}
      />
    </div>
  );
}