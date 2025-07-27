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

// Icons
const UserGroupIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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

const ChevronLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-indigo-100">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <UserGroupIcon />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Manajemen Guru
                </h1>
                <p className="text-gray-600 text-sm mt-1">Kelola data guru dan mata pelajaran</p>
              </div>
            </div>
            <Button 
              onClick={handleOpenAddModal}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Tambah Guru Baru</span>
              <span className="sm:hidden">Tambah</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <Input
              placeholder="Cari nama guru..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <TableHead className="font-semibold text-indigo-700">Nama Guru</TableHead>
                  <TableHead className="font-semibold text-indigo-700">Mapel Wajib</TableHead>
                  <TableHead className="font-semibold text-indigo-700">Kelas yang Diajar</TableHead>
                  <TableHead className="text-right font-semibold text-indigo-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="text-indigo-600 font-medium">Memuat data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : teachers && teachers.data.length > 0 ? (
                  teachers.data.map((teacher) => (
                    <TableRow 
                      key={teacher.id} 
                      className="hover:bg-indigo-50/50 transition-colors duration-150 group"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold text-sm">
                              {teacher.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-gray-900 group-hover:text-indigo-600 transition-colors duration-150">
                              {teacher.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {teacher.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects.map(subject => (
                            <Badge key={subject.id} variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                              {subject.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {teacher.teaching_classes.length > 0 ? teacher.teaching_classes.map(cls => (
                            <Badge key={cls.id} variant="outline" className="border-indigo-200 text-indigo-600">
                              {cls.level}-{cls.name}
                            </Badge>
                          )) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenEditModal(teacher)}
                            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-colors duration-150 flex items-center space-x-1"
                          >
                            <EditIcon />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(teacher.id)}
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
                          <UserGroupIcon />
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Tidak ada data guru</p>
                          <p className="text-sm text-gray-400 mt-1">Mulai dengan menambahkan guru baru</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {teachers && teachers.last_page > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Halaman {teachers.current_page} dari {teachers.last_page}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchTeachers(teachers.current_page - 1)}
                    disabled={teachers.current_page <= 1}
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <ChevronLeftIcon />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchTeachers(teachers.current_page + 1)}
                    disabled={teachers.current_page >= teachers.last_page}
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <span className="hidden sm:inline">Berikutnya</span>
                    <ChevronRightIcon />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
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