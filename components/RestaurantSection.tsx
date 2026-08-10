import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";

export function RestaurantSection() {
  return (
    <section className="feature" id="restaurant">
      <div className="wrap">
        <Photo className="media reveal" tag="Restaurant — jue a dom, 12 a 16 hs" />
        <div className="copy">
          <div className="eyebrow reveal">01 — Restaurant</div>
          <h2 className="section-title reveal">La verdadera experiencia de kilómetro cero.</h2>
          <p className="body reveal">
            Cultivamos y criamos de manera consciente. La carta se piensa desde la huerta hacia
            afuera, con numerosos platos gluten free y opciones aptas para veganos, y la voluntad
            de no producir residuo orgánico.
          </p>
          <div className="stat-row reveal">
            <div className="stat">
              <div className="n">7</div>
              <div className="l">Días de recolección</div>
            </div>
            <div className="stat">
              <div className="n">0</div>
              <div className="l">Residuo orgánico</div>
            </div>
            <div className="stat">
              <div className="n">+10</div>
              <div className="l">Años de proyecto</div>
            </div>
          </div>
          <LinkArrow href="#">Ver la carta</LinkArrow>
        </div>
      </div>
    </section>
  );
}
