import { Photo } from "./Photo";

export function Hero() {
  return (
    <section className="hero">
      <Photo variant="clay" tag="04·29 — CAMPO NORTE, LOS CARDALES" />
      <div className="hero-inner">
        <div className="stamp">
          <span className="dot"></span> Km 0 · Los Cardales, Bs. As.
        </div>
        <h1 className="hero-title">
          <span className="hero-line">
            <span>De la tierra</span>
          </span>
          <span className="hero-line">
            <span>
              <em>a la mesa.</em>
            </span>
          </span>
        </h1>
        <p className="hero-sub">
          Restaurant, granja agroecológica y proveeduría a 70 minutos de Buenos Aires. Todo lo que
          servimos, antes fue sembrado por nosotros.
        </p>
      </div>
      <div className="scroll-cue">
        <div className="bar"></div> Desplazar
      </div>
    </section>
  );
}
