import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Intro } from "@/components/Intro";
import { Process } from "@/components/Process";
import { RestaurantSection } from "@/components/RestaurantSection";
import { GranjaSection } from "@/components/GranjaSection";
import { ProveeduriaSection } from "@/components/ProveeduriaSection";
import { Valores } from "@/components/Valores";
import { Visita } from "@/components/Visita";
import { Footer } from "@/components/Footer";
import { SiteAnimations } from "@/components/SiteAnimations";

export default function Home() {
  return (
    <>
      <SiteAnimations />
      <Header />
      <main>
        <Hero />
        <Intro />
        <Process />
        <RestaurantSection />
        <GranjaSection />
        <ProveeduriaSection />
        <Valores />
        <Visita />
      </main>
      <Footer />
    </>
  );
}
