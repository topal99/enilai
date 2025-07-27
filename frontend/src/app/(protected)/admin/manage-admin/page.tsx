"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminFormModal from "@/components/AdminFormModal";
import { Badge } from "lucide-react";

// Icons
const UserIcon = () => (
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
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async (page = 1, search = "") => {
    setIsLoading(true);
    try {
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

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'super admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-indigo-100">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <UserIcon />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Manajemen Admin
                </h1>
                <p className="text-gray-600 text-sm mt-1">Kelola akun administrator sistem</p>
              </div>
            </div>
            <Button 
              onClick={handleOpenAddModal}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Tambah Admin Baru</span>
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
              placeholder="Cari nama atau email admin..."
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
                  <TableHead className="font-semibold text-indigo-700">Email</TableHead>
                  <TableHead className="font-semibold text-indigo-700">Peran</TableHead>
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
                ) : admins && admins.data.length > 0 ? (
                  admins.data.map((user, index) => (
                    <TableRow 
                      key={user.id} 
                      className="hover:bg-indigo-50/50 transition-colors duration-150 group"
                    >
                      <TableCell className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-150">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 group-hover:text-gray-700 transition-colors duration-150">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role.name)}`}>
                          {user.role.name}
                        </span>
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
                          <UserIcon />
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Tidak ada data admin</p>
                          <p className="text-sm text-gray-400 mt-1">Mulai dengan menambahkan admin baru</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {admins && admins.last_page > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Halaman {admins.current_page} dari {admins.last_page}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchData(admins.current_page - 1, searchTerm)}
                    disabled={admins.current_page <= 1}
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchData(admins.current_page + 1, searchTerm)}
                    disabled={admins.current_page >= admins.last_page}
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