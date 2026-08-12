import { Photo } from "./Photo";

const INFO: { k: string; v: React.ReactNode }[] = [
  {
    k: "Dirección",
    v: (
      <>
        Camino S.A. de Areco, Km 184
        <br />
        Los Cardales, Bs. As.
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
          tag="Ruta prov. 6, Km 184 — Los Cardales"
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
            <a href="#" className="btn primary">
              Reservar mesa
            </a>
            <a href="#" className="btn ghost">
              Gift card
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
