import { Photo } from "./Photo";

const QUOTES = [
  {
    text: "Achicar la distancia entre la tierra y la mesa es el foco de nuestros esfuerzos.",
    who: "Km 0",
  },
  {
    text: "Aplicamos economía circular en cada proceso: materias primas, agua y residuos.",
    who: "Sustentabilidad",
  },
  {
    text: "Nuestra gente es nuestro mayor activo. Todos somos protagonistas del cambio.",
    who: "Comunidad",
  },
];

export function Valores() {
  return (
    <section className="valores">
      <Photo
        photo="granja/3"
        alt="Galpón y canteros de la granja bajo el cielo abierto"
        className="valores-bg"
        sizes="100vw"
        parallax
      />
      <div className="wrap">
        <div className="eyebrow reveal">Nuestros valores</div>
        <h2 className="section-title reveal" style={{ maxWidth: "16ch" }} data-split>
          Cada día, un paso más allá.
        </h2>
        <div className="quote-grid">
          {QUOTES.map((quote) => (
            <div className="quote reveal" key={quote.who}>
              <p>&ldquo;{quote.text}&rdquo;</p>
              <div className="who">{quote.who}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
