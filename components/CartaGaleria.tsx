import { Photo } from "./Photo";
import { photoRatio, type PhotoEntry } from "@/lib/photos";

const PLATOS: PhotoEntry[] = [
  { photo: "restaurant/7", alt: "Vista superior de varios platos servidos sobre la mesa de madera", tag: "Para compartir" },
  { photo: "restaurant/6", alt: "Postre esférico de durazno sobre crocante de semillas", tag: "Postre de estación" },
  { photo: "restaurant/2", alt: "Focaccia de la casa rellena, cortada en porciones sobre tabla", tag: "Focaccia" },
  { photo: "restaurant/13", alt: "Huevos de campo cocidos en salsa de tomate en sartén de hierro", tag: "Huevos de la granja" },
  { photo: "restaurant/4", alt: "Burrata con frutas y nueces sobre plato celeste", tag: "Entrada" },
  { photo: "restaurant/11", alt: "Ají relleno gratinado sobre plato blanco", tag: "Vegetariano" },
  { photo: "restaurant/5", alt: "Bandeja de ñoquis caseros recién formados", tag: "Pastas del día" },
  { photo: "restaurant/3", alt: "Postre de dulce de leche con burrata y frutos rojos", tag: "Dulce" },
  { photo: "restaurant/1", alt: "Sándwich de la casa con batatas fritas crocantes", tag: "Km 0" },
];

/**
 * The dishes themselves — a staggered grid that lifts on hover and opens
 * full-screen on click.
 */
export function CartaGaleria() {
  return (
    <section className="platos" id="platos">
      <div className="wrap">
        <div className="eyebrow reveal">Los platos</div>
        <h2 className="section-title reveal" data-split style={{ maxWidth: "20ch" }}>
          Lo que salió de la cocina esta temporada.
        </h2>
        <div className="platos-grid" data-stagger>
          {PLATOS.map((plato) => (
            <Photo
              key={plato.photo}
              photo={plato.photo}
              alt={plato.alt}
              tag={plato.tag}
              className="plato reveal"
              sizes="(max-width: 860px) 92vw, 30vw"
              style={{ aspectRatio: photoRatio(plato.photo) }}
              reveal
              lightbox
            />
          ))}
        </div>
      </div>
    </section>
  );
}
