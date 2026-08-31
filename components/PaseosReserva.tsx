import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";

/** El cierre de la página: la banda a sangre completa que lleva a la reserva. */
export function PaseosReserva() {
  return (
    <section className="band" id="reservar">
      <Photo
        photo="paseos/4"
        alt="Vacas pastando en el campo abierto, una de ellas overa negra y blanca"
        className="band-bg"
        sizes="100vw"
        parallax
        scrim
        position="center 72%"
      />
      <div className="wrap band-inner">
        <div className="band-copy">
          <div className="eyebrow reveal">Reservar</div>
          <h2 className="section-title reveal" data-split>
            Un paseo a la mañana y el almuerzo después.
          </h2>
          <p className="body reveal">
            El paseo sale a las 11 hs y el restaurant abre a las 12: se puede hacer todo el mismo
            día. La mesa se reserva aparte, para elegir a qué hora sentarse.
          </p>
          <LinkArrow href="/reservas?tipo=paseos">Reservar un paseo</LinkArrow>
        </div>
        <Photo
          photo="paseos/12"
          alt="Rodeo de vacas y terneros apiñados junto al alambrado"
          className="band-card reveal"
          tag="Grupos de hasta 15 personas"
          sizes="(max-width: 860px) 80vw, 30vw"
          reveal
          lightbox
        />
      </div>
    </section>
  );
}
