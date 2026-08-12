import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";
import { photoRatio, type PhotoEntry } from "@/lib/photos";

const TILES: PhotoEntry[] = [
  { photo: "huerta/25", alt: "Pak choi en hilera sobre tierra recién regada", tag: "Pak choi" },
  { photo: "huerta/7", alt: "Cosecha de tomates de distintas variedades y colores", tag: "Tomates" },
  { photo: "huerta/18", alt: "Acelga de penca roja entre el mulch de paja", tag: "Acelga" },
  { photo: "huerta/22", alt: "Coliflor abriéndose entre sus hojas", tag: "Coliflor" },
  { photo: "huerta/4", alt: "Pimientos verdes recién cosechados, con uno rojo en el medio", tag: "Pimientos" },
  { photo: "huerta/10", alt: "Zapallito creciendo entre las hojas sobre el mulch", tag: "Zapallito" },
  { photo: "huerta/19", alt: "Hileras de lechuga morada con riego por goteo", tag: "Lechuga morada" },
  { photo: "huerta/9", alt: "Berenjena blanca colgando de la planta", tag: "Berenjena" },
  { photo: "huerta/3", alt: "Naranjas maduras en el árbol del bosque frutal", tag: "Naranjas" },
  { photo: "huerta/6", alt: "Cartel de madera que dice Plantinera junto al invernáculo", tag: "Plantinera" },
  { photo: "huerta/20", alt: "Ajíes verdes largos entre el follaje", tag: "Ajíes" },
  { photo: "huerta/23", alt: "Plantines recién germinados en bandejas de semillero", tag: "Semillero" },
];

/**
 * Horizontal filmstrip of the huerta. The section is taller than the screen and
 * the stage inside is sticky, so the track slides sideways as you scroll down
 * (see the `[data-hscroll]` handler in SiteAnimations). On small screens it
 * falls back to a native swipeable row.
 */
export function HuertaShowcase() {
  return (
    <section className="hscroll" id="huerta" data-hscroll>
      <div className="hscroll-stage">
        <div className="wrap hscroll-head">
          <div>
            <div className="eyebrow reveal">04 — Huerta</div>
            <h2 className="section-title reveal" data-split>
              Lo que hoy está en la tierra.
            </h2>
          </div>
          <div className="hscroll-note reveal">
            <p>
              Veinticinco canteros, dos invernáculos y un bosque frutal en producción todo el año.
              Nada viaja más de trescientos metros hasta la cocina.
            </p>
            <LinkArrow href="/#visita">Visitar la huerta</LinkArrow>
          </div>
        </div>

        <div className="hscroll-viewport">
          <div className="hscroll-track" data-hscroll-track>
            {TILES.map((tile) => (
              <Photo
                key={tile.photo}
                photo={tile.photo}
                alt={tile.alt}
                tag={tile.tag}
                className="hscroll-item"
                sizes="(max-width: 860px) 70vw, 34vw"
                style={{ aspectRatio: photoRatio(tile.photo) }}
                lightbox
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
