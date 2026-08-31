import { Photo } from "./Photo";

export function PaseosIntro() {
  return (
    <section className="intro">
      <div className="wrap">
        <div className="kicker">
          <div className="eyebrow">El paseo</div>
          <Photo
            photo="paseos/17"
            alt="Grupo de visitantes caminando por el camino de la granja"
            tag="Grupos de hasta 15 personas"
            className="intro-photo"
            sizes="(max-width: 860px) 92vw, 30vw"
            reveal
            parallax
          />
        </div>
        <p className="lede reveal">
          Ver de dónde sale la comida cambia la manera de comerla. El paseo abre la producción: se
          entra a los invernáculos, se cruza el monte y se termina donde ponen las gallinas.
        </p>
      </div>
    </section>
  );
}
