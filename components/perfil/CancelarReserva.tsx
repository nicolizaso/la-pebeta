"use client";

import { useActionState } from "react";
import { cancelarMiReserva } from "@/app/perfil/acciones";

/**
 * Soltar una reserva. Pregunta antes: es de las pocas cosas del sitio que no se
 * pueden deshacer solas —para volver hay que cargar otra— y el cupo se libera
 * en el momento.
 */
export function CancelarReserva({ id, codigo }: { id: string; codigo: string }) {
  const [estado, accion, enviando] = useActionState(cancelarMiReserva, null);

  return (
    <form
      className="perfil-cancelar"
      action={accion}
      onSubmit={(evento) => {
        if (!confirm(`¿Cancelamos la reserva ${codigo}?`)) evento.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="perfil-btn" disabled={enviando}>
        {enviando ? "Cancelando…" : "Cancelar"}
      </button>
      {estado && !estado.ok ? (
        <span className="perfil-cancelar-error" role="alert">
          {estado.mensaje}
        </span>
      ) : null}
    </form>
  );
}
