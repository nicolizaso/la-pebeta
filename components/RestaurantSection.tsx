import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";

export function RestaurantSection() {
  return (
    <section className="feature" id="restaurant">
      <div className="wrap">
        <div className="media-stack">
          <Photo
            photo="restaurant/7"
            alt="Mesa de madera vista desde arriba con varios platos de la carta servidos"
            className="media"
            tag="Restaurant — jue a dom, 12 a 16 hs"
            sizes="(max-width: 860px) 92vw, 46vw"
            reveal
            parallax
            lightbox
          />
          <Photo
            photo="restaurant/8"
            alt="Salón del restaurant con la mesa puesta y copas junto a la ventana"
            className="media-inset"
            sizes="(max-width: 860px) 40vw, 20vw"
            reveal
            lightbox
          />
        </div>
        <div className="copy">
          <div className="eyebrow reveal">01 — Restaurant</div>
          <h2 className="section-title reveal" data-split>
            La verdadera experiencia de kilómetro cero.
          </h2>
          <p className="body reveal">
            Cultivamos y criamos de manera consciente. La carta se piensa desde la huerta hacia
            afuera, con numerosos platos gluten free y opciones aptas para veganos, y la voluntad
            de no producir residuo orgánico.
          </p>
          <div className="stat-row reveal">
            <div className="stat">
              <div className="n" data-count="7">
                7
              </div>
              <div className="l">Días de recolección</div>
            </div>
            <div className="stat">
              <div className="n" data-count="0">
                0
              </div>
              <div className="l">Residuo orgánico</div>
            </div>
            <div className="stat">
              <div className="n" data-count="10" data-count-prefix="+">
                +10
              </div>
              <div className="l">Años de proyecto</div>
            </div>
          </div>
          <LinkArrow href="/restaurant">Ver la carta</LinkArrow>
        </div>
      </div>
    </section>
  );
}
