import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";

export function GranjaEcosistema() {
  return (
    <section className="feature" id="ecosistema">
      <div className="wrap">
        <div className="media-stack">
          <Photo
            photo="granja/1"
            alt="Persona trabajando en un cantero cercado, con el monte detrás"
            className="media"
            tag="Manejo del suelo"
            sizes="(max-width: 860px) 92vw, 46vw"
            reveal
            parallax
            lightbox
          />
          <Photo
            photo="paseos/2"
            alt="Gallina colorada caminando entre el pastizal alto"
            className="media-inset"
            sizes="(max-width: 860px) 40vw, 20vw"
            reveal
            lightbox
          />
        </div>
        <div className="copy">
          <div className="eyebrow reveal">Un solo sistema</div>
          <h2 className="section-title reveal" data-split>
            Nada sale del campo, todo vuelve a la tierra.
          </h2>
          <p className="body reveal">
            El resto de la cocina vuelve al compost, el compost vuelve al cantero y el cantero
            vuelve a la mesa. Los animales pastorean donde hace falta y las plantas hacen el resto:
            no usamos agroquímicos en ninguna parte del recorrido.
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
          <LinkArrow href="/huerta">Ver la huerta</LinkArrow>
        </div>
      </div>
    </section>
  );
}
