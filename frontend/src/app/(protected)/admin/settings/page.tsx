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
    <div className="p-6 md:p-8 space-y-8">
      <h1 className="text-2xl font-bold">Pengaturan Semester</h1>

      {/* Card Pengaturan Semester Aktif */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Pilih Semester Aktif</h2>
        <Form {...settingsForm}>
          <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-4 max-w-md">
            <FormField name="active_semester_id" control={settingsForm.control} render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Pilih semester..." /></SelectTrigger></FormControl>
                  <SelectContent>{semesters.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                </Select><FormMessage />
              </FormItem>
            )}/>
            <Button type="submit" disabled={settingsForm.formState.isSubmitting}>Atur sebagai Aktif</Button>
          </form>
        </Form>
      </div>

      {/* Card Tambah Semester Baru */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Tambah Semester Baru</h2>
        <Form {...newSemesterForm}>
          <form onSubmit={newSemesterForm.handleSubmit(onNewSemesterSubmit)} className="space-y-4 max-w-md">
            <FormField name="name" control={newSemesterForm.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Semester</FormLabel>
                <FormControl><Input placeholder="Contoh: Ganjil 2026/2027" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <Button type="submit" disabled={newSemesterForm.formState.isSubmitting}>Tambah</Button>
          </form>
        </Form>
      </div>

      {/* Card Keamanan */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Keamanan</h2>
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
            <FormField name="current_password" control={passwordForm.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Password Saat Ini</FormLabel>
                <FormControl><Input type="password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField name="password" control={passwordForm.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Password Baru</FormLabel>
                <FormControl><Input type="password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField name="password_confirmation" control={passwordForm.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Konfirmasi Password Baru</FormLabel>
                <FormControl><Input type="password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
              {passwordForm.formState.isSubmitting ? 'Menyimpan...' : 'Ubah Password'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}