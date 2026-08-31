import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { HuertaHero } from "@/components/HuertaHero";
import { HuertaIntro } from "@/components/HuertaIntro";
import { HuertaManejo } from "@/components/HuertaManejo";
import { HuertaTemporada } from "@/components/HuertaTemporada";
import { HuertaCosecha } from "@/components/HuertaCosecha";
import { HuertaPrograma } from "@/components/HuertaPrograma";
import { Visita } from "@/components/Visita";
import { Footer } from "@/components/Footer";
import { SiteAnimations } from "@/components/SiteAnimations";
import { Lightbox } from "@/components/Lightbox";

export const metadata: Metadata = {
  title: "Huerta — La Pebeta",
  description:
    "La huerta de La Pebeta en Los Cardales: veinticinco canteros, dos invernáculos y un bosque frutal en producción todo el año, sin agroquímicos y a trescientos metros de la cocina.",
};

/**
 * Se arma en cada visita: el menú pregunta qué secciones están activas, y
 * prender la tienda o el blog desde el panel tiene que verse acá enseguida.
 */
export const dynamic = "force-dynamic";

export default function HuertaPage() {
  return (
    <>
      <SiteAnimations />
      <Header />
      <main>
        <HuertaHero />
        <HuertaIntro />
        <HuertaManejo />
        <HuertaTemporada />
        <HuertaCosecha />
        <HuertaPrograma />
        <Visita />
      </main>
      <Footer />
      <Lightbox />
    </>
  );
}
