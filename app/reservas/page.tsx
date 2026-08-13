import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { ReservasSelector, type ReservaTipo } from "@/components/ReservasSelector";
import { Footer } from "@/components/Footer";
import { SiteAnimations } from "@/components/SiteAnimations";
import { Lightbox } from "@/components/Lightbox";

export const metadata: Metadata = {
  title: "Reservas — La Pebeta",
  description:
    "Reservá un paseo por el campo o una mesa en el restaurant de La Pebeta, en Los Cardales. Jueves a domingo.",
};

/** `/reservas?tipo=paseos` llega preseleccionado desde los CTA del sitio. */
export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const inicial: ReservaTipo | undefined =
    tipo === "paseos" || tipo === "restaurant" ? tipo : undefined;

  return (
    <>
      <SiteAnimations />
      <Header />
      <main>
        <ReservasSelector inicial={inicial} />
      </main>
      <Footer />
      <Lightbox />
    </>
  );
}
