import { Photo } from "./Photo";
import type { PhotoKey } from "@/lib/photos";

const ETAPAS: { num: string; title: string; text: string; photo: PhotoKey; alt: string }[] = [
  {
    num: "01",
    title: "Semillero",
    text: "Semillas de estación en bandeja, al reparo del invernáculo hasta que germinan.",
    photo: "huerta/23",
    alt: "Plantines recién germinados en bandejas de semillero",
  },
  {
    num: "02",
    title: "Trasplante",
    text: "El plantín sale al cantero, sobre suelo compostado y cubierto con mulch.",
    photo: "huerta/25",
    alt: "Pak choi en hilera sobre tierra recién regada",
  },
  {
    num: "03",
    title: "Cosecha",
    text: "Se corta a diario, temprano, sólo lo que va a usarse ese día en la cocina.",
    photo: "huerta/16",
    alt: "Trabajador de la huerta cosechando entre las hileras",
  },
  {
    num: "04",
    title: "Bosque frutal",
    text: "Cítricos y frutales que estiran la temporada cuando el cantero descansa.",
    photo: "huerta/12",
    alt: "Naranja madura colgando de la rama del naranjo",
  },
];

export function HuertaTemporada() {
  return (
    <section className="process" id="temporada">
      <div className="wrap">
        <div className="eyebrow">De la semilla al plato</div>
        <div className="process-track">
          <div className="process-line"></div>
          {ETAPAS.map((etapa) => (
            <div className="stage reveal" key={etapa.num}>
              <div className="num">{etapa.num}</div>
              <Photo
                photo={etapa.photo}
                alt={etapa.alt}
                className="stage-photo"
                sizes="(max-width: 860px) 44vw, 22vw"
                reveal
              />
              <h3>{etapa.title}</h3>
              <p>{etapa.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
