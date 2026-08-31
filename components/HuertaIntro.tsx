import { Photo } from "./Photo";

export function HuertaIntro() {
  return (
    <section className="intro">
      <div className="wrap">
        <div className="kicker">
          <div className="eyebrow">La huerta</div>
          <Photo
            photo="huerta/17"
            alt="Lechugas verdes apretadas creciendo en el cantero"
            tag="Hoja verde todo el año"
            className="intro-photo"
            sizes="(max-width: 860px) 92vw, 30vw"
            reveal
            parallax
          />
        </div>
        <p className="lede reveal">
          La huerta no le responde a una carta: la carta le responde a la huerta. Sembramos de
          estación, cosechamos todos los días y cocinamos exactamente lo que la tierra da esa
          semana.
        </p>
      </div>
    </section>
  );
}
