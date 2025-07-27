import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/homepage/HeroSection";
import FeaturesSection from "@/components/homepage/FeaturesSection";

export default function HomePage() {
  return (
    <div>
      <Navbar />
      <main>
        <HeroSection/>
        <FeaturesSection />
        {/* Tempatkan komponen bagian lain di sini */}
      </main>
      <Footer />
    </div>
  );
}
