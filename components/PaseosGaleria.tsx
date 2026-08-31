import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";
import { photoRatio, type PhotoEntry } from "@/lib/photos";

const TILES: PhotoEntry[] = [
  { photo: "paseos/1", alt: "Pollitos blancos descansando sobre la viruta del galpón", tag: "Galpón" },
  { photo: "paseos/10", alt: "Gallinas coloradas bebiendo del bebedero", tag: "Bebedero" },
  { photo: "paseos/2", alt: "Gallina colorada caminando entre el pastizal alto", tag: "A campo" },
  { photo: "paseos/8", alt: "Ternero Hereford pastando en el pasto verde", tag: "Pastoreo" },
  { photo: "paseos/14", alt: "Chancho parado sobre la tierra, mirando a cámara", tag: "Cerdos a campo" },
  { photo: "paseos/11", alt: "Gallinas coloradas detrás del tejido del gallinero", tag: "Gallineros" },
];

export function PaseosGaleria() {
  return (
    <section className="eventos" id="galeria">
      <div className="wrap">
        <div className="eventos-head">
          <div>
            <div className="eyebrow reveal">En el camino</div>
            <h2 className="section-title reveal" data-split>
              Lo que se ve entre la huerta y los gallineros.
            </h2>
          </div>
          <div className="eventos-note reveal">
            <p>
              El recorrido cambia con la estación: lo que está en cosecha, qué parcela están
              pastoreando los animales y cuánta agua trajo la semana.
            </p>
            <LinkArrow href="/granja">Conocer la granja</LinkArrow>
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
