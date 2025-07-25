"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

// Definisikan tipe data yang dibutuhkan oleh modal ini
interface ClassModel { id: number; name: string; }
interface User { id: number; name: string; email: string; }
interface Role { id: number; name: string; }
interface StudentProfile { class_model_id: number; } // Untuk data edit
interface UserToEdit extends User { student_profile?: StudentProfile | null; }
interface ClassModel { id: number; level: number; name: string; }

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit: UserToEdit | null;
  roles: Role[];
}

// Skema validasi menggunakan Zod, khusus untuk form murid
const formSchema = z.object({
  name: z.string().min(3, "Nama murid minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().optional(),
  class_model_id: z.string().nonempty("Kelas harus dipilih oleh murid"),
});

export default function StudentFormModal({ isOpen, onClose, onSuccess, userToEdit, roles }: ModalProps) {
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const isEditMode = !!userToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", class_model_id: "" },
  });

  // 1. Ambil daftar kelas dari API saat komponen pertama kali ditampilkan
  useEffect(() => {
    if (isOpen) {
      // KOREKSI: Panggil endpoint baru yang tidak dipaginasi
      api.get("/admin/classes-all")
        .then(response => {
          // Sekarang tidak perlu .data.data lagi
          setClasses(response.data);
        })
        .catch(error => console.error("Gagal memuat daftar kelas:", error));
    }
  }, [isOpen]);


  // 2. Isi form dengan data yang ada jika ini adalah mode Edit
  useEffect(() => {
    if (isOpen && isEditMode) {
      form.reset({
        name: userToEdit.name,
        email: userToEdit.email,
        password: "", // Selalu kosongkan password untuk keamanan
        class_model_id: String(userToEdit.student_profile?.class_model_id || ""),
      });
    } else {
      form.reset({ name: "", email: "", password: "", class_model_id: "" });
    }
  }, [userToEdit, form, isEditMode, isOpen]);

  // 3. Fungsi yang dijalankan saat form disubmit
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Cari ID untuk peran 'murid' dari props
    const muridRoleId = roles.find(r => r.name === 'murid')?.id;
    if (!muridRoleId) {
      alert("Error: Peran 'murid' tidak ditemukan.");
      return;
    }

    // Siapkan payload untuk dikirim ke API
    const payload = { ...values, role_id: muridRoleId, role_name: 'murid' };

    try {
      if (isEditMode) {
        // Panggil API update jika mode edit
        await api.put(`/admin/users/${userToEdit.id}`, payload);
      } else {
        // Panggil API store jika mode tambah
        await api.post("/admin/users", payload);
      }
      alert(`Murid berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}!`);
      onSuccess(); // Panggil callback sukses (untuk menutup modal & refresh data)
    } catch (error) {
      console.error("Gagal menyimpan data murid:", error);
      alert("Terjadi kesalahan. Periksa console untuk detail.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Data Murid" : "Tambah Murid Baru"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl><Input placeholder="Masukkan nama murid..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField name="email" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="contoh@email.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField name="password" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl><Input type="password" {...field} /></FormControl>
                <FormMessage />
                <p className="text-xs text-gray-500">{isEditMode ? "Kosongkan jika tidak ingin mengubah password." : ""}</p>
              </FormItem>
            )}/>
                <FormField name="class_model_id" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kelas</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kelas untuk murid..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map(c => 
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.level}-{c.name}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
            )}/>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}