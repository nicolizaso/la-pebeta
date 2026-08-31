import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";

export function HuertaManejo() {
  return (
    <section className="feature" id="manejo">
      <div className="wrap">
        <div className="media-stack">
          <Photo
            photo="huerta/13"
            alt="Canteros de hoja bajo el riego, con una persona cosechando al fondo"
            className="media"
            tag="Riego por goteo y aspersión"
            sizes="(max-width: 860px) 92vw, 46vw"
            reveal
            parallax
            lightbox
          />
          <Photo
            photo="huerta/9"
            alt="Berenjena blanca colgando de la planta"
            className="media-inset"
            sizes="(max-width: 860px) 40vw, 20vw"
            reveal
            lightbox
          />
        </div>
        <div className="copy">
          <div className="eyebrow reveal">Cómo se trabaja</div>
          <h2 className="section-title reveal" data-split>
            Sin agroquímicos, con la tierra siempre cubierta.
          </h2>
          <p className="body reveal">
            Rotamos los cultivos cantero por cantero, asociamos especies que se cuidan entre sí y
            dejamos el suelo tapado con mulch para que no pierda agua ni vida. Las plantas arrancan
            en la plantinera y salen al aire libre cuando están listas.
          </p>
          <div className="stat-row reveal">
            <div className="stat">
              <div className="n" data-count="25">
                25
              </div>
              <div className="l">Canteros</div>
            </div>
            <div className="stat">
              <div className="n" data-count="2">
                2
              </div>
              <div className="l">Invernáculos</div>
            </div>
            <div className="stat">
              <div className="n" data-count="300">
                300
              </div>
              <div className="l">Metros hasta la cocina</div>
            </div>
          </div>
          <LinkArrow href="/restaurant">Ver la carta</LinkArrow>
        </div>
      </div>
    </section>
  );
}
