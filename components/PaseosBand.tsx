import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";

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
          <div className="eyebrow reveal">05 — Paseos y animales</div>
          <h2 className="section-title reveal" data-split>
            Caminá el campo antes de sentarte a la mesa.
          </h2>
          <p className="body reveal">
            Vacas de pastoreo, ovejas, chanchos y gallinas ponedoras conviven con el bosque y los
            espejos de agua. Los recorridos salen a la mañana y terminan en los gallineros, justo
            antes del almuerzo.
          </p>
          <LinkArrow href="/reservas?tipo=paseos">Reservar un paseo</LinkArrow>
        </div>
        <Photo
          photo="paseos/17"
          alt="Grupo de visitantes caminando por el camino de la granja"
          className="band-card reveal"
          tag="Paseo guiado — 11 hs"
          sizes="(max-width: 860px) 80vw, 30vw"
          reveal
          lightbox
        />
      </div>
    </section>
  );
}
