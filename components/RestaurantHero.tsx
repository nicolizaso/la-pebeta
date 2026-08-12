import { Photo } from "./Photo";

export function RestaurantHero() {
  return (
    <section className="hero">
      <Photo
        photo="restaurant/9"
        alt="Puertas abiertas del restaurant entre la vegetación del parque"
        tag="Jue a dom, 12 a 16 hs — Los Cardales"
        sizes="100vw"
        priority
        scrim
        position="center 48%"
      />
      <div className="hero-inner">
        <div className="stamp">
          <span className="dot"></span> Restaurant · Km 0
        </div>
        <h1 className="hero-title">
          <span className="hero-line">
            <span>De la tierra al plato,</span>
          </span>
          <span className="hero-line">
            <span>
              <em>de nariz a cola.</em>
            </span>
          </span>
        </h1>
        <p className="hero-sub">
          Cocinamos al mismo ritmo que la huerta: carta que cambia cada semana, con numerosos
          platos gluten free y opciones aptas para veganos.
        </p>
      </div>
      <div className="scroll-cue">
        <div className="bar"></div> Desplazar
      </div>
    </section>
  );
}
