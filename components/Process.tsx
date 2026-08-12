import { Photo } from "./Photo";
import type { PhotoKey } from "@/lib/photos";

const STAGES: { num: string; title: string; text: string; photo: PhotoKey; alt: string }[] = [
  {
    num: "01",
    title: "Siembra",
    text: "Huerta e invernáculos propios, semillas de estación, sin agroquímicos.",
    photo: "huerta/23",
    alt: "Plantines recién germinados en bandejas de semillero",
  },
  {
    num: "02",
    title: "Cosecha",
    text: "Recolección diaria. Lo que no se sirve en el restaurant, se conserva.",
    photo: "huerta/5",
    alt: "Carro con pimientos recién cosechados en la huerta",
  },
  {
    num: "03",
    title: "Cocina",
    text: "Carta que cambia cada semana según lo que ofrece el campo.",
    photo: "restaurant/12",
    alt: "Sartén de hierro con verduras asadas sobre las brasas",
  },
  {
    num: "04",
    title: "Mesa",
    text: "De nariz a cola, con proporción vegetal y uso racional de proteína animal.",
    photo: "restaurant/10",
    alt: "Mesa puesta vista desde arriba con la carta del día y flores del campo",
  },
];

export function Process() {
  return (
    <section className="process">
      <div className="wrap">
        <div className="eyebrow">El recorrido</div>
        <div className="process-track" id="processTrack">
          <div className="process-line" id="processLine"></div>
          {STAGES.map((stage) => (
            <div className="stage reveal" key={stage.num}>
              <div className="num">{stage.num}</div>
              <Photo
                photo={stage.photo}
                alt={stage.alt}
                className="stage-photo"
                sizes="(max-width: 860px) 44vw, 22vw"
                reveal
              />
              <h3>{stage.title}</h3>
              <p>{stage.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
