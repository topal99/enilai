"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@radix-ui/react-label";
import { Settings, User, Lock, Shield, Eye, EyeOff, CheckCircle, AlertCircle, Info, UserCheck, Mail, Crown } from "lucide-react";
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

export default function HomeroomSettingsPage() {
  const { user } = useAuth();
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
    return { strength: 100, label: "Sangat Kuat", color: "bg-indigo-500" };
  };

  const currentPassword = passwordForm.watch("password") || "";
  const passwordStrength = getPasswordStrength(currentPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-4 sm:p-6 lg:p-8 mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Settings className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Profil & Pengaturan Akun</h1>
              </div>
            </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Kelola informasi profil dan keamanan akun Anda
            </p>
        </div>

        {/* Profile Summary Card */}
        <Card className="shadow-sm border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 items-center sm:items-start">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    {user?.name || "Nama Pengguna"}
                  </h2>
                    <Badge variant="outline" className="w-fit">
                        <UserCheck className="mr-1 h-3.5 w-3.5" />
                        Wali Kelas
                    </Badge>
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {user?.email || "email@example.com"}
                  </p>
                </div>
                <p className="text-xs text-indigo-600 font-medium">
                  Akun aktif dan terverifikasi
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Account Information */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Account Info Card */}
            <Card className="shadow-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg sm:text-xl">Informasi Akun</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Informasi ini dikelola oleh Admin dan tidak dapat diubah secara mandiri.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      Nama Lengkap
                    </Label>
                    <Input 
                      value={user?.name || ''} 
                      readOnly 
                      disabled 
                      className="bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Crown className="h-4 w-4 text-gray-500" />
                      Peran
                    </Label>
                    <Input 
                      value={user?.role?.name ? user.role.name.charAt(0).toUpperCase() + user.role.name.slice(1) : ''} 
                      readOnly 
                      disabled 
                      className="bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    Email
                  </Label>
                  <Input 
                    value={user?.email || ''} 
                    readOnly 
                    disabled 
                    className="bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-700">
                    Untuk mengubah informasi di atas, silakan hubungi administrator sekolah.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Password Change Card */}
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
                  <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700">
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
                                  passwordStrength.strength >= 75 ? 'text-indigo-600' : 
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
                      className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium px-8 py-2.5 transition-all duration-200"
                    >
                      {passwordForm.formState.isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Menyimpan...
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

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Security Tips */}
            <Card className="shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-lg">Tips Keamanan</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span>Gunakan kombinasi huruf besar, kecil, angka, dan simbol</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
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
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium">Email Terverifikasi</span>
                  </div>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
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
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Akun Wali Kelas</span>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    Aktif
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="shadow-sm bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                    <Info className="h-5 w-5 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Butuh Bantuan?</h3>
                  <p className="text-xs text-gray-600">
                    Jika mengalami masalah dengan akun, hubungi administrator sekolah atau IT support.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}