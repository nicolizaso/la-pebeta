import { WHATSAPP } from "@/lib/contacto";

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <a href="#" className="logo">
          La Pebeta
        </a>
        <div className="fcol">
          <a href="#">Instagram</a>
          <a href={WHATSAPP} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <a href="#">Facebook</a>
        </div>
      </div>
      <div className="wrap fine">© La Pebeta — Farm to Table. Los Cardales, Buenos Aires.</div>
    </footer>
  );
}
