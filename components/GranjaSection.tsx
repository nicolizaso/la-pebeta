import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";

export function GranjaSection() {
  return (
    <section className="feature reverse" id="granja">
      <div className="wrap">
        <div className="copy">
          <div className="eyebrow reveal">02 — Granja</div>
          <h2 className="section-title reveal" data-split>
            Vivimos en comunidad con animales y plantas.
          </h2>
          <p className="body reveal">
            En nuestros bosques y espejos de agua conviven microorganismos, hongos, abejas que
            polinizan, aves y animales de pastoreo que ayudan a capturar carbono del ambiente. El
            diseño de nuestro territorio está pensado desde la permacultura.
          </p>
          <LinkArrow href="/#paseos">Conocer la granja</LinkArrow>
        </div>
        <div className="granja-gallery">
          <Photo
            photo="paseos/13"
            alt="Novillo Hereford mirando a cámara en el pastizal"
            className="reveal"
            tag="Rebaño Hereford"
            sizes="(max-width: 860px) 92vw, 26vw"
            reveal
            parallax
            lightbox
          />
          <Photo
            photo="granja/2"
            alt="Equipo de la granja preparando compost con carro y palas"
            className="reveal"
            tag="Compost — preparación de suelo"
            sizes="(max-width: 860px) 92vw, 20vw"
            reveal
            lightbox
          />
          <Photo
            photo="paseos/9"
            alt="Majada de ovejas pastando en el campo abierto"
            className="reveal"
            tag="Majada"
            sizes="(max-width: 860px) 92vw, 20vw"
            reveal
            lightbox
          />
        </div>
      </div>
    </section>
  );
}
