import { Photo } from "./Photo";
import { LinkArrow } from "./LinkArrow";

export function ProveeduriaSection() {
  return (
    <section className="feature" id="proveeduria">
      <div className="wrap">
        <div className="prov-gallery">
          <Photo
            photo="proveeduria/2"
            alt="Interior de la proveeduría con estantes de conservas y mesa de exhibición"
            className="prov-main"
            tag="Proveeduría — mié a dom, 9 a 17:30 hs"
            sizes="(max-width: 860px) 92vw, 30vw"
            reveal
            parallax
            lightbox
          />
          <Photo
            photo="proveeduria/3"
            alt="Cajón de madera con naranjas y mandarinas en el galpón de ladrillo"
            className="prov-side"
            tag="Cítricos del bosque frutal"
            sizes="(max-width: 860px) 46vw, 16vw"
            reveal
            lightbox
          />
          <Photo
            photo="proveeduria/1"
            alt="Maples de huevos frescos apilados en la proveeduría"
            className="prov-side"
            tag="Huevos del día"
            sizes="(max-width: 860px) 46vw, 16vw"
            reveal
            lightbox
          />
        </div>
        <div className="copy">
          <div className="eyebrow reveal">03 — Proveeduría</div>
          <h2 className="section-title reveal" data-split>
            Llevate el campo a tu cocina.
          </h2>
          <p className="body reveal">
            Verduras y frutas de estación, conservas, mermeladas de nuestros bosques frutales y
            productos de nuestros propios animales. Todo lo que no se usa en el restaurant, sale
            por acá.
          </p>
          <LinkArrow href="/tienda">Ver la tienda</LinkArrow>
        </div>
      </div>
    </section>
  );
}
