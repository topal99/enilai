"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Lock, User, Shield, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

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
  const { user, login } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: "", password: "", password_confirmation: "" },
  });

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    try {
      await api.post('/settings/change-password', values);
      setIsSuccess(true);
      passwordForm.reset();
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error: any) {
      alert(`Gagal mengubah password: ${error.response?.data?.message || 'Error tidak diketahui'}`);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 8) return { strength: 25, label: "Lemah", color: "bg-red-500" };
    if (password.length < 12) return { strength: 50, label: "Sedang", color: "bg-yellow-500" };
    if (password.length < 16) return { strength: 75, label: "Kuat", color: "bg-blue-500" };
    return { strength: 100, label: "Sangat Kuat", color: "bg-green-500" };
  };

  const currentPassword = passwordForm.watch("password") || "";
  const passwordStrength = getPasswordStrength(currentPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="p-4 sm:p-6 lg:p-8 mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Pengaturan Akun</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Kelola informasi akun dan keamanan Anda
              </p>
            </div>
          </div>
        </div>

        {/* Profile Summary Card */}
        <Card className="shadow-sm border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 text-center sm:text-left">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center items-center sm:justify-start gap-2">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    {user?.name || "Nama Pengguna"}
                  </h2>
                  <Badge variant="secondary" className="w-fit">
                    <Shield className="h-3 w-3 mr-1" />
                    Teacher
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Email: {user?.email || "email@example.com"}
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  Akun aktif dan terverifikasi
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* End Profile Summary Card */}
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Password Change Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg sm:text-xl">Ubah Password</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Pastikan password Anda kuat dan tidak mudah ditebak untuk menjaga keamanan akun.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Success Message */}
                {isSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Password berhasil diubah!</span>
                  </div>
                )}

                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                    
                    {/* Current Password */}
                    <FormField 
                      name="current_password" 
                      control={passwordForm.control} 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Password Saat Ini</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showCurrentPassword ? "text" : "password"} 
                                placeholder="Masukkan password saat ini"
                                className="pr-10"
                                {...field} 
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* New Password */}
                    <FormField 
                      name="password" 
                      control={passwordForm.control} 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Password Baru</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showNewPassword ? "text" : "password"} 
                                placeholder="Masukkan password baru (min. 8 karakter)"
                                className="pr-10"
                                {...field} 
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          
                          {/* Password Strength Indicator */}
                          {currentPassword && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                    style={{ width: `${passwordStrength.strength}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-medium ${
                                  passwordStrength.strength >= 75 ? 'text-green-600' : 
                                  passwordStrength.strength >= 50 ? 'text-blue-600' :
                                  passwordStrength.strength >= 25 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {passwordStrength.label}
                                </span>
                              </div>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Confirm Password */}
                    <FormField 
                      name="password_confirmation" 
                      control={passwordForm.control} 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Konfirmasi Password Baru</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="Ulangi password baru"
                                className="pr-10"
                                {...field} 
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={passwordForm.formState.isSubmitting}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-8 py-2.5 transition-all duration-200"
                    >
                      {passwordForm.formState.isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Mengubah...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Ubah Password
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Security Tips Sidebar */}
          <div className="space-y-6">
            
            {/* Security Tips */}
            <Card className="shadow-sm bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg">Tips Keamanan</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Gunakan kombinasi huruf besar, kecil, angka, dan simbol</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Minimal 8 karakter, disarankan 12+ karakter</span>
                  </div>
                  <div className="flex gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Jangan gunakan informasi personal yang mudah ditebak</span>
                  </div>
                  <div className="flex gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Ubah password secara berkala</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Security Status */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Status Keamanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Email Terverifikasi</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Aktif
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Password Terenkripsi</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Aman
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}