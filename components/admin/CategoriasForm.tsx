"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { guardarLasCategorias } from "@/app/admin/acciones";
import type { Categoria } from "@/lib/db";
import { slugDeCategoria } from "@/lib/productos";

/**
 * Los cajones del catálogo, la lista entera en un solo formulario y un solo
 * guardado: el orden de una categoría se piensa mirando a las otras, igual que
 * un horario se piensa mirando la semana.
 *
 * El botón de borrar de cada fila manda su id en el mismo submit, así que "esto
 * cambió" y "esta se va" son la misma action.
 */
type Campos = { nombre: string; descripcion: string; orden: string; activa: boolean };

const camposDe = (categoria: Categoria): Campos => ({
  nombre: categoria.nombre,
  descripcion: categoria.descripcion,
  orden: String(categoria.orden),
  activa: categoria.activa,
});

export function CategoriasForm({
  categorias,
  conteos,
}: {
  categorias: Categoria[];
  /** Cuántos productos tiene cada una: una con productos no se puede borrar. */
  conteos: Record<string, number>;
}) {
  const [estado, accion, guardando] = useActionState(guardarLasCategorias, null);

  // lo escrito en cada fila; lo que no se tocó sale de la base
  const [escrito, setEscrito] = useState<Record<string, Campos>>({});
  const [nueva, setNueva] = useState("");
  const [nuevaBajada, setNuevaBajada] = useState("");

  const cambiar = (id: string, categoria: Categoria, cambio: Partial<Campos>) =>
    setEscrito((previo) => ({
      ...previo,
      [id]: { ...(previo[id] ?? camposDe(categoria)), ...cambio },
    }));

  // guardó: la fila nueva ya está en la lista de arriba, el pie vuelve a cero
  useEffect(() => {
    if (estado?.ok) {
      setEscrito({});
      setNueva("");
      setNuevaBajada("");
    }
  }, [estado]);

  const slug = useMemo(() => slugDeCategoria(nueva), [nueva]);
  const repetida = slug ? categorias.find((categoria) => categoria.id === slug) : undefined;

  return (
    <form className="admin-form admin-categorias" action={accion}>
      <ul className="admin-filas">
        {categorias.map((categoria) => {
          const valor = escrito[categoria.id] ?? camposDe(categoria);
          const cuantos = conteos[categoria.id] ?? 0;

          return (
            <li key={categoria.id} className={`admin-fila${valor.activa ? "" : " apagada"}`}>
              <input type="hidden" name="ids" value={categoria.id} />

              <div className="admin-fila-datos">
                <input
                  className="admin-fila-nombre"
                  name={`nombre-${categoria.id}`}
                  value={valor.nombre}
                  onChange={(evento) => cambiar(categoria.id, categoria, { nombre: evento.target.value })}
                  maxLength={60}
                  aria-label={`Nombre de ${categoria.nombre}`}
                />
                <input
                  name={`descripcion-${categoria.id}`}
                  value={valor.descripcion}
                  onChange={(evento) =>
                    cambiar(categoria.id, categoria, { descripcion: evento.target.value })
                  }
                  maxLength={200}
                  placeholder="La línea que se lee debajo del nombre, en la tienda."
                  aria-label={`Bajada de ${categoria.nombre}`}
                />
                <span className="admin-fila-pie">
                  <code>{categoria.id}</code> ·{" "}
                  {cuantos === 0 ? (
                    "sin productos"
                  ) : (
                    <Link href={`/admin/productos?categoria=${categoria.id}`}>
                      {cuantos} {cuantos === 1 ? "producto" : "productos"}
                    </Link>
                  )}
                </span>
              </div>

              <label className="admin-fila-orden">
                <span>Orden</span>
                <input
                  name={`orden-${categoria.id}`}
                  type="number"
                  min={0}
                  max={999}
                  step={1}
                  value={valor.orden}
                  onChange={(evento) => cambiar(categoria.id, categoria, { orden: evento.target.value })}
                />
              </label>

              <label className="admin-check">
                <input
                  type="checkbox"
                  name={`activa-${categoria.id}`}
                  checked={valor.activa}
                  onChange={(evento) =>
                    cambiar(categoria.id, categoria, { activa: evento.target.checked })
                  }
                />
                <span>En la tienda</span>
              </label>

              <button
                type="submit"
                name="borrar"
                value={categoria.id}
                className="admin-btn suave"
                disabled={cuantos > 0}
                title={
                  cuantos > 0
                    ? "Tiene productos adentro: movelos o borralos primero."
                    : `Borrar ${categoria.nombre}`
                }
                onClick={(evento) => {
                  if (!window.confirm(`¿Borrar la categoría ${valor.nombre}?`)) {
                    evento.preventDefault();
                  }
                }}
              >
                Borrar
              </button>
            </li>
          );
        })}

        <li className="admin-fila admin-fila-nueva">
          <div className="admin-fila-datos">
            <input
              className="admin-fila-nombre"
              name="nueva-nombre"
              value={nueva}
              onChange={(evento) => setNueva(evento.target.value)}
              maxLength={60}
              placeholder="Agregar una categoría: quesos de tambo…"
              aria-label="Nombre de la categoría nueva"
            />
            <input
              name="nueva-descripcion"
              value={nuevaBajada}
              onChange={(evento) => setNuevaBajada(evento.target.value)}
              maxLength={200}
              placeholder="Su bajada (opcional)."
              aria-label="Bajada de la categoría nueva"
            />
            <span className="admin-fila-pie">
              {!nueva ? (
                "Queda última en la tienda; el orden se cambia acá mismo."
              ) : repetida ? (
                <>
                  Ya hay una que se guarda como <code>{slug}</code>: {repetida.nombre}.
                </>
              ) : (
                <>
                  Se guarda como <code>{slug || "—"}</code>.
                </>
              )}
            </span>
          </div>
        </li>
      </ul>

      <div className="admin-form-pie">
        <button type="submit" className="btn primary" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar categorías"}
        </button>
        <p className={`admin-horarios-msg${estado && !estado.ok ? " error" : ""}`} role="status">
          {estado ? estado.mensaje : ""}
        </p>
      </div>
    </form>
  );
}
