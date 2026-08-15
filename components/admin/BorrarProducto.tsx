"use client";

import { eliminarProducto } from "@/app/admin/acciones";

/**
 * La baja definitiva de un producto. Es lo único del panel que no se puede
 * deshacer, así que es lo único que pregunta antes de hacerlo.
 */
export function BorrarProducto({ id, nombre }: { id: string; nombre: string }) {
  return (
    <form
      action={eliminarProducto}
      onSubmit={(evento) => {
        if (!window.confirm(`¿Borrar ${nombre} del catálogo? No se puede deshacer.`)) {
          evento.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="admin-btn suave">
        Borrar {nombre}
      </button>
    </form>
  );
}
