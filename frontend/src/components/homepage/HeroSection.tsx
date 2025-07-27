import Link from 'next/link';

export default function HeroSection() {
  return (
    <section id="hero" className="relative h-screen flex items-center justify-center text-white">
        <img 
          src="/images/herosection.png"
          alt="Gedung SMP Teladan" 
          className="absolute inset-0 w-full h-full object-cover"
          opacity-60
        />
        <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">Membentuk Generasi Cerdas & Berkarakter</h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
          Menyediakan pendidikan berkualitas yang menginspirasi siswa untuk mencapai potensi terbaik mereka.
        </p>
        <Link href="#features">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
            Pelajari Lebih Lanjut
          </button>
        </Link>
      </div>
    </section>
  );
}