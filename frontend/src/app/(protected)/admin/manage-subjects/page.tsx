"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import SubjectFormModal from "@/components/SubjectFormModal";

// Icons
const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-indigo-100">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BookIcon />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Kelola Mata Pelajaran
                </h1>
                <p className="text-gray-600 text-sm mt-1">Manajemen mata pelajaran sekolah</p>
              </div>
            </div>
            <Button 
              onClick={handleOpenAddModal}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Tambah Mapel Baru</span>
              <span className="sm:hidden">Tambah</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <TableHead className="font-semibold text-indigo-700">Nama Mata Pelajaran</TableHead>
                  <TableHead className="text-right font-semibold text-indigo-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="text-indigo-600 font-medium">Memuat data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : subjects && subjects.data.length > 0 ? (
                  subjects.data.map((subject, index) => (
                    <TableRow 
                      key={subject.id} 
                      className="hover:bg-indigo-50/50 transition-colors duration-150 group"
                    >
                      <TableCell className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-150">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center">
                            <BookIcon />
                          </div>
                          <span>{subject.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenEditModal(subject)}
                            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-colors duration-150 flex items-center space-x-1"
                          >
                            <EditIcon />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(subject.id)}
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
                    <TableCell colSpan={2} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <BookIcon />
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Tidak ada data mata pelajaran</p>
                          <p className="text-sm text-gray-400 mt-1">Mulai dengan menambahkan mata pelajaran baru</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {subjects && subjects.last_page > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Halaman {subjects.current_page} dari {subjects.last_page}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchSubjects(subjects.current_page - 1)}
                    disabled={subjects.current_page <= 1}
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <ChevronLeftIcon />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchSubjects(subjects.current_page + 1)}
                    disabled={subjects.current_page >= subjects.last_page}
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

      <SubjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        subjectToEdit={editingSubject}
      />
    </div>
  );
}