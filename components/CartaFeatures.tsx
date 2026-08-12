import { Photo } from "./Photo";
import type { PhotoKey } from "@/lib/photos";

const FEATURES: { num: string; title: string; text: string; photo: PhotoKey; alt: string }[] = [
  {
    num: "01",
    title: "Carta semanal",
    text: "Cambia cada semana según lo que ofrece la huerta en ese momento.",
    photo: "restaurant/10",
    alt: "Carta del día sobre la mesa puesta, vista desde arriba",
  },
  {
    num: "02",
    title: "Recolección",
    text: "Verduras y frutas cosechadas a diario, del bosque a la cocina.",
    photo: "huerta/16",
    alt: "Trabajador de la huerta cosechando entre las hileras",
  },
  {
    num: "03",
    title: "Carnes de pastura",
    text: "Animales criados a pastoreo, con uso racional de proteína animal.",
    photo: "paseos/3",
    alt: "Vacas Hereford pastando en el campo abierto",
  },
  {
    num: "04",
    title: "Veganas y sin TACC",
    text: "Numerosos platos gluten free y opciones aptas para veganos.",
    photo: "restaurant/11",
    alt: "Ají relleno gratinado servido en plato blanco",
  },
];

export function CartaFeatures() {
  return (
    <section className="process" id="carta">
      <div className="wrap">
        <div className="eyebrow">Nuestra carta</div>
        <div className="process-track">
          <div className="process-line"></div>
          {FEATURES.map((f) => (
            <div className="stage reveal" key={f.num}>
              <div className="num">{f.num}</div>
              <Photo
                photo={f.photo}
                alt={f.alt}
                className="stage-photo"
                sizes="(max-width: 860px) 44vw, 22vw"
                reveal
              />
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
