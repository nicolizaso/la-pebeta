"use client";

import { eliminarNota } from "@/app/admin/acciones";

/**
 * La baja definitiva de una nota. Como la de un producto, pregunta antes: es lo
 * único del blog que no se puede deshacer.
 */
export function BorrarNota({ id, slug, titulo }: { id: string; slug: string; titulo: string }) {
  return (
    <form
      action={eliminarNota}
      onSubmit={(evento) => {
        if (!window.confirm(`¿Borrar “${titulo}”? No se puede deshacer.`)) {
          evento.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" className="admin-btn suave">
        Borrar la nota
      </button>
    </form>
  );
}
