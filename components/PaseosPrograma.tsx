import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";

const PASOS = [
  "Te esperamos a las 11 hs en La Pebeta, con una bebida caliente.",
  "Trasladamos hasta el centro de producción: huerta e invernáculo.",
  "Recorrido guiado por la preparación del suelo, el semillero, la cosecha y la alimentación de los animales.",
  "Cerramos la visita en los gallineros, antes de volver a la mesa.",
];

export function PaseosPrograma() {
  return (
    <section className="feature reverse" id="programa">
      <div className="wrap">
        <div className="copy">
          <div className="eyebrow reveal">El programa</div>
          <h2 className="section-title reveal" data-split>
            Sale a las 11 y termina en la mesa.
          </h2>
          <p className="body reveal">
            Los paseos salen jueves, viernes, sábados y domingos, en grupos de hasta quince
            personas. Conviene traer calzado cómodo: se camina por tierra y por pasto.
          </p>
          <ol className="steps">
            {PASOS.map((paso, i) => (
              <li className="reveal" key={paso}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <p>{paso}</p>
              </li>
            ))}
          </ol>
          <LinkArrow href="/reservas?tipo=paseos">Reservar un paseo</LinkArrow>
        </div>
        <div className="media-stack">
          <Photo
            photo="paseos/13"
            alt="Novillo Hereford mirando a cámara en el pastizal"
            className="media"
            tag="Rebaño Hereford"
            sizes="(max-width: 860px) 92vw, 46vw"
            reveal
            parallax
            lightbox
          />
          <Photo
            photo="paseos/5"
            alt="Bol de madera con huevos de campo recién juntados"
            className="media-inset"
            sizes="(max-width: 860px) 40vw, 20vw"
            reveal
            lightbox
          />
        </div>
      </div>
    </section>
  );
}
