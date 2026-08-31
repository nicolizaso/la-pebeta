import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";
import { PASEOS } from "@/lib/paseos";

/**
 * Los dos paseos, uno debajo del otro: la huerta primero —que es por
 * donde empiezan los dos— y después el recorrido productivo, que lo continúa.
 *
 * Cada una trae su ficha de datos clave, que es lo que la gente viene a buscar:
 * qué días, cuánto dura, cuánto sale y con qué se encuentra al terminar.
 */
export function PaseosDetalle() {
  return (
    <>
      {PASEOS.map((paseo, i) => (
        <section
          className={`feature paseo-detalle${i % 2 ? " reverse" : ""}`}
          id={paseo.id}
          key={paseo.id}
        >
          <div className="wrap">
            <div className="copy">
              <div className="eyebrow reveal">{paseo.eyebrow}</div>
              <h2 className="section-title reveal" data-split>
                {paseo.nombre}
              </h2>
              <p className="paseo-claim reveal">{paseo.claim}</p>
              {paseo.descripcion.map((parrafo) => (
                <p className="body reveal" key={parrafo}>
                  {parrafo}
                </p>
              ))}
              <ul className="info-list reveal">
                {paseo.ficha.map((dato) => (
                  <li key={dato.k}>
                    <span className="k">{dato.k}</span>
                    <span className="v">{dato.v}</span>
                  </li>
                ))}
              </ul>
              <LinkArrow href="/reservas?tipo=paseos">Reservar este paseo</LinkArrow>
            </div>
            <div className="media-stack">
              <Photo
                photo={paseo.foto}
                alt={paseo.fotoAlt}
                className="media"
                tag={paseo.fotoTag}
                sizes="(max-width: 860px) 92vw, 46vw"
                reveal
                parallax
                lightbox
              />
              <Photo
                photo={paseo.fotoChica}
                alt={paseo.fotoChicaAlt}
                className="media-inset"
                sizes="(max-width: 860px) 40vw, 20vw"
                reveal
                lightbox
              />
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
