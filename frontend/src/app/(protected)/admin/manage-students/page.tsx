"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import StudentFormModal from "@/components/StudentFormModal";

// KOREKSI: Tipe data disesuaikan
interface ClassModel { id: number; level: number; name: string; }
interface Role { id: number; name: string; }
interface Student {
  id: number;
  name: string;
  email: string;
  // Ini adalah data yang akan kita terima dari API baru
  student_profile: {
    class_model: ClassModel;
  } | null;
}

export default function ManageStudentsPage() {
  const { activeSemester } = useAuth();
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Student | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    api.get('/admin/classes-all').then(res => setClasses(res.data));
    api.get("/roles").then(res => setRoles(res.data));
  }, []);

  const fetchStudents = useCallback(async (classId: string) => {
    if (!classId) {
      setStudents([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/students-by-class?class_id=${classId}`);
      setStudents(response.data);
    } catch (error) {
      console.error("Gagal memuat data murid:", error);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents(selectedClassId);
  }, [selectedClassId, fetchStudents]);

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchStudents(selectedClassId);
  };
  
  const handleOpenAddModal = () => { setEditingUser(null); setIsModalOpen(true); };
  const handleOpenEditModal = (student: Student) => { setEditingUser(student); setIsModalOpen(true); };
  
  const handleDelete = async (userId: number) => {
    if (confirm("Yakin ingin hapus murid ini?")) {
      try {
        await api.delete(`/admin/users/${userId}`);
        alert('Murid berhasil dihapus!');
        fetchStudents(selectedClassId);
      } catch (error: any) { alert(`Gagal menghapus: ${error.response?.data?.message || 'Error'}`); }
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Kelola Murid</h1>
        {activeSemester && ( <span className="text-lg font-semibold text-gray-600 bg-gray-200 px-4 py-2 rounded-lg">Semester: {activeSemester}</span> )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="max-w-sm w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas</label>
          <Select onValueChange={setSelectedClassId} value={selectedClassId}>
            <SelectTrigger><SelectValue placeholder="Pilih kelas untuk menampilkan murid..." /></SelectTrigger>
            <SelectContent>
              {classes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.level}-{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleOpenAddModal}>Tambah Murid Baru</Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Murid</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Kelas</TableHead> 
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Memuat data murid...</TableCell></TableRow>
            ) : students.length > 0 ? (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    {student.student_profile?.class_model.level}-{student.student_profile?.class_model.name}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(student)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(student.id)}>Hapus</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="text-center">
                {selectedClassId ? "Tidak ada murid di kelas ini." : "Silakan pilih kelas terlebih dahulu."}
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        userToEdit={editingUser as any}
        roles={roles}
      />
    </div>
  );
}