import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";
import { DIAS_TEXTO, HORA_SALIDA } from "@/lib/experiencias";

const DATOS = [
  { k: "Días", v: DIAS_TEXTO },
  { k: "Salida", v: `${HORA_SALIDA} hs` },
  { k: "Duración", v: "40 minutos aprox." },
  { k: "Exigencia física", v: "Baja, caminata tranquila" },
  { k: "Aptitud", v: "Apta para toda la familia" },
  { k: "Costo", v: "Sin cargo" },
];

export function HuertaPrograma() {
  return (
    <section className="feature reverse" id="programa">
      <div className="wrap">
        <div className="copy">
          <div className="eyebrow reveal">Visita a la huerta</div>
          <h2 className="section-title reveal" data-split>
            Antes de comer, caminá la huerta.
          </h2>
          <p className="body reveal">
            Un paseo informativo y educativo de cuarenta minutos entre los canteros y los frutales:
            cómo cultivamos sin agroquímicos, qué pide cada temporada y el trabajo diario detrás de
            cada verdura. Es sin cargo, va con reserva previa y termina con tu mesa lista para
            almorzar.
          </p>
          <ul className="info-list reveal">
            {DATOS.map((dato) => (
              <li key={dato.k}>
                <span className="k">{dato.k}</span>
                <span className="v">{dato.v}</span>
              </li>
            ))}
          </ul>
          <LinkArrow href="/paseos#huerta">Ver la experiencia</LinkArrow>
        </div>
        <div className="media-stack">
          <Photo
            photo="huerta/8"
            alt="Trabajadora de la huerta plantando de rodillas entre los canteros"
            className="media"
            tag="Huerta — 40 minutos, sin cargo"
            sizes="(max-width: 860px) 92vw, 46vw"
            reveal
            parallax
            lightbox
          />
          <Photo
            photo="huerta/6"
            alt="Cartel de madera que dice Plantinera junto al invernáculo"
            className="media-inset"
            sizes="(max-width: 860px) 40vw, 20vw"
            reveal
            lightbox
          />
        </div>
      </div>
    </section>
  );
}
