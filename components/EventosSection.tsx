import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";
import { photoRatio, type PhotoEntry } from "@/lib/photos";

const TILES: PhotoEntry[] = [
  { photo: "eventos/3", alt: "Toldo de tela y follaje montado sobre fardos en el campo", tag: "Montaje" },
  { photo: "eventos/5", alt: "Mesa larga servida con platos, tazas y flores del campo", tag: "Mesa larga" },
  { photo: "eventos/7", alt: "Fogón encendido al atardecer frente al pastizal", tag: "Fogón" },
  { photo: "eventos/4", alt: "Postres de chocolate emplatados en hilera", tag: "Postre" },
  { photo: "eventos/2", alt: "Brigada de cocina reunida a la mañana en el campo", tag: "Brigada" },
  { photo: "eventos/8", alt: "Grupo de invitados posando con plantines en maceta", tag: "Corporativos" },
];

export function EventosSection() {
  return (
    <section className="eventos" id="eventos">
      <div className="wrap">
        <div className="eventos-head">
          <div>
            <div className="eyebrow reveal">06 — Eventos</div>
            <h2 className="section-title reveal" data-split>
              Casamientos, fiestas y encuentros de campo.
            </h2>
          </div>
          <div className="eventos-note reveal">
            <p>
              Abrimos el parque, el quincho y la mesa larga para celebraciones de hasta doscientas
              personas. Fuego, fardos, flores de la huerta y una carta escrita para ese día.
            </p>
            <LinkArrow href="/#visita">Consultar por un evento</LinkArrow>
          </div>
        </div>

        <div className="mosaic" data-stagger>
          {TILES.map((tile) => (
            <Photo
              key={tile.photo}
              photo={tile.photo}
              alt={tile.alt}
              tag={tile.tag}
              className="mosaic-item reveal"
              sizes="(max-width: 860px) 92vw, 32vw"
              style={{ aspectRatio: photoRatio(tile.photo) }}
              reveal
              lightbox
            />
          ))}
        </div>
      </div>
    </section>
  );
}
