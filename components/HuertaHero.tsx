import { Photo } from "./Photo";

export function HuertaHero() {
  return (
    <section className="hero">
      <Photo
        photo="huerta/14"
        alt="Hileras de la huerta bajo el riego, con un arcoíris entre los aspersores"
        tag="Veinticinco canteros — Los Cardales"
        sizes="100vw"
        priority
        scrim
        position="center 60%"
      />
      <div className="hero-inner">
        <div className="stamp">
          <span className="dot"></span> Huerta · Km 0
        </div>
        <h1 className="hero-title">
          <span className="hero-line">
            <span>Todo empieza</span>
          </span>
          <span className="hero-line">
            <span>
              <em>en la tierra.</em>
            </span>
          </span>
        </h1>
        <p className="hero-sub">
          Veinticinco canteros, dos invernáculos y un bosque frutal en producción todo el año. Nada
          viaja más de trescientos metros hasta la cocina.
        </p>
      </div>
      <div className="scroll-cue">
        <div className="bar"></div> Desplazar
      </div>
    </section>
  );
}
