"use client";

import Image from "next/image";
import { precio, type ProductoVista } from "@/lib/tienda";

/**
 * Un producto del catálogo. La foto usa el mismo tratamiento que el resto del
 * sitio (`.photo`), pero con el asset ya resuelto: acá no llega el manifiesto.
 * Sin foto queda la inicial sobre el fondo de papel, que es como se ven los
 * productos nuevos hasta que se les saca una.
 */
export function ProductoCard({
  producto,
  enCarrito,
  onAgregar,
}: {
  producto: ProductoVista;
  /** Cuántas unidades ya hay en el carrito, para avisarlo en el botón. */
  enCarrito: number;
  onAgregar: () => void;
}) {
  const agotado = producto.stock < 1;
  const tope = enCarrito >= producto.stock;

  return (
    <article className={`producto${agotado ? " agotado" : ""}`}>
      <div className="producto-foto">
        {producto.imagen ? (
          <figure className="photo has-img">
            <span className="photo-media">
              <Image
                src={producto.imagen.src}
                alt={producto.nombre}
                fill
                sizes="(max-width: 700px) 92vw, (max-width: 1100px) 44vw, 28vw"
                placeholder="blur"
                blurDataURL={producto.imagen.blurDataURL}
              />
            </span>
          </figure>
        ) : (
          <figure className="photo producto-sinfoto" aria-hidden="true">
            <span>{producto.nombre.charAt(0)}</span>
          </figure>
        )}
        {agotado ? <span className="producto-sello">Sin stock</span> : null}
      </div>

      <div className="producto-cuerpo">
        <h3>{producto.nombre}</h3>
        <p>{producto.descripcion}</p>

        <div className="producto-pie">
          <span className="producto-precio">
            {precio(producto.precio)}
            <em>por {producto.unidad}</em>
          </span>

          <button
            type="button"
            className="producto-btn"
            onClick={onAgregar}
            disabled={agotado || tope}
          >
            {agotado ? "Sin stock" : tope ? "Es todo lo que hay" : enCarrito > 0 ? `Sumar (${enCarrito})` : "Agregar"}
          </button>
        </div>

        {!agotado && producto.stock <= 5 ? (
          <p className="producto-quedan">Quedan {producto.stock}</p>
        ) : null}
      </div>
    </article>
  );
}
