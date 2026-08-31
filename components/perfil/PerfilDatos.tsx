"use client";

import { useActionState } from "react";
import { guardarMisDatos } from "@/app/perfil/acciones";

/**
 * Nombre y teléfono de la cuenta: con eso la casa llama para confirmar una
 * reserva, así que se pueden corregir.
 *
 * El mail no se toca porque es la llave de la cuenta: cambiarlo sería mudarse a
 * otra, con las reservas de la anterior adentro.
 */
export function PerfilDatos({
  nombre,
  telefono,
  email,
}: {
  nombre: string;
  telefono: string;
  email: string;
}) {
  const [estado, accion, enviando] = useActionState(guardarMisDatos, null);

  return (
    <form className="perfil-form" action={accion}>
      <div className="campos">
        <p className="campo">
          <label htmlFor="perfil-nombre">Nombre y apellido</label>
          <input
            id="perfil-nombre"
            name="nombre"
            type="text"
            required
            maxLength={80}
            autoComplete="name"
            defaultValue={nombre}
          />
        </p>
        <p className="campo">
          <label htmlFor="perfil-telefono">Teléfono</label>
          <input
            id="perfil-telefono"
            name="telefono"
            type="tel"
            required
            autoComplete="tel"
            defaultValue={telefono}
          />
        </p>
        <p className="campo ancho">
          <label htmlFor="perfil-mail">Mail</label>
          <input id="perfil-mail" type="email" value={email} readOnly tabIndex={-1} />
          <span className="pista">Es la llave de tu cuenta</span>
        </p>
      </div>

      <p className={`perfil-aviso${estado?.ok ? " bien" : ""}`} role="status">
        {estado ? estado.mensaje : ""}
      </p>

      <div className="reserva-form-acciones">
        <button type="submit" className="btn primary" disabled={enviando}>
          {enviando ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
