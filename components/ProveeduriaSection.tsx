import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";

export function ProveeduriaSection() {
  return (
    <section className="feature" id="proveeduria">
      <div className="wrap">
        <Photo variant="clay" className="media wide reveal" tag="Proveeduría — mié a dom, 9 a 17:30 hs" />
        <div className="copy">
          <div className="eyebrow reveal">03 — Proveeduría</div>
          <h2 className="section-title reveal">Llevate el campo a tu cocina.</h2>
          <p className="body reveal">
            Verduras y frutas de estación, conservas, mermeladas de nuestros bosques frutales y
            productos de nuestros propios animales. Todo lo que no se usa en el restaurant, sale
            por acá.
          </p>
          <LinkArrow href="#">Ver productos</LinkArrow>
        </div>
      </div>
    </section>
  );
}
