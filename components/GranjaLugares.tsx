import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";
import { photoRatio, type PhotoEntry } from "@/lib/photos";

const TILES: PhotoEntry[] = [
  { photo: "granja/5", alt: "Frente de ladrillo de La Pebeta con una escultura sobre el césped", tag: "El casco" },
  { photo: "granja/8", alt: "Patio de ladrillo con sillones bajo la estructura metálica", tag: "Galería" },
  { photo: "granja/3", alt: "Galpón y canteros de la granja bajo el cielo abierto", tag: "Galpón y canteros" },
  { photo: "huerta/1", alt: "Trabajador empujando una carretilla junto al invernáculo", tag: "Invernáculo" },
  { photo: "paseos/11", alt: "Gallinas coloradas detrás del tejido del gallinero", tag: "Gallineros" },
  { photo: "paseos/6", alt: "Vaca Hereford pastando entre los árboles del monte", tag: "Monte" },
];

export function GranjaLugares() {
  return (
    <section className="eventos" id="lugares">
      <div className="wrap">
        <div className="eventos-head">
          <div>
            <div className="eyebrow reveal">Los lugares</div>
            <h2 className="section-title reveal" data-split>
              Un recorrido por el campo, de punta a punta.
            </h2>
          </div>
          <div className="eventos-note reveal">
            <p>
              Del casco a los gallineros hay un rato de caminata: invernáculos, canteros, monte y
              espejos de agua, todo dentro del mismo predio.
            </p>
            <LinkArrow href="/reservas?tipo=paseos">Reservar un paseo</LinkArrow>
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
