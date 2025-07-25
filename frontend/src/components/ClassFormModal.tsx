"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api"; // Pastikan impor ini benar
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";

// Tipe data
interface ClassModel { id: number; level: number; name: string; }
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classToEdit: ClassModel | null;
}

// Skema validasi Zod
const formSchema = z.object({
  level: z.string().nonempty("Tingkat harus dipilih"),
  name: z.string().min(1, "Abjad kelas harus diisi").max(5, "Maksimal 5 karakter"),
});

export default function ClassFormModal({ isOpen, onClose, onSuccess, classToEdit }: ModalProps) {
  const isEditMode = !!classToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { level: "", name: "" },
  });

  // Isi form jika dalam mode edit
  useEffect(() => {
    if (isOpen && classToEdit) {
      form.reset({
        level: String(classToEdit.level),
        name: classToEdit.name,
      });
    } else {
      form.reset({ level: "", name: "" });
    }
  }, [classToEdit, form, isOpen]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditMode) {
        // Pastikan 'api' yang diimpor digunakan di sini
        await api.put(`/admin/classes/${classToEdit.id}`, values);
      } else {
        // Pastikan 'api' yang diimpor digunakan di sini
        await api.post("/admin/classes", values);
      }
      alert(`Kelas berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}!`);
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan kelas.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Kelas" : "Tambah Kelas Baru"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="level" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Tingkat</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Pilih tingkat..." /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="7">Kelas 7</SelectItem>
                    <SelectItem value="8">Kelas 8</SelectItem>
                    <SelectItem value="9">Kelas 9</SelectItem>
                  </SelectContent>
                </Select><FormMessage /></FormItem>
            )}/>
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Nama / Abjad Kelas</FormLabel>
                <FormControl><Input placeholder="Contoh: A" {...field} /></FormControl><FormMessage /></FormItem>
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