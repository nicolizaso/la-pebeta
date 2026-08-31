import Link from "next/link";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { SiteAnimations } from "./SiteAnimations";
import { WHATSAPP } from "@/lib/contacto";

/**
 * Lo que se ve en la dirección de una sección apagada.
 *
 * No es un error: la página existe y está hecha, todavía no está abierta. Por
 * eso conserva el menú y el pie —desde acá se sigue al restaurant o a reservar—
 * y ofrece WhatsApp, que mientras tanto es por donde se compra y se pregunta.
 */
export function Proximamente({
  eyebrow,
  titulo,
  children,
}: {
  eyebrow: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteAnimations />
      <Header />
      <main>
        <section className="proximamente">
          <div className="wrap">
            <div className="eyebrow reveal">{eyebrow}</div>
            <h1 className="reveal">{titulo}</h1>
            <div className="proximamente-cuerpo reveal">{children}</div>
            <div className="proximamente-acciones reveal">
              <Link className="btn ghost" href="/">
                Volver al inicio
              </Link>
              <a className="btn primary" href={WHATSAPP} target="_blank" rel="noreferrer">
                Escribinos por WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
