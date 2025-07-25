"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect } from "react";

// Definisikan tipe data
interface Subject { id: number; name: string; }
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subjectToEdit: Subject | null;
}

// Skema validasi dengan Zod
const formSchema = z.object({
  name: z.string().min(3, "Nama mata pelajaran minimal 3 karakter"),
});

export default function SubjectFormModal({ isOpen, onClose, onSuccess, subjectToEdit }: ModalProps) {
  const isEditMode = !!subjectToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  // Isi form jika dalam mode edit
  useEffect(() => {
    if (isEditMode) {
      form.reset({ name: subjectToEdit.name });
    } else {
      form.reset({ name: "" });
    }
  }, [subjectToEdit, form, isEditMode]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditMode) {
        await api.put(`/admin/subjects/${subjectToEdit.id}`, values);
      } else {
        await api.post("/admin/subjects", values);
      }
      alert(`Mata pelajaran berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}!`);
      onSuccess();
    } catch (error) {
      console.error("Gagal menyimpan mata pelajaran:", error);
      alert("Terjadi kesalahan.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran Baru"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Mata Pelajaran</FormLabel>
                <FormControl><Input placeholder="Contoh: Fisika" {...field} /></FormControl>
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