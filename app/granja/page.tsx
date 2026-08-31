import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { GranjaHero } from "@/components/GranjaHero";
import { GranjaIntro } from "@/components/GranjaIntro";
import { GranjaEcosistema } from "@/components/GranjaEcosistema";
import { GranjaCiclo } from "@/components/GranjaCiclo";
import { GranjaAnimales } from "@/components/GranjaAnimales";
import { GranjaLugares } from "@/components/GranjaLugares";
import { Visita } from "@/components/Visita";
import { Footer } from "@/components/Footer";
import { SiteAnimations } from "@/components/SiteAnimations";
import { Lightbox } from "@/components/Lightbox";

export const metadata: Metadata = {
  title: "Granja — La Pebeta",
  description:
    "La granja agroecológica de La Pebeta en Los Cardales: bosques, espejos de agua, compost y animales de pastoreo, con el territorio diseñado desde la permacultura.",
};

/**
 * Se arma en cada visita: el menú pregunta qué secciones están activas, y
 * prender la tienda o el blog desde el panel tiene que verse acá enseguida.
 */
export const dynamic = "force-dynamic";

export default function GranjaPage() {
  return (
    <>
      <SiteAnimations />
      <Header />
      <main>
        <GranjaHero />
        <GranjaIntro />
        <GranjaEcosistema />
        <GranjaCiclo />
        <GranjaAnimales />
        <GranjaLugares />
        <Visita />
      </main>
      <Footer />
      <Lightbox />
    </>
  );
}
