"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, Star, BookOpen, ArrowRight, TrendingUp, Calendar, Award } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Definisikan tipe data
interface Grade {
  score: number;
  exam_date: string;
  subject: { name: string };
  grade_type: { name: string };
}

interface DashboardData {
  recent_grades: Grade[];
  average_score: string;
}

export default function StudentDashboard() {
  const { user, activeSemester } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/student/dashboard-summary')
      .then(res => setData(res.data))
      .catch(err => console.error("Gagal memuat data dasbor.", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Fungsi untuk mendapatkan warna berdasarkan nilai
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 80) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  // Fungsi untuk mendapatkan grade letter
  const getGradeLetter = (score: number) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "E";
  };

    if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto p-4 md:p- lg:p-8 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-6 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-4 md:p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-red-600 text-lg">Gagal memuat data dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-4 md:p-8">
        <div className="space-y-6">
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-indigo-50 via-white-200 to-black-300 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <GraduationCap className="h-8 w-8 text-blue-200 mr-3 text-green-500" />
                    <h1 className="text-2xl md:text-3xl font-bold">
                      Selamat Datang, {user?.name}!
                    </h1>
                  </div>
                  <p className="text-sm md:text-base leading-relaxed">
                    Berikut adalah ringkasan performa akademik Anda untuk semester{" "}
                    <span className="font-semibold">{activeSemester || "ini"}</span>.
                  </p>
                  <div className="mt-4 flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date().toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-20 h-20 bg-indigo-200 rounded-full flex items-center justify-center">
                    <Award className="h-10 w-10 text-yellow-00" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Average Score Card */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">Nilai Rata-rata</h3>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Star className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900">
                    {data.average_score}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getScoreColor(parseFloat(data.average_score))}`}>
                      Grade {getGradeLetter(parseFloat(data.average_score))}
                    </span>
                    <span className="text-xs text-gray-500">dari semua mata pelajaran</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">Total Nilai</h3>
                <div className="p-2 bg-green-50 rounded-lg">
                  <BookOpen className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{data.recent_grades.length}</div>
              <p className="text-xs text-gray-500 mt-1">nilai tercatat</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">Nilai Tertinggi</h3>
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {data.recent_grades.length > 0 ? Math.max(...data.recent_grades.map(g => g.score)) : '-'}
              </div>
              <p className="text-xs text-gray-500 mt-1">semester ini</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">Nilai Terendah</h3>
                <div className="p-2 bg-red-50 rounded-lg">
                  <Star className="h-4 w-4 text-red-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {data.recent_grades.length > 0 ? Math.min(...data.recent_grades.map(g => g.score)) : '-'}
              </div>
              <p className="text-xs text-gray-500 mt-1">semester ini</p>
            </div>
          </div>
        

          {/* Recent Grades */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Nilai Terbaru</h2>
                  <p className="text-sm text-gray-600 mt-1">3 nilai terakhir yang diinput</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {data.recent_grades.length > 0 ? (
                <div className="space-y-4">
                  {/* Desktop View */}
                  <div className="hidden md:block">
                    {data.recent_grades.map((grade, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{grade.subject.name}</h3>
                            <p className="text-sm text-gray-600">{grade.grade_type.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(grade.exam_date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-3 py-2 rounded-lg border text-lg font-bold ${getScoreColor(grade.score)}`}>
                            {grade.score}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Grade {getGradeLetter(grade.score)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden space-y-3">
                    {data.recent_grades.map((grade, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{grade.subject.name}</h3>
                            <p className="text-sm text-gray-600">{grade.grade_type.name}</p>
                          </div>
                          <div className={`ml-3 px-2.5 py-1.5 rounded-md border text-lg font-bold ${getScoreColor(grade.score)}`}>
                            {grade.score}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            {new Date(grade.exam_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="font-medium">Grade {getGradeLetter(grade.score)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Belum Ada Nilai</h3>
                  <p className="text-sm text-gray-600">Belum ada nilai yang diinput di semester ini.</p>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-6 text-center">
                <Link href="/student/grades" passHref>
                <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-8 py-2.5 transition-all duration-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Lihat Semua Nilai
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}