"use client";

import { useState, FormEvent } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Rekomendasi Nilai Berbasis AI</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Kolom Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Input Data Penilaian</CardTitle>
            <CardDescription>Unggah file tugas dan masukkan kriteria penilaian Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="assignment-file">1. Unggah File Tugas Murid (.txt)</Label>
                <Input id="assignment-file" type="file" onChange={handleFileChange} accept=".txt" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="criteria">2. Masukkan Kriteria Penilaian</Label>
                <Textarea
                  id="criteria"
                  placeholder="Contoh:&#10;Struktur Esai: 40%&#10;Tata Bahasa: 30%&#10;Kreativitas Argumen: 30%"
                  value={criteria}
                  onChange={(e) => setCriteria(e.target.value)}
                  className="min-h-[120px]"
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Menganalisis...' : 'Dapatkan Rekomendasi'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Kolom Hasil Analisis */}
        <Card>
          <CardHeader>
            <CardTitle>Hasil Analisis AI</CardTitle>
            <CardDescription>Rekomendasi nilai dan alasan akan muncul di sini.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <div className="text-center p-8">Menganalisis tugas, mohon tunggu...</div>}
            {error && <div className="text-center p-8 text-red-500">{error}</div>}
            {aiResult && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground">Rekomendasi Nilai</p>
                  <p className="text-7xl font-bold text-indigo-600">{aiResult.recommended_score}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Alasan Penilaian:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {aiResult.reasoning.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {!isLoading && !error && !aiResult && (
              <div className="text-center p-8 text-muted-foreground">Hasil akan ditampilkan di sini.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}