import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { PaseosHero } from "@/components/PaseosHero";
import { PaseosIntro } from "@/components/PaseosIntro";
import { PaseosExperiencias } from "@/components/PaseosExperiencias";
import { PaseosComparativa } from "@/components/PaseosComparativa";
import { PaseosAnimales } from "@/components/PaseosAnimales";
import { PaseosGaleria } from "@/components/PaseosGaleria";
import { PaseosReserva } from "@/components/PaseosReserva";
import { Visita } from "@/components/Visita";
import { Footer } from "@/components/Footer";
import { SiteAnimations } from "@/components/SiteAnimations";
import { Lightbox } from "@/components/Lightbox";

export const metadata: Metadata = {
  title: "Experiencias — La Pebeta",
  description:
    "Las dos experiencias de La Pebeta en Los Cardales: la visita a la huerta, sin cargo y de 40 minutos, y el paseo por la granja, un recorrido productivo de 2 km. Viernes, sábados y domingos a las 11, con reserva previa y la mesa lista al terminar.",
};

/**
 * Se arma en cada visita: el menú pregunta qué secciones están activas, y
 * prender la tienda o el blog desde el panel tiene que verse acá enseguida.
 */
export const dynamic = "force-dynamic";

export default function PaseosPage() {
  return (
    <>
      <SiteAnimations />
      <Header />
      <main>
        <PaseosHero />
        <PaseosIntro />
        <PaseosExperiencias />
        <PaseosComparativa />
        <PaseosAnimales />
        <PaseosGaleria />
        <PaseosReserva />
        <Visita />
      </main>
      <Footer />
      <Lightbox />
    </>
  );
}
