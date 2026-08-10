import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";

export function GranjaSection() {
  return (
    <section className="feature reverse" id="granja">
      <div className="wrap">
        <div className="copy">
          <div className="eyebrow reveal">02 — Granja</div>
          <h2 className="section-title reveal">Vivimos en comunidad con animales y plantas.</h2>
          <p className="body reveal">
            En nuestros bosques y espejos de agua conviven microorganismos, hongos, abejas que
            polinizan, aves y animales de pastoreo que ayudan a capturar carbono del ambiente. El
            diseño de nuestro territorio está pensado desde la permacultura.
          </p>
          <LinkArrow href="#">Conocer la granja</LinkArrow>
        </div>
        <div className="granja-gallery">
          <Photo className="reveal" tag="Huerta Este" />
          <Photo variant="clay" className="reveal" tag="Rebaño" />
          <Photo className="reveal" tag="Colmenar" />
        </div>
      </div>
    </section>
  );
}
