import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Intro } from "@/components/Intro";
import { PhotoMarquee } from "@/components/PhotoMarquee";
import { Process } from "@/components/Process";
import { RestaurantSection } from "@/components/RestaurantSection";
import { GranjaSection } from "@/components/GranjaSection";
import { ProveeduriaSection } from "@/components/ProveeduriaSection";
import { HuertaShowcase } from "@/components/HuertaShowcase";
import { PaseosBand } from "@/components/PaseosBand";
import { EventosSection } from "@/components/EventosSection";
import { Valores } from "@/components/Valores";
import { Visita } from "@/components/Visita";
import { Footer } from "@/components/Footer";
import { SiteAnimations } from "@/components/SiteAnimations";
import { Lightbox } from "@/components/Lightbox";

/**
 * Se arma en cada visita: el menú pregunta qué secciones están activas, y
 * prender la tienda o el blog desde el panel tiene que verse acá enseguida.
 */
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <SiteAnimations />
      <Header />
      <main>
        <Hero />
        <Intro />
        <PhotoMarquee />
        <Process />
        <RestaurantSection />
        <GranjaSection />
        <ProveeduriaSection />
        <HuertaShowcase />
        <PaseosBand />
        <EventosSection />
        <Valores />
        <Visita />
      </main>
      <Footer />
      <Lightbox />
    </>
  );
}
