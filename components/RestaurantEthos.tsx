import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";

export function RestaurantEthos() {
  return (
    <section className="feature" id="km0">
      <div className="wrap">
        <Photo className="media reveal" tag="Cocina — de nariz a cola" />
        <div className="copy">
          <div className="eyebrow reveal">Km 0</div>
          <h2 className="section-title reveal">De la tierra al plato, auténticamente.</h2>
          <p className="body reveal">
            Nuestra carta cambia cada semana: cada producto e ingrediente que llega a la mesa tuvo
            sentido antes de estar ahí. Cultivamos y criamos de manera consciente, con la voluntad
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
          <LinkArrow href="/#visita">Reservar mesa</LinkArrow>
        </div>
      </div>
    </section>
  );
}
