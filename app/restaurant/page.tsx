import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { RestaurantHero } from "@/components/RestaurantHero";
import { RestaurantIntro } from "@/components/RestaurantIntro";
import { RestaurantEthos } from "@/components/RestaurantEthos";
import { CartaFeatures } from "@/components/CartaFeatures";
import { HuertaPrograma } from "@/components/HuertaPrograma";
import { Visita } from "@/components/Visita";
import { Footer } from "@/components/Footer";
import { SiteAnimations } from "@/components/SiteAnimations";

export const metadata: Metadata = {
  title: "Restaurant — La Pebeta",
  description:
    "Restaurant farm to table en Los Cardales: carta que cambia cada semana, de nariz a cola, con opciones veganas y sin TACC. Jueves a domingo, 12 a 16 hs.",
};

export default function RestaurantPage() {
  return (
    <>
      <SiteAnimations />
      <Header />
      <main>
        <RestaurantHero />
        <RestaurantIntro />
        <RestaurantEthos />
        <CartaFeatures />
        <HuertaPrograma />
        <Visita />
      </main>
      <Footer />
    </>
  );
}
