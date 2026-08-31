import { Photo } from "./Photo";

export function GranjaHero() {
  return (
    <section className="hero">
      <Photo
        photo="granja/4"
        alt="Invernáculos de la granja vistos desde el parque, entre los árboles"
        tag="Campo norte — Los Cardales"
        sizes="100vw"
        priority
        scrim
        position="center 58%"
      />
      <div className="hero-inner">
        <div className="stamp">
          <span className="dot"></span> Granja · Agroecológica
        </div>
        <h1 className="hero-title">
          <span className="hero-line">
            <span>Bosques, agua</span>
          </span>
          <span className="hero-line">
            <span>
              <em>y animales.</em>
            </span>
          </span>
        </h1>
        <p className="hero-sub">
          El diseño de nuestro territorio está pensado desde la permacultura: cada especie cumple
          una función y los ciclos se cierran adentro del campo.
        </p>
      </div>
      <div className="scroll-cue">
        <div className="bar"></div> Desplazar
      </div>
    </section>
  );
}
