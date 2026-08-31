import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";

/** La banda a sangre completa que manda de la granja al paseo por el campo. */
export function GranjaAnimales() {
  return (
    <section className="band" id="animales">
      <Photo
        photo="paseos/12"
        alt="Rodeo de vacas y terneros apiñados junto al alambrado"
        className="band-bg"
        sizes="100vw"
        parallax
        scrim
        position="center 50%"
      />
      <div className="wrap band-inner">
        <div className="band-copy">
          <div className="eyebrow reveal">Los animales</div>
          <h2 className="section-title reveal" data-split>
            Vacas, ovejas, chanchos y gallinas ponedoras.
          </h2>
          <p className="body reveal">
            Todos a cielo abierto, con acceso al pastizal y al monte. De ahí salen los huevos de la
            proveeduría y las carnes de pastura que llegan a la carta del restaurant.
          </p>
          <LinkArrow href="/paseos">Conocer los paseos</LinkArrow>
        </div>
        <Photo
          photo="paseos/14"
          alt="Chancho parado sobre la tierra, mirando a cámara"
          className="band-card reveal"
          tag="Cerdos a campo"
          sizes="(max-width: 860px) 80vw, 30vw"
          reveal
          lightbox
        />
      </div>
    </section>
  );
}
