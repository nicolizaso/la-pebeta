import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";
import { WHATSAPP } from "@/lib/contacto";
import { DIAS_TEXTO, HORA_SALIDA } from "@/lib/experiencias";

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
            La reserva previa es lo único imprescindible.
          </h2>
          <p className="body reveal">
            Las dos experiencias salen {DIAS_TEXTO.toLowerCase()} a las {HORA_SALIDA} hs, y las dos
            terminan con tu mesa lista para almorzar sin esperas. Contanos cuál elegís al reservar,
            o consultanos por{" "}
            <a href={WHATSAPP} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            .
          </p>
          <LinkArrow href="/reservas?tipo=paseos">Reservar una experiencia</LinkArrow>
        </div>
        <Photo
          photo="paseos/12"
          alt="Rodeo de vacas y terneros apiñados junto al alambrado"
          className="band-card reveal"
          tag="Con reserva previa"
          sizes="(max-width: 860px) 80vw, 30vw"
          reveal
          lightbox
        />
      </div>
    </section>
  );
}
