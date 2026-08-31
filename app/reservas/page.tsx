import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { ReservasSelector } from "@/components/ReservasSelector";
import type { ReservaTipo } from "@/lib/db";
import { esReservaTipo, hoyISO } from "@/lib/reservas";
import { Footer } from "@/components/Footer";
import { SiteAnimations } from "@/components/SiteAnimations";
import { Lightbox } from "@/components/Lightbox";

export const metadata: Metadata = {
  title: "Reservas — La Pebeta",
  description:
    "Reservá una experiencia en el campo o una mesa en el restaurant de La Pebeta, en Los Cardales. Las experiencias salen viernes, sábados y domingos a las 11; el restaurant abre de jueves a domingo.",
};

/**
 * Se arma en cada visita: el menú pregunta qué secciones están activas, y
 * prender la tienda o el blog desde el panel tiene que verse acá enseguida.
 */
export const dynamic = "force-dynamic";

/** `/reservas?tipo=paseos` llega preseleccionado desde los CTA del sitio. */
export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const inicial: ReservaTipo | undefined = esReservaTipo(tipo) ? tipo : undefined;

  return (
    <>
      <SiteAnimations />
      <Header />
      <main>
        <ReservasSelector inicial={inicial} hoy={hoyISO()} />
      </main>
      <Footer />
      <Lightbox />
    </>
  );
}
