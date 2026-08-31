import { Photo } from "./Photo";

export function PaseosIntro() {
  return (
    <section className="intro">
      <div className="wrap">
        <div className="kicker">
          <div className="eyebrow">Las experiencias</div>
          <Photo
            photo="paseos/17"
            alt="Grupo de visitantes caminando por el camino de la granja"
            tag="Con reserva previa"
            className="intro-photo"
            sizes="(max-width: 860px) 92vw, 30vw"
            reveal
            parallax
          />
        </div>
        <p className="lede reveal">
          Ver de dónde sale la comida cambia la manera de comerla. Las dos experiencias arrancan en
          la huerta: una se queda ahí, entre los canteros y los frutales, y la otra sigue hasta los
          espacios productivos, donde viven los animales.
        </p>
      </div>
    </section>
  );
}
