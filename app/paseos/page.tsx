import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { PaseosHero } from "@/components/PaseosHero";
import { PaseosIntro } from "@/components/PaseosIntro";
import { PaseosPrograma } from "@/components/PaseosPrograma";
import { PaseosAnimales } from "@/components/PaseosAnimales";
import { PaseosGaleria } from "@/components/PaseosGaleria";
import { PaseosReserva } from "@/components/PaseosReserva";
import { Visita } from "@/components/Visita";
import { Footer } from "@/components/Footer";
import { SiteAnimations } from "@/components/SiteAnimations";
import { Lightbox } from "@/components/Lightbox";

export const metadata: Metadata = {
  title: "Paseos y animales — La Pebeta",
  description:
    "Paseos guiados por la granja de La Pebeta en Los Cardales: salen a las 11 hs, recorren la huerta y los animales, y terminan en los gallineros antes del almuerzo.",
};

export default function PaseosPage() {
  return (
    <>
      <SiteAnimations />
      <Header />
      <main>
        <PaseosHero />
        <PaseosIntro />
        <PaseosPrograma />
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
