/**
 * El logo de la casa.
 *
 * El archivo que vino de diseño traía las dos versiones —la oliva y la
 * blanca— sobre un mismo lienzo, y con un `viewBox` que sólo encuadraba la
 * blanca. Acá se usan ya separadas: `public/logo.svg` y
 * `public/logo-blanco.svg`, cada una recortada a su dibujo.
 *
 * Va como <img> y no como <Image />: es un SVG, así que no hay nada que
 * optimizar ni tamaños que servir, y el optimizador de Next pide además
 * habilitar SVG a mano.
 */

const ALT = "La Pebeta — Farm to Table";

// Las medidas del viewBox: sirven para que el navegador reserve el lugar
// antes de bajar el archivo y la barra no salte.
const ANCHO = 300;
const ALTO = 60;

/**
 * `dual` dibuja las dos versiones, una encima de la otra. Es lo que necesita
 * la barra de arriba, que arranca sobre la foto del hero —ahí va la blanca— y
 * pasa a papel al bajar. Cruzarlas por opacidad, en vez de cambiar el `src`,
 * evita que la segunda recién se descargue en la primera transición.
 */
export function Logo({ dual = false }: { dual?: boolean }) {
  return (
    <span className={`marca${dual ? " marca-dual" : ""}`}>
      <img className="marca-color" src="/logo.svg" alt={ALT} width={ANCHO} height={ALTO} />
      {dual ? (
        <img
          className="marca-blanco"
          src="/logo-blanco.svg"
          alt=""
          aria-hidden="true"
          width={ANCHO}
          height={ALTO}
        />
      ) : null}
    </span>
  );
}
