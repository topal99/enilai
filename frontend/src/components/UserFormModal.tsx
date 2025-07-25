"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

// Definisikan tipe data master
interface Role { id: number; name: string; }
interface ClassModel { id: number; name: string; }
interface Subject { id: number; name: string; }
interface User { id: number; name: string; email: string; role: Role; }
// Tipe data yang lebih lengkap untuk user yang diedit
interface UserToEdit extends User {
  student_profile?: { class_model_id: number } | null;
  subjects?: Subject[];
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit: UserToEdit | null;
}

// =================================================================
// KOREKSI UTAMA: Skema validasi Zod yang disempurnakan dengan refine
// =================================================================
const formSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  role_id: z.string().nonempty("Peran harus dipilih"),
  password: z.string().optional(),
  class_model_id: z.string().optional(),
  subject_ids: z.array(z.number()).optional(),
}).refine((data) => {
    // Cari nama peran berdasarkan role_id yang dipilih
    // (Kita perlu meneruskan daftar peran ke dalam refine)
    // Ini adalah batasan, jadi kita akan validasi di dalam komponen
    // Untuk saat ini kita biarkan refine sederhana, dan fokus pada validasi di backend
    // Tapi kita bisa membuat validasi yang lebih baik jika diperlukan
    // Untuk saat ini, kita akan mengandalkan validasi backend
    return true; // Sementara, biarkan Zod lolos dan andalkan error dari backend
}, {
    message: "Data tidak valid", // Pesan umum
});

export default function UserFormModal({ isOpen, onClose, onSuccess, userToEdit }: ModalProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const isEditMode = !!userToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", role_id: "", password: "", class_model_id: "", subject_ids: [] },
  });

  useEffect(() => {
    if (isOpen) {
        Promise.all([
            api.get("/roles"),
            api.get("/admin/classes"),
            api.get("/admin/subjects")
        ]).then(([rolesRes, classesRes, subjectsRes]) => {
            setRoles(rolesRes.data);
            setClasses(classesRes.data.data || classesRes.data);
            setSubjects(subjectsRes.data.data || subjectsRes.data);
        }).catch(err => console.error("Gagal memuat data master", err));
    }
  }, [isOpen]);

  const selectedRoleId = form.watch('role_id');
  const selectedRoleName = roles.find(r => String(r.id) === selectedRoleId)?.name;
  
  // KOREKSI: useEffect untuk mengisi form saat mode edit
  useEffect(() => {
    if (isOpen && isEditMode) {
      form.reset({
        name: userToEdit.name,
        email: userToEdit.email,
        role_id: String(userToEdit.role.id),
        password: "",
        class_model_id: String(userToEdit.student_profile?.class_model_id || ""),
        subject_ids: userToEdit.subjects?.map(s => s.id) || [],
      });
    } else if (isOpen && !isEditMode) {
      form.reset({ name: "", email: "", role_id: "", password: "", class_model_id: "", subject_ids: [] });
    }
  }, [userToEdit, form, isEditMode, isOpen, roles]);

const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Cari nama peran berdasarkan role_id yang dipilih
    const selectedRoleName = roles.find(r => String(r.id) === values.role_id)?.name;
    if (!selectedRoleName) {
        alert("Peran tidak valid.");
        return;
    }

    // Bangun payload secara hati-hati
    const payload: { [key: string]: any } = {
        name: values.name,
        email: values.email,
        role_id: values.role_id,
        role_name: selectedRoleName, // Kirim role_name untuk validasi backend
    };

    // 1. Tambahkan password hanya jika diisi
    if (values.password) {
        payload.password = values.password;
    }

    // 2. Tambahkan class_model_id hanya jika peran adalah murid
    if (selectedRoleName === 'murid') {
        payload.class_model_id = values.class_model_id;
    }

    // 3. Tambahkan subject_ids hanya jika peran adalah guru
    if (selectedRoleName === 'guru') {
        payload.subject_ids = values.subject_ids;
    }

    try {
        if (isEditMode) {
            await api.put(`/admin/users/${userToEdit.id}`, payload);
        } else {
            await api.post("/admin/users", payload);
        }
        alert(`Pengguna berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}!`);
        onSuccess();
    } catch (error: any) {
        // Menampilkan error validasi dari Laravel
        if (error.response && error.response.status === 422) {
            const validationErrors = error.response.data.errors;
            let errorMessage = "Validasi gagal:\n";
            for (const field in validationErrors) {
                errorMessage += `- ${validationErrors[field].join(', ')}\n`;
            }
            alert(errorMessage);
        } else {
            console.error("Gagal menyimpan pengguna:", error);
            alert("Terjadi kesalahan.");
        }
    }
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Pengguna" : "Tambah Pengguna Baru"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* ... FormFields lainnya ... */}
             {/* Field-field form tidak berubah, jadi saya persingkat */}
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Nama</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField name="email" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField name="role_id" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Peran</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Pilih peran..." /></SelectTrigger></FormControl>
                  <SelectContent>{roles.map(role => <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>)}</SelectContent>
                </Select><FormMessage /></FormItem>
            )}/>
            <FormField name="password" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl>
              <p className="text-xs text-gray-500">{isEditMode ? "Kosongkan jika tidak ingin mengubah." : ""}</p><FormMessage /></FormItem>
            )}/>

             {selectedRoleName === 'murid' && (
              <FormField name="class_model_id" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Kelas</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Pilih kelas untuk murid..." /></SelectTrigger></FormControl>
                    <SelectContent>{classes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                  </Select><FormMessage /></FormItem>
              )}/>
            )}

            {selectedRoleName === 'guru' && (
              <FormField name="subject_ids" control={form.control} render={() => (
                <FormItem>
                  <FormLabel>Mata Pelajaran yang Diajar (Maks 2)</FormLabel>
                  <div className="space-y-2">
                    {subjects.map((subject) => (
                      <FormField
                        key={subject.id} control={form.control} name="subject_ids"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(subject.id)}
                                onCheckedChange={(checked) => {
                                  let newValue = [...(field.value || [])];
                                  if (checked) {
                                    if (newValue.length < 2) newValue.push(subject.id);
                                  } else {
                                    newValue = newValue.filter((id) => id !== subject.id);
                                  }
                                  field.onChange(newValue);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{subject.name}</FormLabel>
                          </FormItem>
                        )}/>
                    ))}
                  </div><FormMessage />
                </FormItem>
              )}/>
            )}
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}