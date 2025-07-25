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
interface ClassModel { id: number; level: number; name: string; }
interface User { id: number; name: string; email: string; }
interface UserToEdit extends User { homeroom_classes?: ClassModel[] }
interface ModalProps {
  isOpen: boolean; onClose: () => void; onSuccess: () => void; userToEdit: UserToEdit | null;
}

// Skema validasi (tidak berubah)
const formSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().optional(),
  class_ids: z.array(z.number()).max(3, "Maksimal 3 kelas yang bisa diampu"),
});

export default function HomeroomFormModal({ isOpen, onClose, onSuccess, userToEdit }: ModalProps) {
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const isEditMode = !!userToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", class_ids: [] },
  });

  // Ambil daftar kelas yang tersedia
  useEffect(() => {
    if (isOpen) {
      // KOREKSI: Panggil API khusus untuk wali kelas
      let apiUrl = "/admin/homeroom-available-classes"; 
      if (isEditMode && userToEdit) {
        apiUrl += `?editing_user_id=${userToEdit.id}`;
      }
      api.get(apiUrl).then(res => setClasses(res.data));
    }
}, [isOpen, isEditMode, userToEdit]);


  // BARU: Kelompokkan kelas berdasarkan tingkat (level)
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
        class_ids: userToEdit.homeroom_classes?.map(c => c.id) || [],
      });
    } else {
      form.reset({ name: "", email: "", password: "", class_ids: [] });
    }
  }, [userToEdit, form, isEditMode]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditMode) {
        await api.put(`/admin/homerooms/${userToEdit.id}`, values);
      } else {
        await api.post("/admin/homerooms", values);
      }
      alert(`Wali kelas berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}!`);
      onSuccess();
    } catch (error) { console.error("Gagal menyimpan wali kelas:", error); alert("Terjadi kesalahan."); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Wali Kelas" : "Tambah Wali Kelas Baru"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Nama</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField name="email" control={form.control} render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField name="password" control={form.control} render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><p className="text-xs text-gray-500">{isEditMode ? "Kosongkan jika tidak ingin mengubah." : ""}</p><FormMessage /></FormItem>)}/>
            </div>

            {/* KOREKSI: Tampilan pilihan kelas diubah menjadi 3 kolom */}
            <FormField name="class_ids" control={form.control} render={() => (
              <FormItem>
                <FormLabel>Kelas yang Diampu (Maks 3)</FormLabel>
                <div className="grid grid-cols-3 gap-4 p-4 border rounded-md">
                  {[7, 8, 9].map(level => (
                    <div key={level}>
                      <h4 className="font-medium mb-2 border-b pb-1">Kelas {level}</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {classesByLevel[level]?.map((cls) => (
                          <FormField key={cls.id} control={form.control} name="class_ids" render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(cls.id)}
                                  onCheckedChange={(checked) => {
                                    let newValue = [...(field.value || [])];
                                    if (checked) {
                                      if (newValue.length < 3) newValue.push(cls.id);
                                    } else {
                                      newValue = newValue.filter((id) => id !== cls.id);
                                    }
                                    field.onChange(newValue);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{cls.name}</FormLabel>
                            </FormItem>
                          )}/>
                        )) || <p className="text-xs text-gray-500">Tidak ada kelas.</p>}
                      </div>
                    </div>
                  ))}
                </div>
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