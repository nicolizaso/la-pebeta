import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";
import { EXPERIENCIAS } from "@/lib/experiencias";

/**
 * Las dos experiencias, una debajo de la otra: la huerta primero —que es por
 * donde empiezan las dos— y después el recorrido productivo, que la continúa.
 *
 * Cada una trae su ficha de datos clave, que es lo que la gente viene a buscar:
 * qué días, cuánto dura, cuánto sale y con qué se encuentra al terminar.
 */
export function PaseosExperiencias() {
  return (
    <>
      {EXPERIENCIAS.map((exp, i) => (
        <section
          className={`feature experiencia${i % 2 ? " reverse" : ""}`}
          id={exp.id}
          key={exp.id}
        >
          <div className="wrap">
            <div className="copy">
              <div className="eyebrow reveal">{exp.eyebrow}</div>
              <h2 className="section-title reveal" data-split>
                {exp.nombre}
              </h2>
              <p className="experiencia-claim reveal">{exp.claim}</p>
              {exp.descripcion.map((parrafo) => (
                <p className="body reveal" key={parrafo}>
                  {parrafo}
                </p>
              ))}
              <ul className="info-list reveal">
                {exp.ficha.map((dato) => (
                  <li key={dato.k}>
                    <span className="k">{dato.k}</span>
                    <span className="v">{dato.v}</span>
                  </li>
                ))}
              </ul>
              <LinkArrow href="/reservas?tipo=paseos">Reservar esta experiencia</LinkArrow>
            </div>
            <div className="media-stack">
              <Photo
                photo={exp.foto}
                alt={exp.fotoAlt}
                className="media"
                tag={exp.fotoTag}
                sizes="(max-width: 860px) 92vw, 46vw"
                reveal
                parallax
                lightbox
              />
              <Photo
                photo={exp.fotoChica}
                alt={exp.fotoChicaAlt}
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
