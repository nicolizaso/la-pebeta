import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";

const STEPS = [
  "Te esperamos a las 11 hs en La Pebeta, con una bebida caliente.",
  "Trasladamos hasta el centro de producción: huerta e invernáculo.",
  "Recorrido guiado por la preparación del suelo, el semillero, la cosecha y la alimentación de los animales.",
  "Cerramos la visita en los gallineros, antes de volver a la mesa.",
];

export function HuertaPrograma() {
  return (
    <section className="feature reverse" id="programa">
      <div className="wrap">
        <div className="copy">
          <div className="eyebrow reveal">Visita a la huerta</div>
          <h2 className="section-title reveal">Antes de comer, caminá la huerta.</h2>
          <p className="body reveal">
            Los fines de semana abrimos la producción antes del almuerzo: un recorrido guiado que
            termina en la mesa del restaurant.
          </p>
          <ol className="steps">
            {STEPS.map((step, i) => (
              <li className="reveal" key={step}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
          <LinkArrow href="/#visita">Reservar visita</LinkArrow>
        </div>
        <Photo variant="clay" className="media reveal" tag="Huerta — programa de visita" />
      </div>
    </section>
  );
}
