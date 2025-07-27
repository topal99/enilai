"use client";

import { useState, FormEvent } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, Brain, FileText, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Tipe data untuk hasil dari AI
interface AiResult {
  recommended_score: number;
  reasoning: string[];
}

export default function AiRecommendationPage() {
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [criteria, setCriteria] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAssignmentFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!assignmentFile || !criteria) {
      alert("Harap unggah file tugas dan isi kriteria penilaian.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAiResult(null);

    // Gunakan FormData untuk mengirim file
    const formData = new FormData();
    formData.append('assignment_file', assignmentFile);
    formData.append('criteria', criteria);

    try {
      const response = await api.post('/teacher/ai-recommendation', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAiResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Terjadi kesalahan saat menganalisis.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: "Excellent", variant: "default" as const, color: "bg-green-500" };
    if (score >= 80) return { label: "Good", variant: "secondary" as const, color: "bg-blue-500" };
    if (score >= 70) return { label: "Fair", variant: "secondary" as const, color: "bg-yellow-500" };
    if (score >= 60) return { label: "Poor", variant: "outline" as const, color: "bg-orange-500" };
    return { label: "Very Poor", variant: "destructive" as const, color: "bg-red-500" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-4 sm:p-6 lg:p-8 mx-auto space-y-6">
        
        {/* Header */}
        <div className="sm:text-left space-y-2">
          <div className="flex items-center sm:justify-start gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Rekomendasi Nilai Berbasis AI
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Gunakan kecerdasan buatan untuk mendapatkan rekomendasi nilai yang objektif dan konsisten berdasarkan kriteria yang Anda tetapkan.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Kolom Input Form */}
          <div className="space-y-6">
            <Card className="shadow-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg sm:text-xl">Input Data Penilaian</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Unggah file tugas dan masukkan kriteria penilaian Anda untuk mendapatkan rekomendasi AI.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* File Upload Section */}
                  <div className="space-y-3">
                    <Label htmlFor="assignment-file" className="text-sm font-medium flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                      Unggah File Tugas Murid (.txt)
                    </Label>
                    <div className="relative">
                      <Input 
                        id="assignment-file" 
                        type="file" 
                        onChange={handleFileChange} 
                        accept=".txt" 
                        required 
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                      />
                    </div>
                    {assignmentFile && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                        <CheckCircle className="h-4 w-4" />
                        <span>File terpilih: {assignmentFile.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Criteria Section */}
                  <div className="space-y-3">
                    <Label htmlFor="criteria" className="text-sm font-medium flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                      Masukkan Kriteria Penilaian
                    </Label>
                    <Textarea
                      id="criteria"
                      placeholder="Contoh kriteria penilaian:&#10;&#10;• Struktur Esai: 40%&#10;• Tata Bahasa: 30%&#10;• Kreativitas Argumen: 30%&#10;&#10;Berikan penjelasan detail untuk setiap aspek yang akan dinilai..."
                      value={criteria}
                      onChange={(e) => setCriteria(e.target.value)}
                      className="min-h-[140px] resize-none"
                      required
                    />
                    <div className="text-xs text-muted-foreground">
                      💡 Tip: Semakin detail kriteria yang Anda berikan, semakin akurat rekomendasi AI.
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading || !assignmentFile || !criteria} 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        Menganalisis Tugas...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Dapatkan Rekomendasi AI
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Card - Hidden on mobile when result is shown */}
            <Card className={`shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 ${aiResult ? 'hidden xl:block' : 'block'}`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-blue-900">Tips Penggunaan</h3>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li>• Pastikan file tugas dalam format .txt</li>
                      <li>• Berikan kriteria penilaian yang spesifik dan terukur</li>
                      <li>• AI akan menganalisis konten dan memberikan skor objektif</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kolom Hasil Analisis */}
          <div className="space-y-6">
            <Card className="shadow-sm border-0 shadow-lg min-h-[400px] flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg sm:text-xl">Hasil Analisis AI</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Rekomendasi nilai dan alasan akan muncul di sini setelah analisis selesai.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                
                {/* Loading State */}
                {isLoading && (
                  <div className="text-center space-y-4 py-8">
                    <div className="relative">
                      <div className="w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-gray-700">Menganalisis tugas dengan AI...</p>
                      <p className="text-sm text-muted-foreground">Proses ini memerlukan waktu beberapa detik</p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="text-center space-y-4 py-8">
                    <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-red-700">Terjadi Kesalahan</p>
                      <p className="text-sm text-red-600 max-w-md mx-auto">{error}</p>
                    </div>
                  </div>
                )}

                {/* Success State */}
                {aiResult && (
                  <div className="space-y-6 py-4">
                    {/* Score Display */}
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <div className="mx-auto w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-lg">
                          <div className="text-center">
                            <p className={`text-4xl sm:text-5xl font-bold ${getScoreColor(aiResult.recommended_score)}`}>
                              {aiResult.recommended_score}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">/ 100</p>
                          </div>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <Badge 
                            variant={getScoreBadge(aiResult.recommended_score).variant}
                            className="text-xs font-medium"
                          >
                            {getScoreBadge(aiResult.recommended_score).label}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rekomendasi Nilai AI</p>
                        <p className="text-lg font-semibold text-gray-800">
                          Skor: {aiResult.recommended_score}/100
                        </p>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Alasan Penilaian:
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {aiResult.reasoning.map((reason, index) => (
                          <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                            <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <p className="text-gray-700 leading-relaxed">{reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && !aiResult && (
                  <div className="text-center space-y-4 py-8">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                      <Brain className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-gray-600">Siap untuk Analisis</p>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Unggah file tugas dan masukkan kriteria penilaian untuk mendapatkan rekomendasi dari AI.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}