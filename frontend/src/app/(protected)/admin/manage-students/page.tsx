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

// Icons
const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const AcademicCapIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ClassIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

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
      } catch (error: any) { 
        alert(`Gagal menghapus: ${error.response?.data?.message || 'Error'}`); 
      }
    }
  };

  const selectedClassName = classes.find(c => String(c.id) === selectedClassId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-indigo-100">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <UsersIcon />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Kelola Murid
                </h1>
                <p className="text-gray-600 text-sm mt-1">Manajemen data siswa per kelas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {activeSemester && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-lg border border-indigo-200">
                  <CalendarIcon />
                  <span className="text-sm font-semibold text-indigo-700">
                    Semester: {activeSemester}
                  </span>
                </div>
              )}
              <Button 
                onClick={handleOpenAddModal}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
              >
                <PlusIcon />
                <span className="hidden sm:inline">Tambah Murid Baru</span>
                <span className="sm:hidden">Tambah</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Class Selection */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-indigo-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-1.5 bg-indigo-100 rounded-lg">
                <ClassIcon />
              </div>
              <label className="text-lg font-semibold text-gray-700">Pilih Kelas</label>
            </div>
            <Select onValueChange={setSelectedClassId} value={selectedClassId}>
              <SelectTrigger className="w-full max-w-sm border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500">
                <SelectValue placeholder="Pilih kelas untuk menampilkan murid..." />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    <div className="flex items-center space-x-2">
                      <AcademicCapIcon />
                      <span>{c.level}-{c.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedClassName && (
              <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-sm text-indigo-700">
                  <span className="font-medium">Kelas yang dipilih:</span> {selectedClassName.level}-{selectedClassName.name}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <TableHead className="font-semibold text-indigo-700">Nama Murid</TableHead>
                  <TableHead className="font-semibold text-indigo-700">Email</TableHead>
                  <TableHead className="font-semibold text-indigo-700">Kelas</TableHead> 
                  <TableHead className="text-right font-semibold text-indigo-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="text-indigo-600 font-medium">Memuat data murid...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : students.length > 0 ? (
                  students.map((student) => (
                    <TableRow 
                      key={student.id} 
                      className="hover:bg-indigo-50/50 transition-colors duration-150 group"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold text-sm">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-gray-900 group-hover:text-indigo-600 transition-colors duration-150">
                            {student.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 group-hover:text-gray-700 transition-colors duration-150">
                        {student.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-indigo-100 rounded">
                            <AcademicCapIcon />
                          </div>
                          <span className="text-indigo-700 font-medium">
                            {student.student_profile?.class_model.level}-{student.student_profile?.class_model.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenEditModal(student)}
                            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-colors duration-150 flex items-center space-x-1"
                          >
                            <EditIcon />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(student.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors duration-150 flex items-center space-x-1"
                          >
                            <DeleteIcon />
                            <span className="hidden sm:inline">Hapus</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          {selectedClassId ? <UsersIcon /> : <AcademicCapIcon />}
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">
                            {selectedClassId ? "Tidak ada murid di kelas ini" : "Silakan pilih kelas terlebih dahulu"}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            {selectedClassId ? "Mulai dengan menambahkan murid baru" : "Pilih kelas dari dropdown di atas"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
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