"use client";

import { useActionState, useEffect, useRef } from "react";
import { ponerMiContrasena } from "@/app/perfil/acciones";
import { MIN_CONTRASENA } from "@/lib/usuarios";

/**
 * Ponerse una contraseña, o cambiar la que hay.
 *
 * Es lo que convierte una cuenta que entra con sólo el mail en una que hay que
 * abrir. Mientras no haya ninguna, cualquiera que escriba este mail en la
 * puerta ve estas reservas: la pantalla lo dice con todas las letras, porque es
 * la razón por la que este bloque existe.
 */
export function PerfilContrasena({ puesta }: { puesta: string | null }) {
  const [estado, accion, enviando] = useActionState(ponerMiContrasena, null);
  const form = useRef<HTMLFormElement>(null);

  // guardada la contraseña, los campos quedan vacíos: no tiene sentido dejarla
  // escrita en una pantalla que puede quedar abierta
  useEffect(() => {
    if (estado?.ok) form.current?.reset();
  }, [estado]);

  return (
    <form className="perfil-form" action={accion} ref={form}>
      <p className="perfil-nota">
        {puesta
          ? "Tu cuenta se abre con contraseña. Podés cambiarla cuando quieras: al hacerlo se cierran las sesiones que tengas abiertas en otros dispositivos."
          : `Mientras tu cuenta no tenga contraseña, alcanza con escribir tu mail para entrar acá y ver tus reservas. Poné una y sólo entrás vos. Van ${MIN_CONTRASENA} caracteres o más.`}
      </p>

      <div className="campos">
        {puesta ? (
          <p className="campo ancho">
            <label htmlFor="perfil-actual">Tu contraseña actual</label>
            <input
              id="perfil-actual"
              name="actual"
              type="password"
              autoComplete="current-password"
            />
          </p>
        ) : null}

        <p className="campo">
          <label htmlFor="perfil-nueva">{puesta ? "La nueva" : "Contraseña"}</label>
          <input
            id="perfil-nueva"
            name="nueva"
            type="password"
            autoComplete="new-password"
            minLength={MIN_CONTRASENA}
          />
        </p>
        <p className="campo">
          <label htmlFor="perfil-repetida">Repetila</label>
          <input
            id="perfil-repetida"
            name="repetida"
            type="password"
            autoComplete="new-password"
            minLength={MIN_CONTRASENA}
          />
        </p>
      </div>

      <p className={`perfil-aviso${estado?.ok ? " bien" : ""}`} role="status">
        {estado ? estado.mensaje : ""}
      </p>

      <div className="reserva-form-acciones">
        <button type="submit" className="btn primary" disabled={enviando}>
          {enviando ? "Guardando…" : puesta ? "Cambiar la contraseña" : "Poner una contraseña"}
        </button>
      </div>
    </form>
  );
}
