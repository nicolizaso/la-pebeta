import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";

export function RestaurantEthos() {
  return (
    <section className="feature" id="km0">
      <div className="wrap">
        <div className="media-stack">
          <Photo
            photo="restaurant/12"
            alt="Sartén de hierro con verduras y papas asadas sobre las brasas"
            className="media"
            tag="Cocina — de nariz a cola"
            sizes="(max-width: 860px) 92vw, 46vw"
            reveal
            parallax
            lightbox
          />
          <Photo
            photo="restaurant/8"
            alt="Mesa del salón servida junto a la ventana, con copas y luz de la tarde"
            className="media-inset"
            sizes="(max-width: 860px) 40vw, 20vw"
            reveal
            lightbox
          />
        </div>
        <div className="copy">
          <div className="eyebrow reveal">Km 0</div>
          <h2 className="section-title reveal" data-split>
            De la tierra al plato, auténticamente.
          </h2>
          <p className="body reveal">
            Nuestra carta cambia cada semana: cada producto e ingrediente que llega a la mesa tuvo
            sentido antes de estar ahí. Cultivamos y criamos de manera consciente, con la voluntad
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
          <LinkArrow href="/#visita">Reservar mesa</LinkArrow>
        </div>
      </div>
    </section>
  );
}
