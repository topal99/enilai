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
import { useEffect, useState, useMemo } from "react";

// Tipe data
interface Subject { id: number; name: string; }
interface ClassModel { id: number; level: number; name: string; }
interface Role { id: number; name: string; }
interface User { id: number; name: string; email: string; }
interface UserToEdit extends User {
  subjects?: Subject[];
  teaching_classes?: ClassModel[];
}
interface ModalProps {
  isOpen: boolean; onClose: () => void; onSuccess: () => void;
  userToEdit: UserToEdit | null; roles: Role[];
}

// Skema validasi
const formSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().optional(),
  subject_ids: z.array(z.number()).min(1, "Pilih minimal 1 mapel").max(2, "Pilih maksimal 2 mapel"),
  class_ids: z.array(z.number()).optional(),
});

export default function TeacherFormModal({ isOpen, onClose, onSuccess, userToEdit, roles }: ModalProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const isEditMode = !!userToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", subject_ids: [], class_ids: [] },
  });
  
  // Ambil daftar mapel dan kelas
  useEffect(() => {
    if (isOpen) {
      // KOREKSI: Panggil endpoint -all yang benar
      api.get("/admin/subjects-all").then(res => setSubjects(res.data));
      api.get("/admin/classes-all").then(res => setClasses(res.data));
    }
  }, [isOpen]);
  
  // Kelompokkan kelas berdasarkan tingkat
  const classesByLevel = useMemo(() => {
    return classes.reduce((acc: { [key: number]: ClassModel[] }, cls) => {
        const level = cls.level;
        if (!acc[level]) acc[level] = [];
        acc[level].push(cls);
        return acc;
      }, {});
  }, [classes]);

  // Isi form jika dalam mode edit
  useEffect(() => {
    if (isEditMode && userToEdit) {
      form.reset({
        name: userToEdit.name,
        email: userToEdit.email,
        password: "",
        subject_ids: userToEdit.subjects?.map(s => s.id) || [],
        class_ids: userToEdit.teaching_classes?.map(c => c.id) || [],
      });
    } else {
      form.reset({ name: "", email: "", password: "", subject_ids: [], class_ids: [] });
    }
  }, [userToEdit, form, isEditMode]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const guruRoleId = roles.find(r => r.name === 'guru')?.id;
    if (!guruRoleId) { alert("Error: Peran 'guru' tidak ditemukan."); return; }
    
    const payload = { ...values, role_id: guruRoleId, role_name: 'guru' };

    try {
      if (isEditMode) {
        await api.put(`/admin/users/${userToEdit.id}`, payload);
      } else {
        await api.post("/admin/users", payload);
      }
      alert(`Guru berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}!`);
      onSuccess();
    } catch (error: any) {
        if (error.response && error.response.status === 422) {
            const validationErrors = error.response.data.errors;
            let errorMessage = "Validasi gagal:\n";
            for (const field in validationErrors) {
                errorMessage += `- ${validationErrors[field].join(', ')}\n`;
            }
            alert(errorMessage);
        } else {
            console.error("Gagal menyimpan guru:", error);
            alert("Terjadi kesalahan.");
        }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>{isEditMode ? "Edit Guru" : "Tambah Guru Baru"}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Nama</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField name="email" control={form.control} render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField name="password" control={form.control} render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><p className="text-xs text-gray-500">{isEditMode ? "Kosongkan jika tidak ingin mengubah." : ""}</p><FormMessage /></FormItem>)}/>
                <FormField name="subject_ids" control={form.control} render={() => (
                  <FormItem>
                    <FormLabel>Mapel Wajib (Maks 2)</FormLabel>
                    <div className="space-y-2 p-2 border rounded-md">{subjects.map((subject) => (
                        <FormField key={subject.id} control={form.control} name="subject_ids" render={({ field }) => (
                          <FormItem className="flex items-center space-x-2"><FormControl><Checkbox checked={field.value?.includes(subject.id)} onCheckedChange={(checked) => {let v=field.value||[];if(checked){if(v.length<2)field.onChange([...v,subject.id])}else{field.onChange(v.filter(id=>id!==subject.id))}}}/></FormControl><FormLabel className="font-normal">{subject.name}</FormLabel></FormItem>
                        )}/>
                    ))}</div><FormMessage />
                  </FormItem>
                )}/>
            </div>

            <FormField name="class_ids" control={form.control} render={() => (
              <FormItem>
                <FormLabel>Kelas yang Diajar</FormLabel>
                <div className="grid grid-cols-3 gap-4 p-4 border rounded-md">
                  {[7, 8, 9].map(level => (
                    <div key={level}>
                      <h4 className="font-medium mb-2 border-b pb-1">Kelas {level}</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">{classesByLevel[level]?.map((cls) => (
                        <FormField key={cls.id} control={form.control} name="class_ids" render={({ field }) => (
                          <FormItem className="flex items-center space-x-2"><FormControl><Checkbox checked={field.value?.includes(cls.id)} onCheckedChange={(checked)=>{const v=field.value||[];field.onChange(checked?[...v,cls.id]:v.filter(id=>id!==cls.id))}} /></FormControl><FormLabel className="font-normal">{cls.name}</FormLabel></FormItem>
                        )}/>
                      )) || <p className="text-xs text-gray-500">Tidak ada kelas.</p>}</div>
                    </div>
                  ))}
                </div><FormMessage />
              </FormItem>
            )}/>
            <Button type="submit" disabled={form.formState.isSubmitting}>Simpan</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}