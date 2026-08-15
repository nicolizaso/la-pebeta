"use client";

import { useActionState, useId, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { guardarProducto } from "@/app/admin/acciones";
import type { Categoria, Producto } from "@/lib/db";
import type { FotoDisponible } from "@/lib/photos";
import { CATEGORIA_NUEVA, slugDeCategoria } from "@/lib/productos";
import { precio as enPesos } from "@/lib/tienda";

/**
 * El formulario de un producto, el mismo para uno nuevo y para uno que ya está.
 *
 * Todo es estado del cliente —no `defaultValue`— por dos razones: la categoría
 * nueva abre campos que dependen de lo elegido, y si el guardado falla nada de
 * lo escrito se pierde.
 *
 * La categoría se elige de una lista, pero la última opción del select es
 * inventarla: se escribe el nombre ahí mismo y la crea la misma action que
 * guarda el producto. No hay que pasar por otra pantalla ni dejar el producto a
 * medio cargar para ir a crear el cajón donde va.
 */
export function ProductoForm({
  producto,
  categorias,
  fotos,
}: {
  /** El producto que se está editando, o null si es nuevo. */
  producto: Producto | null;
  categorias: Categoria[];
  fotos: FotoDisponible[];
}) {
  const [estado, accion, guardando] = useActionState(guardarProducto, null);
  const id = useId();

  const [nombre, setNombre] = useState(producto?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? "");
  const [precio, setPrecio] = useState(producto ? String(producto.precio) : "");
  const [unidad, setUnidad] = useState(producto?.unidad ?? "");
  const [stock, setStock] = useState(producto ? String(producto.stock) : "0");
  const [categoria, setCategoria] = useState(producto?.categoria ?? "");
  const [nueva, setNueva] = useState("");
  const [nuevaBajada, setNuevaBajada] = useState("");
  const [foto, setFoto] = useState(producto?.foto ?? "");
  const [activo, setActivo] = useState(producto ? producto.activo : true);

  const inventando = categoria === CATEGORIA_NUEVA;
  const slug = useMemo(() => (inventando ? slugDeCategoria(nueva) : ""), [inventando, nueva]);
  const repetida = useMemo(
    () => (slug ? categorias.find((c) => c.id === slug) : undefined),
    [slug, categorias]
  );

  const elegida = fotos.find((f) => f.clave === foto);
  const areas = useMemo(() => {
    const grupos = new Map<string, FotoDisponible[]>();
    for (const disponible of fotos) {
      const area = disponible.clave.split("/")[0];
      grupos.set(area, [...(grupos.get(area) ?? []), disponible]);
    }
    return [...grupos];
  }, [fotos]);

  const falla = estado && !estado.ok ? estado : null;
  const mal = (campo: string) => (falla?.campo === campo ? true : undefined);

  return (
    <form className="admin-form" action={accion}>
      {producto ? <input type="hidden" name="id" value={producto.id} /> : null}

      <div className="admin-form-grilla">
        <p className="admin-campo ancho">
          <label htmlFor={`${id}-nombre`}>Nombre</label>
          <input
            id={`${id}-nombre`}
            name="nombre"
            value={nombre}
            onChange={(evento) => setNombre(evento.target.value)}
            maxLength={120}
            placeholder="Mermelada de naranja"
            aria-invalid={mal("nombre")}
            autoFocus={!producto}
          />
        </p>

        <p className="admin-campo ancho">
          <label htmlFor={`${id}-descripcion`}>Descripción</label>
          <textarea
            id={`${id}-descripcion`}
            name="descripcion"
            value={descripcion}
            onChange={(evento) => setDescripcion(evento.target.value)}
            maxLength={400}
            rows={2}
            placeholder="Una línea contando qué es y de dónde salió."
            aria-invalid={mal("descripcion")}
          />
        </p>

        <p className="admin-campo">
          <label htmlFor={`${id}-precio`}>Precio</label>
          <input
            id={`${id}-precio`}
            name="precio"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={precio}
            onChange={(evento) => setPrecio(evento.target.value)}
            placeholder="6800"
            aria-invalid={mal("precio")}
          />
          <small>{/^\d+$/.test(precio) ? `${enPesos(Number(precio))} en la tienda` : "En pesos, sin centavos."}</small>
        </p>

        <p className="admin-campo">
          <label htmlFor={`${id}-unidad`}>Se vende por</label>
          <input
            id={`${id}-unidad`}
            name="unidad"
            value={unidad}
            onChange={(evento) => setUnidad(evento.target.value)}
            maxLength={40}
            placeholder="frasco 250 g"
            aria-invalid={mal("unidad")}
          />
          <small>Va debajo del precio: “por {unidad || "kilo"}”.</small>
        </p>

        <p className="admin-campo">
          <label htmlFor={`${id}-stock`}>Stock</label>
          <input
            id={`${id}-stock`}
            name="stock"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={stock}
            onChange={(evento) => setStock(evento.target.value)}
            aria-invalid={mal("stock")}
          />
          <small>En cero se muestra agotado y no se puede comprar.</small>
        </p>

        <div className="admin-campo ancho">
          <label htmlFor={`${id}-categoria`}>Categoría</label>
          <select
            id={`${id}-categoria`}
            name="categoria"
            value={categoria}
            onChange={(evento) => setCategoria(evento.target.value)}
            aria-invalid={mal("categoria")}
          >
            <option value="">Elegí una…</option>
            {categorias.map((opcion) => (
              <option key={opcion.id} value={opcion.id}>
                {opcion.nombre}
                {opcion.activa ? "" : " · escondida"}
              </option>
            ))}
            <option value={CATEGORIA_NUEVA}>+ Crear una categoría nueva…</option>
          </select>

          {inventando ? (
            <div className="admin-nueva-categoria">
              <p className="admin-campo">
                <label htmlFor={`${id}-nueva`}>Cómo se llama</label>
                <input
                  id={`${id}-nueva`}
                  name="categoria-nueva"
                  value={nueva}
                  onChange={(evento) => setNueva(evento.target.value)}
                  maxLength={60}
                  placeholder="Quesos de tambo"
                  autoFocus
                />
              </p>
              <p className="admin-campo">
                <label htmlFor={`${id}-nueva-bajada`}>Bajada (opcional)</label>
                <input
                  id={`${id}-nueva-bajada`}
                  name="categoria-nueva-descripcion"
                  value={nuevaBajada}
                  onChange={(evento) => setNuevaBajada(evento.target.value)}
                  maxLength={200}
                  placeholder="La línea que se lee debajo del nombre, en el aside de la tienda."
                />
              </p>
              <p className="admin-nueva-pie">
                {!nueva ? (
                  "Se crea al guardar el producto y aparece enseguida en los filtros de la tienda."
                ) : repetida ? (
                  <>
                    Ya hay una categoría con ese nombre corto (<code>{slug}</code>): el producto va a{" "}
                    <strong>{repetida.nombre}</strong>.
                  </>
                ) : (
                  <>
                    Se guarda como <code>{slug || "—"}</code> y queda última en el aside de la tienda.
                    El orden se cambia en <Link href="/admin/productos/categorias">Categorías</Link>.
                  </>
                )}
              </p>
            </div>
          ) : null}
        </div>

        <div className="admin-campo ancho">
          <label htmlFor={`${id}-foto`}>Foto</label>
          <div className="admin-foto-fila">
            <span className="admin-foto-muestra">
              {elegida ? (
                <Image src={elegida.src} alt="" fill sizes="120px" />
              ) : (
                <em>{nombre.charAt(0) || "—"}</em>
              )}
            </span>
            <span className="admin-foto-select">
              <select
                id={`${id}-foto`}
                name="foto"
                value={foto}
                onChange={(evento) => setFoto(evento.target.value)}
                aria-invalid={mal("foto")}
              >
                <option value="">Sin foto</option>
                {areas.map(([area, delArea]) => (
                  <optgroup key={area} label={area}>
                    {delArea.map((disponible) => (
                      <option key={disponible.clave} value={disponible.clave}>
                        {disponible.clave}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <small>
                Salen de <code>public/imgs/</code>. Para sumar una, corré el script de imágenes y
                volvé acá. Sin foto queda la inicial sobre el fondo de papel.
              </small>
            </span>
          </div>
        </div>

        <label className="admin-check ancho">
          <input
            type="checkbox"
            name="activo"
            checked={activo}
            onChange={(evento) => setActivo(evento.target.checked)}
          />
          <span>
            Publicado en la tienda
            <small>Sin tildar queda cargado pero no se ve ni se puede comprar.</small>
          </span>
        </label>
      </div>

      <div className="admin-form-pie">
        <button type="submit" className="btn primary" disabled={guardando}>
          {guardando ? "Guardando…" : producto ? "Guardar cambios" : "Crear producto"}
        </button>
        <Link href="/admin/productos" className="admin-btn suave">
          Cancelar
        </Link>
        <p className="admin-form-msg" role="status">
          {falla ? falla.mensaje : ""}
        </p>
      </div>
    </form>
  );
}
