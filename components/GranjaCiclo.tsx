import { Photo } from "./Photo";
import type { PhotoKey } from "@/lib/photos";

const ETAPAS: { num: string; title: string; text: string; photo: PhotoKey; alt: string }[] = [
  {
    num: "01",
    title: "Compost",
    text: "Lo orgánico de la cocina y del campo se apila, se voltea y vuelve a ser tierra.",
    photo: "granja/2",
    alt: "Equipo de la granja preparando compost con carro y palas",
  },
  {
    num: "02",
    title: "Suelo vivo",
    text: "Ese compost va a los canteros, cubiertos con mulch para no dejar la tierra desnuda.",
    photo: "huerta/8",
    alt: "Trabajadora de la huerta plantando de rodillas entre los canteros",
  },
  {
    num: "03",
    title: "Pastoreo",
    text: "Los animales rotan por las parcelas: comen, fertilizan y siguen de largo.",
    photo: "paseos/8",
    alt: "Ternero Hereford pastando en el pasto verde",
  },
  {
    num: "04",
    title: "Bosque y agua",
    text: "Montes y espejos de agua ordenan el clima del campo y le dan sombra al rodeo.",
    photo: "paseos/16",
    alt: "Rodeo de vacas Hereford descansando a la sombra de los árboles",
  },
];

export function GranjaCiclo() {
  return (
    <section className="process" id="ciclo">
      <div className="wrap">
        <div className="eyebrow">El ciclo</div>
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
