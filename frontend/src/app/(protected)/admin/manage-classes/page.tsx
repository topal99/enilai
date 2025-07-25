"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ClassFormModal from "@/components/ClassFormModal";

// KOREKSI: Tipe data disesuaikan dengan struktur baru
interface ClassModel {
  id: number;
  level: number; // Tingkat kelas (7, 8, 9)
  name: string;   // Abjad kelas (A, B, C)
}
interface PaginatedClasses {
  data: ClassModel[];
  current_page: number;
  last_page: number;
}

export default function ManageClassesPage() {
  const [classes, setClasses] = useState<PaginatedClasses | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassModel | null>(null);

  const fetchClasses = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/classes?page=${page}`);
      setClasses(response.data);
    } catch (error) {
      console.error("Gagal memuat data kelas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleOpenAddModal = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (classData: ClassModel) => {
    setEditingClass(classData);
    setIsModalOpen(true);
  };
  
  const handleDelete = async (classId: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus kelas ini?")) {
        try {
            await api.delete(`/admin/classes/${classId}`);
            alert('Kelas berhasil dihapus!');
            fetchClasses(classes?.current_page);
        } catch (error: any) {
            alert(`Gagal menghapus: ${error.response?.data?.message || error.message}`);
        }
    }
  };
  
  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchClasses(classes?.current_page);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Kelola Kelas</h1>
        <Button onClick={handleOpenAddModal}>Tambah Kelas Baru</Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* KOREKSI: Header tabel diubah */}
              <TableHead>Tingkat</TableHead>
              <TableHead>Nama / Abjad</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
            ) : classes && classes.data.length > 0 ? (
              classes.data.map((classItem) => (
                <TableRow key={classItem.id}>
                  {/* KOREKSI: Sel tabel diubah */}
                  <TableCell className="font-medium">Kelas {classItem.level}</TableCell>
                  <TableCell>{classItem.name}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(classItem)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(classItem.id)}>Hapus</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={3} className="text-center">Tidak ada data kelas.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Paginasi */}
      <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline" size="sm"
            onClick={() => fetchClasses(classes!.current_page - 1)}
            disabled={!classes || classes.current_page <= 1}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => fetchClasses(classes!.current_page + 1)}
            disabled={!classes || classes.current_page >= classes.last_page}
          >
            Berikutnya
          </Button>
      </div>

      <ClassFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        classToEdit={editingClass}
      />
    </div>
  );
}