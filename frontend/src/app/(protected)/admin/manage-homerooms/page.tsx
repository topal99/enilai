"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import HomeroomFormModal from "@/components/HomeroomFormModal";

// Icons
const TeacherIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

const EmailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ClassroomIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

// Tipe data yang dibutuhkan
interface ClassModel { id: number; level: number; name: string; }
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
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/homerooms?page=${page}&search=${search}`);
      setHomerooms(response.data);
    } catch (error) { 
      console.error("Gagal memuat data wali kelas:", error); 
    } finally { 
      setIsLoading(false); 
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Efek untuk debouncing pencarian
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData(1, searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, fetchData]);
  
  // Handler untuk modal dan hapus
  const handleModalSuccess = () => { 
    setIsModalOpen(false); 
    fetchData(homerooms?.current_page, searchTerm); 
  };
  
  const handleOpenAddModal = () => { 
    setEditingUser(null); 
    setIsModalOpen(true); 
  };
  
  const handleOpenEditModal = (user: HomeroomTeacher) => { 
    setEditingUser(user); 
    setIsModalOpen(true); 
  };
  
  const handleDelete = async (userId: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus wali kelas ini?")) {
      try {
        await api.delete(`/admin/homerooms/${userId}`);
        alert('Wali kelas berhasil dihapus!');
        fetchData(); // Kembali ke halaman pertama setelah hapus
      } catch (error: any) { 
        alert(`Gagal menghapus: ${error.response?.data?.message || 'Error'}`);
      }
    }
  };

  const getClassBadgeColor = (level: number) => {
    switch (level) {
      case 7: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 8: return 'bg-green-100 text-green-800 border-green-200';
      case 9: return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Statistik untuk cards
  const stats = homerooms ? {
    total: homerooms.data.length,
    withClasses: homerooms.data.filter(h => h.homeroom_classes.length > 0).length,
    withoutClasses: homerooms.data.filter(h => h.homeroom_classes.length === 0).length
  } : { total: 0, withClasses: 0, withoutClasses: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-indigo-100">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <TeacherIcon />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Kelola Wali Kelas
                </h1>
                <p className="text-gray-600 text-sm mt-1">Manajemen wali kelas dan penugasan kelas</p>
              </div>
            </div>
            <Button 
              onClick={handleOpenAddModal}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Tambah Wali Kelas</span>
              <span className="sm:hidden">Tambah</span>
            </Button>
          </div>
        </div>
      </div>

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Wali Kelas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                <TeacherIcon />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Sudah Mengampu</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withClasses}</p>
              </div>
              <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <ClassroomIcon />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Belum Mengampu</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withoutClasses}</p>
              </div>
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <Input
              placeholder="Cari nama atau email wali kelas..."
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
                  <TableHead className="font-semibold text-indigo-700">Nama</TableHead>
                  <TableHead className="font-semibold text-indigo-700">Kelas yang Diampu</TableHead>
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
                ) : homerooms && homerooms.data.length > 0 ? (
                  homerooms.data.map((user, index) => (
                    <TableRow 
                      key={user.id} 
                      className="hover:bg-indigo-50/50 transition-colors duration-150 group"
                    >
                      <TableCell className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-150">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <EmailIcon />
                              <span className="ml-1">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {user.homeroom_classes.length > 0 ? (
                            user.homeroom_classes.map(cls => (
                              <span 
                                key={cls.id} 
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getClassBadgeColor(cls.level)}`}
                              >
                                <ClassroomIcon />
                                <span className="ml-1">{cls.level}-{cls.name}</span>
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                              Belum mengampu
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenEditModal(user)}
                            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-colors duration-150 flex items-center space-x-1"
                          >
                            <EditIcon />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(user.id)}
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
                          <TeacherIcon />
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Tidak ada data wali kelas</p>
                          <p className="text-sm text-gray-400 mt-1">Mulai dengan menambahkan wali kelas baru</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {homerooms && homerooms.last_page > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Halaman {homerooms.current_page} dari {homerooms.last_page}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchData(homerooms.current_page - 1, searchTerm)}
                    disabled={homerooms.current_page <= 1}
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchData(homerooms.current_page + 1, searchTerm)}
                    disabled={homerooms.current_page >= homerooms.last_page}
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <HomeroomFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        userToEdit={editingUser}
      />
    </div>
  );
}