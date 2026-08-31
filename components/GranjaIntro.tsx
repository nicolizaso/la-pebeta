import { Photo } from "./Photo";

export function GranjaIntro() {
  return (
    <section className="intro">
      <div className="wrap">
        <div className="kicker">
          <div className="eyebrow">La granja</div>
          <Photo
            photo="granja/9"
            alt="Camino de tierra que lleva a los galpones de la granja entre las casuarinas"
            tag="Camino a los galpones"
            className="intro-photo"
            sizes="(max-width: 860px) 92vw, 30vw"
            reveal
            parallax
          />
        </div>
        <p className="lede reveal">
          Vivimos en comunidad con animales y plantas. En nuestros bosques y espejos de agua
          conviven microorganismos, hongos, abejas que polinizan, aves y animales de pastoreo que
          ayudan a capturar carbono del ambiente.
        </p>
      </div>
    </section>
  );
}
