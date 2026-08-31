import Link from "next/link";
import { Photo } from "./Photo";
import { UBICACION } from "@/lib/casa";

const INFO: { k: string; v: React.ReactNode }[] = [
  {
    k: "Dirección",
    v: (
      <>
        {UBICACION.calle}
        <br />
        {UBICACION.localidad}, {UBICACION.provinciaCorta}
      </>
    ),
  },
  { k: "Restaurant", v: "Jueves a domingo, 12 a 16 hs" },
  { k: "Proveeduría", v: "Miércoles a domingo, 9 a 17:30 hs" },
];

export function Visita() {
  return (
    <section className="visita" id="visita">
      <div className="wrap">
        <Photo
          photo="granja/10"
          alt="Árbol solitario en el campo de La Pebeta, con los canteros al fondo"
          className="map reveal"
          tag={UBICACION.referencia}
          sizes="(max-width: 860px) 92vw, 46vw"
          reveal
          parallax
        />
        <div>
          <div className="eyebrow reveal">Cómo llegar</div>
          <h2 className="section-title reveal">A 70 minutos de Buenos Aires.</h2>
          <ul className="info-list">
            {INFO.map((item) => (
              <li className="reveal" key={item.k}>
                <span className="k">{item.k}</span>
                <span className="v">{item.v}</span>
              </li>
            ))}
          </ul>
          <div className="cta-row reveal">
            <Link href="/reservas?tipo=restaurant" className="btn primary">
              Reservar mesa
            </Link>
            <a href="#" className="btn ghost">
              Gift card
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
