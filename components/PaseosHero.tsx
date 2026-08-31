import { Photo } from "./Photo";

export function PaseosHero() {
  return (
    <section className="hero">
      <Photo
        photo="paseos/16"
        alt="Rodeo de vacas Hereford descansando a la sombra de los árboles"
        tag="Paseo guiado — 11 hs"
        sizes="100vw"
        priority
        scrim
        position="center 55%"
      />
      <div className="hero-inner">
        <div className="stamp">
          <span className="dot"></span> Paseos · Animales
        </div>
        <h1 className="hero-title">
          <span className="hero-line">
            <span>Caminá el campo</span>
          </span>
          <span className="hero-line">
            <span>
              <em>antes de comer.</em>
            </span>
          </span>
        </h1>
        <p className="hero-sub">
          Un recorrido guiado por la huerta, los canteros y los animales, que sale a la mañana y
          termina en los gallineros, justo antes del almuerzo.
        </p>
      </div>
      <div className="scroll-cue">
        <div className="bar"></div> Desplazar
      </div>
    </section>
  );
}
