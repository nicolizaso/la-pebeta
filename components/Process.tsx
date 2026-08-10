const STAGES = [
  {
    num: "01",
    title: "Siembra",
    text: "Huerta e invernáculos propios, semillas de estación, sin agroquímicos.",
  },
  {
    num: "02",
    title: "Cosecha",
    text: "Recolección diaria. Lo que no se sirve en el restaurant, se conserva.",
  },
  {
    num: "03",
    title: "Cocina",
    text: "Carta que cambia cada semana según lo que ofrece el campo.",
  },
  {
    num: "04",
    title: "Mesa",
    text: "De nariz a cola, con proporción vegetal y uso racional de proteína animal.",
  },
];

export function Process() {
  return (
    <section className="process">
      <div className="wrap">
        <div className="eyebrow">El recorrido</div>
        <div className="process-track" id="processTrack">
          <div className="process-line" id="processLine"></div>
          {STAGES.map((stage) => (
            <div className="stage reveal" key={stage.num}>
              <div className="num">{stage.num}</div>
              <h3>{stage.title}</h3>
              <p>{stage.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
