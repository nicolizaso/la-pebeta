import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";
import { photoRatio, type PhotoEntry } from "@/lib/photos";

const TILES: PhotoEntry[] = [
  { photo: "huerta/5", alt: "Carretilla cargada de pimientos recién cosechados", tag: "Pimientos" },
  { photo: "huerta/21", alt: "Morrón verde colgando de la planta entre las hojas", tag: "Morrón" },
  { photo: "huerta/24", alt: "Cajón de madera lleno de naranjas recién juntadas", tag: "Cítricos" },
  { photo: "huerta/10", alt: "Zapallito creciendo entre las hojas sobre el mulch", tag: "Zapallito" },
  { photo: "huerta/18", alt: "Acelga de penca roja entre el mulch de paja", tag: "Acelga" },
  { photo: "huerta/11", alt: "Cítrico maduro entre las hojas del árbol", tag: "Bosque frutal" },
];

/** Lo que salió de los canteros: una grilla escalonada que se abre a pantalla completa. */
export function HuertaCosecha() {
  return (
    <section className="eventos" id="cosecha">
      <div className="wrap">
        <div className="eventos-head">
          <div>
            <div className="eyebrow reveal">La cosecha</div>
            <h2 className="section-title reveal" data-split>
              Lo que hoy está en la tierra.
            </h2>
          </div>
          <div className="eventos-note reveal">
            <p>
              Lo que no se sirve en el restaurant se conserva o pasa a la proveeduría: verdura de la
              semana, huevos de la granja y conservas de la casa.
            </p>
            <LinkArrow href="/tienda">Ir a la tienda</LinkArrow>
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
