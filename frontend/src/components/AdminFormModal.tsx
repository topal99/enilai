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

// Tipe data
interface User { id: number; name: string; email: string; }
interface Role { id: number; name: string; }
interface ModalProps {
  isOpen: boolean; onClose: () => void; onSuccess: () => void;
  userToEdit: User | null; roles: Role[];
}

// Skema validasi
const formSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().optional(),
});

export default function AdminFormModal({ isOpen, onClose, onSuccess, userToEdit, roles }: ModalProps) {
  const isEditMode = !!userToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  useEffect(() => {
    if (isEditMode && userToEdit) {
      form.reset({ name: userToEdit.name, email: userToEdit.email, password: "" });
    } else {
      form.reset({ name: "", email: "", password: "" });
    }
  }, [userToEdit, form, isEditMode]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const adminRoleId = roles.find(r => r.name === 'admin')?.id;
    if (!adminRoleId) {
      alert("Error: Peran 'admin' tidak ditemukan.");
      return;
    }
    
    // Payload selalu menggunakan role_id untuk admin
    const payload = { ...values, role_id: adminRoleId };

    try {
      if (isEditMode) {
        if (!userToEdit?.id) { throw new Error("ID Admin tidak ditemukan untuk diedit."); }
        await api.put(`/admin/users/${userToEdit.id}`, payload);
      } else {
        await api.post("/admin/users", payload);
      }
      alert(`Admin berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}!`);
      onSuccess();
    } catch (error: any) {
        // ... (Error handling sama seperti modal lain)
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Admin" : "Tambah Admin Baru"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Nama</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField name="email" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField name="password" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl>
              <p className="text-xs text-gray-500">{isEditMode ? "Kosongkan jika tidak ingin mengubah." : ""}</p><FormMessage /></FormItem>
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