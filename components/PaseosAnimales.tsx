import { Photo } from "./Photo";
import type { PhotoKey } from "@/lib/photos";

const ANIMALES: { num: string; title: string; text: string; photo: PhotoKey; alt: string }[] = [
  {
    num: "01",
    title: "Vacas de pastoreo",
    text: "Rodeo Hereford que rota por las parcelas y ayuda a capturar carbono del ambiente.",
    photo: "paseos/3",
    alt: "Rodeo Hereford pastando bajo el cielo abierto",
  },
  {
    num: "02",
    title: "Majada",
    text: "Las ovejas emparejan el pastizal y abren camino donde la vaca no llega.",
    photo: "paseos/9",
    alt: "Majada de ovejas pastando en el campo abierto",
  },
  {
    num: "03",
    title: "Chanchos",
    text: "A campo, hozando la tierra: remueven el suelo antes de que entre el cultivo.",
    photo: "paseos/15",
    alt: "Chancho negro y blanco caminando sobre la tierra",
  },
  {
    num: "04",
    title: "Gallinas ponedoras",
    text: "Sueltas entre el pastizal y el monte. De ahí salen los huevos de la proveeduría.",
    photo: "paseos/7",
    alt: "Gallina colorada entre el follaje del monte",
  },
];

export function PaseosAnimales() {
  return (
    <section className="process" id="animales">
      <div className="wrap">
        <div className="eyebrow">Quiénes viven acá</div>
        <div className="process-track">
          <div className="process-line"></div>
          {ANIMALES.map((animal) => (
            <div className="stage reveal" key={animal.num}>
              <div className="num">{animal.num}</div>
              <Photo
                photo={animal.photo}
                alt={animal.alt}
                className="stage-photo"
                sizes="(max-width: 860px) 44vw, 22vw"
                reveal
              />
              <h3>{animal.title}</h3>
              <p>{animal.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
