"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ingresar } from "@/app/admin/acciones";

/** La puerta: una clave, la que está en `ADMIN_PASSWORD`. */
export function AdminLogin() {
  const [estado, accion, enviando] = useActionState(ingresar, null);

  return (
    <div className="admin-puerta">
      <form className="admin-puerta-card" action={accion}>
        <div className="eyebrow">Panel</div>
        <h1>La Pebeta</h1>
        <p>Las reservas tienen teléfonos y mails, así que el panel pide la clave.</p>

        <p className="campo">
          <label htmlFor="clave">Clave</label>
          <input id="clave" name="clave" type="password" autoComplete="current-password" autoFocus />
        </p>

        <p className="admin-puerta-error" role="alert">
          {estado && !estado.ok ? estado.mensaje : ""}
        </p>

        <button type="submit" className="btn primary" disabled={enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>

        <Link href="/" className="admin-puerta-volver">
          Volver al sitio
        </Link>
      </form>
    </div>
  );
}
