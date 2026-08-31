import Link from "next/link";
import { Logo } from "./Logo";
import { WHATSAPP } from "@/lib/contacto";

export function Footer() {
  return (
    <>
      <footer>
        <div className="wrap">
          <Link href="/" className="marca-link">
            <Logo />
          </Link>
          <div className="fcol">
            <a href="#">Instagram</a>
            <a href={WHATSAPP} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a href="#">Facebook</a>
          </div>
        </div>
        <div className="wrap fine">
          <span>© La Pebeta — Farm to Table. Los Cardales, Buenos Aires.</span>
          {/* la puerta del panel: la usa la casa, no quien visita el sitio */}
          <Link href="/admin" className="footer-admin">
            Panel
          </Link>
        </div>
      </footer>
      {/* la firma de quien lo hizo: al pie de todo y en voz baja */}
      <div className="footer-credito">
        <div className="wrap">
          <a
            href="https://nicolizasodev.vercel.app"
            target="_blank"
            rel="noreferrer"
          >
            desarrollado por nldev
          </a>
        </div>
      </div>
    </>
  );
}
