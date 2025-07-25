"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import SubjectFormModal from "@/components/SubjectFormModal";

// Definisikan tipe data
interface Subject { id: number; name: string; }
interface PaginatedSubjects {
  data: Subject[];
  current_page: number;
  last_page: number;
}

export default function ManageSubjectsPage() {
  const [subjects, setSubjects] = useState<PaginatedSubjects | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const fetchSubjects = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/subjects?page=${page}`);
      setSubjects(response.data);
    } catch (error) {
      console.error("Gagal memuat data mapel:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleOpenAddModal = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };
  
  const handleDelete = async (subjectId: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus mata pelajaran ini?")) {
        try {
            await api.delete(`/admin/subjects/${subjectId}`);
            alert('Mata pelajaran berhasil dihapus!');
            fetchSubjects(subjects?.current_page);
        } catch (error: any) {
            alert(`Gagal menghapus: ${error.response?.data?.message || error.message}`);
        }
    }
  };
  
  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchSubjects(subjects?.current_page);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Kelola Mata Pelajaran</h1>
        <Button onClick={handleOpenAddModal}>Tambah Mapel Baru</Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Mata Pelajaran</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={2} className="text-center">Loading...</TableCell></TableRow>
            ) : subjects && subjects.data.length > 0 ? (
              subjects.data.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(subject)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(subject.id)}>Hapus</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={2} className="text-center">Tidak ada data.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Paginasi */}
      <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline" size="sm"
            onClick={() => fetchSubjects(subjects!.current_page - 1)}
            disabled={!subjects || subjects.current_page <= 1}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => fetchSubjects(subjects!.current_page + 1)}
            disabled={!subjects || subjects.current_page >= subjects.last_page}
          >
            Berikutnya
          </Button>
      </div>

      <SubjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        subjectToEdit={editingSubject}
      />
    </div>
  );
}