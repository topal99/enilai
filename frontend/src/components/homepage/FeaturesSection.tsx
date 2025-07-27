import { BookOpen, Dna, Telescope } from 'lucide-react';

const features = [
  { icon: <BookOpen size={48} className="text-indigo-500"/>, title: "Kurikulum Modern", description: "Mengintegrasikan teknologi dan metode pembelajaran terkini." },
  { icon: <Telescope size={48} className="text-indigo-500"/>, title: "Fasilitas Lengkap", description: "Laboratorium, perpustakaan, dan lapangan olahraga berstandar." },
  { icon: <Dna size={48} className="text-indigo-500"/>, title: "Ekstrakurikuler", description: "Beragam pilihan untuk mengembangkan bakat dan minat siswa." }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Keunggulan Kami</h2>
        <p className="text-gray-600 mb-12">Mengapa memilih SMP Teladan?</p>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}