"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Skema untuk form ganti password
const passwordSchema = z.object({
  current_password: z.string().min(1, "Password saat ini harus diisi."),
  password: z.string().min(8, "Password baru minimal 8 karakter."),
  password_confirmation: z.string(),
}).refine(data => data.password === data.password_confirmation, {
  message: "Konfirmasi password tidak cocok.",
  path: ["password_confirmation"],
});

export default function TeacherSettingsPage() {
  const { user, login } = useAuth(); // Ambil fungsi login untuk update data global


  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: "", password: "", password_confirmation: "" },
  });

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
      <h1 className="text-2xl font-bold">Pengaturan Akun</h1>

      {/* Card Ganti Password */}
      <Card>
        <CardHeader><CardTitle>Ubah Password</CardTitle></CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
              <FormField name="current_password" control={passwordForm.control} render={({ field }) => (
                <FormItem><FormLabel>Password Saat Ini</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField name="password" control={passwordForm.control} render={({ field }) => (
                <FormItem><FormLabel>Password Baru</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField name="password_confirmation" control={passwordForm.control} render={({ field }) => (
                <FormItem><FormLabel>Konfirmasi Password Baru</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>Ubah Password</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}