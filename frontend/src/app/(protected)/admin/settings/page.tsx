// File: app/(protected)/admin/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Icons
const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// Skema untuk form ganti password
const passwordSchema = z.object({
  current_password: z.string().min(1, "Password saat ini harus diisi."),
  password: z.string().min(8, "Password baru minimal 8 karakter."),
  password_confirmation: z.string(),
}).refine(data => data.password === data.password_confirmation, {
  message: "Konfirmasi password tidak cocok.",
  path: ["password_confirmation"],
});

// Definisikan tipe data
interface Semester { id: number; name: string; }

// Skema untuk form PENGATURAN semester aktif
const settingsSchema = z.object({
  active_semester_id: z.string().nonempty("Semester aktif harus dipilih."),
});

// Skema untuk form TAMBAH semester baru
const newSemesterSchema = z.object({
  name: z.string().min(5, "Nama semester minimal 5 karakter."),
});

export default function SettingsPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: "", password: "", password_confirmation: "" },
  });

  const settingsForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
  });

  const newSemesterForm = useForm<z.infer<typeof newSemesterSchema>>({
    resolver: zodResolver(newSemesterSchema),
    defaultValues: { name: "" },
  });

  // Fungsi untuk mengambil daftar semester
  const fetchSemesters = async () => {
    try {
      const response = await api.get('/admin/semesters');
      setSemesters(response.data);
    } catch (error) { console.error("Gagal memuat daftar semester", error); }
  };

  // Ambil data pengaturan saat halaman dimuat
   useEffect(() => {
    fetchSemesters();
    api.get('/settings').then(response => {
      if (response.data.active_semester_id) {
        settingsForm.setValue('active_semester_id', String(response.data.active_semester_id));
      }
    });
  }, [settingsForm]);

  const onSettingsSubmit = async (values: z.infer<typeof settingsSchema>) => {
    try {
      await api.post('/admin/settings', values);
      alert('Semester aktif berhasil diperbarui! Halaman akan dimuat ulang untuk menerapkan perubahan.');
      window.location.reload(); // Reload untuk memperbarui semester di header
    } catch (error) { alert('Gagal memperbarui pengaturan.'); }
  };

  const onNewSemesterSubmit = async (values: z.infer<typeof newSemesterSchema>) => {
    try {
      await api.post('/admin/semesters', values);
      alert('Semester baru berhasil ditambahkan!');
      newSemesterForm.reset();
      fetchSemesters(); // Refresh daftar semester
    } catch (error: any) { alert(`Gagal menambahkan semester: ${error.response?.data?.message || 'Error'}`); }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    try {
      await api.post('/settings/change-password', values);
      alert('Password berhasil diubah!');
      passwordForm.reset();
    } catch (error: any) {
      alert(`Gagal mengubah password: ${error.response?.data?.message || 'Error tidak diketahui'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-indigo-100">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <SettingsIcon />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Pengaturan Sistem
              </h1>
              <p className="text-gray-600 text-sm mt-1">Kelola semester dan keamanan akun</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card Pengaturan Semester Aktif */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CalendarIcon />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Semester Aktif</h2>
                  <p className="text-indigo-100 text-sm">Pilih semester yang sedang berjalan</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-4">
                  <FormField name="active_semester_id" control={settingsForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Pilih Semester</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500">
                            <SelectValue placeholder="Pilih semester..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {semesters.map(s => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              <div className="flex items-center space-x-2">
                                <CalendarIcon />
                                <span>{s.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <Button 
                    type="submit" 
                    disabled={settingsForm.formState.isSubmitting}
                    className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {settingsForm.formState.isSubmitting ? (
                      <>
                        <RefreshIcon />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon />
                        <span>Atur sebagai Aktif</span>
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>

          {/* Card Tambah Semester Baru */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <PlusIcon />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Semester Baru</h2>
                  <p className="text-purple-100 text-sm">Tambahkan semester untuk periode mendatang</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <Form {...newSemesterForm}>
                <form onSubmit={newSemesterForm.handleSubmit(onNewSemesterSubmit)} className="space-y-4">
                  <FormField name="name" control={newSemesterForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Nama Semester</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Contoh: Ganjil 2026/2027" 
                          {...field} 
                          className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <Button 
                    type="submit" 
                    disabled={newSemesterForm.formState.isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {newSemesterForm.formState.isSubmitting ? (
                      <>
                        <RefreshIcon />
                        <span>Menambahkan...</span>
                      </>
                    ) : (
                      <>
                        <PlusIcon />
                        <span>Tambahkan Semester</span>
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>

        {/* Card Keamanan - Full Width */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <LockIcon />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Keamanan Akun</h2>
                <p className="text-red-100 text-sm">Ubah password untuk menjaga keamanan akun Anda</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                <FormField name="current_password" control={passwordForm.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Password Saat Ini</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        {...field} 
                        className="border-red-200 focus:border-red-500 focus:ring-red-500"
                        placeholder="Masukkan password saat ini"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField name="password" control={passwordForm.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Password Baru</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        {...field} 
                        className="border-red-200 focus:border-red-500 focus:ring-red-500"
                        placeholder="Masukkan password baru (min. 8 karakter)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField name="password_confirmation" control={passwordForm.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Konfirmasi Password Baru</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        {...field} 
                        className="border-red-200 focus:border-red-500 focus:ring-red-500"
                        placeholder="Konfirmasi password baru"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <Button 
                  type="submit" 
                  disabled={passwordForm.formState.isSubmitting}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                >
                  {passwordForm.formState.isSubmitting ? (
                    <>
                      <RefreshIcon />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <LockIcon />
                      <span>Ubah Password</span>
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}