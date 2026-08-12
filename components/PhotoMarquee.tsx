import { Photo } from "./Photo";
import { photoRatio, type PhotoEntry } from "@/lib/photos";

const ROW_A: PhotoEntry[] = [
  { photo: "huerta/17", alt: "Lechugas mantecosas abiertas al sol en el cantero", tag: "Lechuga" },
  { photo: "paseos/13", alt: "Novillo Hereford mirando a cámara en el pastizal", tag: "Hereford" },
  { photo: "restaurant/12", alt: "Sartén de hierro con verduras asadas al fuego", tag: "Cocina" },
  { photo: "huerta/18", alt: "Acelga de penca roja creciendo sobre mulch de paja", tag: "Acelga" },
  { photo: "proveeduria/1", alt: "Maples de huevos recién juntados en la proveeduría", tag: "Huevos" },
  { photo: "eventos/1", alt: "Cocinero atendiendo una olla de hierro sobre el fuego", tag: "Fuego" },
];

const ROW_B: PhotoEntry[] = [
  { photo: "huerta/19", alt: "Hileras de lechuga morada bajo riego por goteo", tag: "Hojas" },
  { photo: "paseos/10", alt: "Gallinas coloradas comiendo del comedero", tag: "Gallinero" },
  { photo: "restaurant/1", alt: "Sándwich de la casa con batatas fritas", tag: "Carta" },
  { photo: "huerta/24", alt: "Cajón de madera con naranjas y mandarinas cosechadas", tag: "Cítricos" },
  { photo: "paseos/14", alt: "Cerdo de campo caminando por el barro", tag: "Chanchos" },
  { photo: "huerta/23", alt: "Plantines de espinaca recién germinados en el semillero", tag: "Semillero" },
];

function Row({ items, reverse = false }: { items: PhotoEntry[]; reverse?: boolean }) {
  // Two identical groups sit side by side so the GSAP loop can hand off
  // seamlessly at -50% without a visible seam.
  const group = (ariaHidden: boolean) => (
    <div className="marquee-group" aria-hidden={ariaHidden || undefined}>
      {items.map((item) => (
        <Photo
          key={`${item.photo}-${ariaHidden}`}
          photo={item.photo}
          alt={ariaHidden ? "" : item.alt}
          tag={item.tag}
          className="marquee-item"
          sizes="(max-width: 860px) 40vw, 22vw"
          style={{ aspectRatio: photoRatio(item.photo) }}
        />
      ))}
    </div>
  );

  return (
    <div className="marquee-viewport">
      <div className="marquee" data-marquee={reverse ? "reverse" : "forward"}>
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}

/**
 * Full-bleed double band of photos drifting in opposite directions — the
 * "todo junto" moment between the intro and the recorrido.
 */
export function PhotoMarquee() {
  return (
    <section className="strip" aria-label="Galería de La Pebeta">
      <Row items={ROW_A} />
      <Row items={ROW_B} reverse />
    </section>
  );
}
