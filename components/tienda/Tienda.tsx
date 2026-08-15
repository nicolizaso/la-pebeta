"use client";

import { useEffect, useMemo, useState } from "react";
import type { Categoria } from "@/lib/db";
import {
  filtrarProductos,
  filtroInicial,
  MAX_UNIDADES,
  ORDENES,
  precio,
  type FiltroTienda,
  type Orden,
  type ProductoVista,
} from "@/lib/tienda";
import { Carrito, type LineaCarrito } from "./Carrito";
import { ProductoCard } from "./ProductoCard";
import { TiendaFiltros } from "./TiendaFiltros";

/** El carrito vive en este navegador: no hay cuentas ni sesión en la tienda. */
const GUARDADO = "pebeta-carrito";

/**
 * La tienda entera del lado del cliente: el catálogo llega entero desde el
 * server —son unas decenas de productos— y acá se filtra, se ordena y se arma
 * el pedido, sin ida y vuelta por cada tilde.
 */
export function Tienda({
  productos,
  categorias,
}: {
  productos: ProductoVista[];
  categorias: Categoria[];
}) {
  const techo = useMemo(
    () => productos.reduce((mayor, producto) => Math.max(mayor, producto.precio), 1000),
    [productos]
  );

  // Las categorías se cargan desde el panel, así que puede haber una recién
  // creada todavía vacía: al aside van las que tienen algo adentro, para que
  // ningún cajón se ofrezca en cero.
  const cajones = useMemo(
    () => categorias.filter((categoria) => productos.some((p) => p.categoria === categoria.id)),
    [categorias, productos]
  );

  const [filtro, setFiltro] = useState<FiltroTienda>(() => filtroInicial(techo));
  const [carrito, setCarrito] = useState<Record<string, number>>({});
  const [abierto, setAbierto] = useState(false);
  const [cargado, setCargado] = useState(false);

  // El carrito guardado se relee contra el catálogo de hoy: si un producto ya no
  // está o bajó el stock, la cantidad se recorta en vez de romper el pedido.
  useEffect(() => {
    try {
      const crudo = window.localStorage.getItem(GUARDADO);
      if (crudo) {
        const guardado = JSON.parse(crudo) as Record<string, unknown>;
        const limpio: Record<string, number> = {};

        for (const [productoId, valor] of Object.entries(guardado)) {
          const producto = productos.find((p) => p.id === productoId);
          if (!producto) continue;
          const tope = Math.min(MAX_UNIDADES, producto.stock);
          const cantidad = Math.min(Math.floor(Number(valor) || 0), tope);
          if (cantidad >= 1) limpio[productoId] = cantidad;
        }

        setCarrito(limpio);
      }
    } catch {
      // storage lleno, bloqueado o con basura: se arranca con el carrito vacío
    }
    setCargado(true);
  }, [productos]);

  useEffect(() => {
    if (!cargado) return;
    try {
      window.localStorage.setItem(GUARDADO, JSON.stringify(carrito));
    } catch {
      // si no se puede guardar, el carrito sigue funcionando en esta pestaña
    }
  }, [carrito, cargado]);

  const cambiar = (cambio: Partial<FiltroTienda>) => setFiltro((previo) => ({ ...previo, ...cambio }));
  const limpiar = () => setFiltro(filtroInicial(techo));
  const tocado =
    filtro.texto !== "" ||
    filtro.categoria !== "" ||
    filtro.soloConStock ||
    filtro.hasta < techo ||
    filtro.orden !== "categoria";

  // el recorte sin mirar la categoría: de acá salen los conteos del aside
  const base = useMemo(
    () => filtrarProductos(productos, { ...filtro, categoria: "" }),
    [productos, filtro]
  );
  const visibles = useMemo(
    () => (filtro.categoria ? base.filter((p) => p.categoria === filtro.categoria) : base),
    [base, filtro.categoria]
  );
  const conteos = useMemo(() => {
    const cuenta: Record<string, number> = {};
    for (const producto of base) cuenta[producto.categoria] = (cuenta[producto.categoria] ?? 0) + 1;
    return cuenta;
  }, [base]);

  const ponerCantidad = (producto: ProductoVista, cantidad: number) => {
    setCarrito((previo) => {
      const copia = { ...previo };
      const tope = Math.min(MAX_UNIDADES, producto.stock);
      const nueva = Math.min(cantidad, tope);
      if (nueva < 1) delete copia[producto.id];
      else copia[producto.id] = nueva;
      return copia;
    });
  };

  const lineas: LineaCarrito[] = useMemo(
    () =>
      Object.entries(carrito).flatMap(([productoId, cantidad]) => {
        const producto = productos.find((p) => p.id === productoId);
        return producto ? [{ producto, cantidad }] : [];
      }),
    [carrito, productos]
  );

  const total = lineas.reduce((suma, linea) => suma + linea.producto.precio * linea.cantidad, 0);
  const unidades = lineas.reduce((suma, linea) => suma + linea.cantidad, 0);

  return (
    <>
      <div className="wrap tienda-cuerpo">
        <TiendaFiltros
          categorias={cajones}
          conteos={conteos}
          total={base.length}
          techo={techo}
          filtro={filtro}
          onCambiar={cambiar}
          onLimpiar={limpiar}
          tocado={tocado}
        />

        <section className="tienda-lista" aria-label="Productos">
          <div className="tienda-barra">
            <p className="tienda-conteo">
              {visibles.length} {visibles.length === 1 ? "producto" : "productos"}
              {filtro.categoria
                ? ` en ${cajones.find((c) => c.id === filtro.categoria)?.nombre ?? ""}`
                : ""}
            </p>

            <div className="tienda-barra-acciones">
              <label className="tienda-orden">
                <span>Ordenar</span>
                <select
                  value={filtro.orden}
                  onChange={(evento) => cambiar({ orden: evento.target.value as Orden })}
                >
                  {ORDENES.map((orden) => (
                    <option key={orden.valor} value={orden.valor}>
                      {orden.texto}
                    </option>
                  ))}
                </select>
              </label>

              <button type="button" className="tienda-vercarrito" onClick={() => setAbierto(true)}>
                Carrito ({unidades})
              </button>
            </div>
          </div>

          {visibles.length === 0 ? (
            <div className="tienda-vacio">
              <h2>No encontramos nada con ese recorte.</h2>
              <p>
                Probá con otra palabra o mirá todo el catálogo: lo que hay cambia según lo que se
                cosecha esa semana.
              </p>
              <button type="button" className="btn ghost" onClick={limpiar}>
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="tienda-grilla">
              {visibles.map((producto) => (
                <ProductoCard
                  key={producto.id}
                  producto={producto}
                  enCarrito={carrito[producto.id] ?? 0}
                  onAgregar={() => ponerCantidad(producto, (carrito[producto.id] ?? 0) + 1)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {unidades > 0 && !abierto ? (
        <button type="button" className="carrito-flotante" onClick={() => setAbierto(true)}>
          <span>
            {unidades} {unidades === 1 ? "producto" : "productos"}
          </span>
          <strong>{precio(total)}</strong>
        </button>
      ) : null}

      <Carrito
        lineas={lineas}
        total={total}
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        onCantidad={ponerCantidad}
        onVaciar={() => setCarrito({})}
      />
    </>
  );
}
