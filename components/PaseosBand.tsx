import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";
import { DIAS_TEXTO, HORA_SALIDA } from "@/lib/experiencias";

/**
 * Full-bleed parallax band for the guided walks: pasture behind, the visit
 * itself on the card in front.
 */
export function PaseosBand() {
  return (
    <section className="band" id="paseos">
      <Photo
        photo="paseos/16"
        alt="Rodeo de vacas Hereford descansando a la sombra de los árboles"
        className="band-bg"
        sizes="100vw"
        parallax
        scrim
        position="center 55%"
      />
      <div className="wrap band-inner">
        <div className="band-copy">
          <div className="eyebrow reveal">05 — Experiencias</div>
          <h2 className="section-title reveal" data-split>
            Caminá el campo antes de sentarte a la mesa.
          </h2>
          <p className="body reveal">
            Dos experiencias, las dos con reserva previa: la visita a la huerta, sin cargo y de 40
            minutos, y el paseo por la granja, un recorrido productivo de 2 km entre los cultivos y
            los animales. Salen {DIAS_TEXTO.toLowerCase()} a las {HORA_SALIDA} hs y terminan con tu
            mesa lista para almorzar.
          </p>
          <LinkArrow href="/paseos">Conocer las experiencias</LinkArrow>
        </div>
        <Photo
          photo="paseos/17"
          alt="Grupo de visitantes caminando por el camino de la granja"
          className="band-card reveal"
          tag={`${DIAS_TEXTO} — ${HORA_SALIDA} hs`}
          sizes="(max-width: 860px) 80vw, 30vw"
          reveal
          lightbox
        />
      </div>
    </section>
  );
}
