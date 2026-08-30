"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { entrar } from "@/app/perfil/acciones";

/**
 * La puerta del perfil: el mail, y la contraseña sólo si esa cuenta se puso
 * una.
 *
 * Quien todavía no tiene contraseña entra con el mail y nada más —es la misma
 * cuenta que se le abrió sola al reservar—, así que el segundo campo aparece
 * recién cuando el server dice que hace falta, y no antes: desde acá no se
 * puede saber de antemano.
 */
export function PerfilPuerta() {
  const [estado, accion, enviando] = useActionState(entrar, null);
  const [email, setEmail] = useState("");
  const clave = useRef<HTMLInputElement>(null);

  const pide = Boolean(estado?.pideContrasena);

  // cuando aparece el campo de la contraseña, el cursor va solo
  useEffect(() => {
    if (pide) clave.current?.focus();
  }, [pide]);

  return (
    <form className="reserva-form perfil-puerta" action={accion}>
      <div className="reserva-form-head">
        <span className="reserva-form-paso">Tu cuenta</span>
        <h3>{pide ? "Poné tu contraseña." : "Entrá con tu mail."}</h3>
      </div>

      <p className="reserva-form-nota">
        {pide
          ? "Esta cuenta tiene contraseña, así que la pedimos antes de mostrar nada."
          : "Es el mail con el que reservaste. La cuenta se abre sola con la primera reserva: no hay nada que registrar."}
      </p>

      <div className="campos">
        <p className="campo ancho">
          <label htmlFor="perfil-email">Mail</label>
          <input
            id="perfil-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            autoFocus={!pide}
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
          />
        </p>

        {pide ? (
          <p className="campo ancho">
            <label htmlFor="perfil-clave">Contraseña</label>
            <input
              id="perfil-clave"
              name="clave"
              type="password"
              autoComplete="current-password"
              ref={clave}
            />
          </p>
        ) : null}
      </div>

      <p className="reserva-form-error" role="alert">
        {estado && !estado.ok ? estado.mensaje : ""}
      </p>

      <div className="reserva-form-acciones">
        <button type="submit" className="btn primary" disabled={enviando}>
          {enviando ? "Entrando…" : pide ? "Entrar" : "Continuar"}
        </button>
        <Link className="btn ghost" href="/reservas">
          Reservar
        </Link>
      </div>
    </form>
  );
}
