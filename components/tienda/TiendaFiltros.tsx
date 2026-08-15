"use client";

import { useId } from "react";
import type { Categoria } from "@/lib/db";
import { precio, type FiltroTienda } from "@/lib/tienda";

/**
 * El aside de la tienda: buscador, categorías, precio y stock.
 *
 * Los conteos que muestra cada categoría no son los del catálogo entero sino
 * los del recorte actual —lo que quedó después del buscador, el precio y el
 * stock—, así que nunca ofrece un cajón que va a salir vacío.
 */
export function TiendaFiltros({
  categorias,
  conteos,
  total,
  techo,
  filtro,
  onCambiar,
  onLimpiar,
  tocado,
}: {
  categorias: Categoria[];
  conteos: Record<string, number>;
  /** Cuántos productos hay en el recorte, sin mirar la categoría. */
  total: number;
  /** El producto más caro del catálogo: el tope de la barra de precio. */
  techo: number;
  filtro: FiltroTienda;
  onCambiar: (cambio: Partial<FiltroTienda>) => void;
  onLimpiar: () => void;
  /** ¿Hay algún filtro puesto? Si no, no hace falta ofrecer limpiarlos. */
  tocado: boolean;
}) {
  const id = useId();

  return (
    <aside className="tienda-aside" aria-label="Filtros del catálogo">
      <div className="tienda-filtro">
        <label className="tienda-filtro-titulo" htmlFor={`${id}-buscar`}>
          Buscar
        </label>
        <div className="tienda-buscador">
          <input
            id={`${id}-buscar`}
            type="search"
            value={filtro.texto}
            placeholder="Mermelada, huevos, lechuga…"
            onChange={(evento) => onCambiar({ texto: evento.target.value })}
          />
          {filtro.texto ? (
            <button type="button" onClick={() => onCambiar({ texto: "" })} aria-label="Borrar la búsqueda">
              ×
            </button>
          ) : null}
        </div>
      </div>

      <div className="tienda-filtro">
        <h2 className="tienda-filtro-titulo">Categorías</h2>
        <ul className="tienda-categorias">
          <li>
            <button
              type="button"
              className={`tienda-categoria${filtro.categoria === "" ? " activa" : ""}`}
              onClick={() => onCambiar({ categoria: "" })}
              aria-pressed={filtro.categoria === ""}
            >
              <span>Todo el catálogo</span>
              <em>{total}</em>
            </button>
          </li>
          {categorias.map((categoria) => {
            const cuantos = conteos[categoria.id] ?? 0;
            const activa = filtro.categoria === categoria.id;
            return (
              <li key={categoria.id}>
                <button
                  type="button"
                  className={`tienda-categoria${activa ? " activa" : ""}`}
                  onClick={() => onCambiar({ categoria: activa ? "" : categoria.id })}
                  aria-pressed={activa}
                  disabled={cuantos === 0 && !activa}
                >
                  <span>
                    {categoria.nombre}
                    <small>{categoria.descripcion}</small>
                  </span>
                  <em>{cuantos}</em>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="tienda-filtro">
        <label className="tienda-filtro-titulo" htmlFor={`${id}-precio`}>
          Precio hasta
        </label>
        <input
          id={`${id}-precio`}
          type="range"
          min={0}
          max={techo}
          step={100}
          value={filtro.hasta}
          onChange={(evento) => onCambiar({ hasta: Number(evento.target.value) })}
        />
        <p className="tienda-filtro-valor">
          {filtro.hasta >= techo ? "Todos los precios" : `Hasta ${precio(filtro.hasta)}`}
        </p>
      </div>

      <div className="tienda-filtro">
        <label className="tienda-check">
          <input
            type="checkbox"
            checked={filtro.soloConStock}
            onChange={(evento) => onCambiar({ soloConStock: evento.target.checked })}
          />
          <span>Sólo lo que hay hoy</span>
        </label>
      </div>

      {tocado ? (
        <button type="button" className="tienda-limpiar" onClick={onLimpiar}>
          Limpiar filtros
        </button>
      ) : null}
    </aside>
  );
}
