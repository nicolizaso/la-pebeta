const FEATURES = [
  {
    num: "01",
    title: "Carta semanal",
    text: "Cambia cada semana según lo que ofrece la huerta en ese momento.",
  },
  {
    num: "02",
    title: "Recolección",
    text: "Verduras y frutas cosechadas a diario, del bosque a la cocina.",
  },
  {
    num: "03",
    title: "Carnes de pastura",
    text: "Animales criados a pastoreo, con uso racional de proteína animal.",
  },
  {
    num: "04",
    title: "Veganas y sin TACC",
    text: "Numerosos platos gluten free y opciones aptas para veganos.",
  },
];

export function CartaFeatures() {
  return (
    <section className="process" id="carta">
      <div className="wrap">
        <div className="eyebrow">Nuestra carta</div>
        <div className="process-track">
          <div className="process-line"></div>
          {FEATURES.map((f) => (
            <div className="stage reveal" key={f.num}>
              <div className="num">{f.num}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
