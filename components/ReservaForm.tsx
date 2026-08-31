"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { WHATSAPP } from "@/lib/contacto";
import type { ReservaTipo } from "@/lib/db";
import { REGLAS } from "@/lib/reservas";

type Estado =
  | { paso: "form"; error?: string }
  | { paso: "enviando" }
  | {
      paso: "listo";
      codigo: string;
      nombre: string;
      /** ¿Quedó la sesión abierta? Pasa cuando la cuenta no tiene contraseña. */
      entro: boolean;
      /** Ya había cuenta con ese mail y tiene contraseña: hay que entrar. */
      conContrasena: boolean;
    };

/**
 * Alta de una reserva. Postea a /api/reservas, que además de guardarla abre la
 * cuenta de quien reserva con el mail del formulario; si eso falla queda
 * WhatsApp como salida.
 */
export function ReservaForm({
  tipo,
  hoy,
  enviar,
}: {
  tipo: ReservaTipo;
  /** Fecha de hoy en Los Cardales, calculada en el server para no romper la hidratación. */
  hoy: string;
  /** Texto del botón, distinto para paseos y para mesas. */
  enviar: string;
}) {
  const [estado, setEstado] = useState<Estado>({ paso: "form" });
  const id = useId();
  const reglas = REGLAS[tipo];
  const horaFija = reglas.horas.length === 1 ? reglas.horas[0] : null;

  const onSubmit = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const campos = new FormData(evento.currentTarget);
    setEstado({ paso: "enviando" });

    try {
      const respuesta = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          nombre: campos.get("nombre"),
          telefono: campos.get("telefono"),
          email: campos.get("email"),
          fecha: campos.get("fecha"),
          hora: horaFija ?? campos.get("hora"),
          personas: Number(campos.get("personas")),
          comentarios: campos.get("comentarios"),
        }),
      });
      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.ok) {
        setEstado({ paso: "form", error: datos.error ?? "No pudimos tomar la reserva." });
        return;
      }
      setEstado({
        paso: "listo",
        codigo: datos.reserva.codigo,
        nombre: datos.reserva.nombre,
        entro: Boolean(datos.cuenta?.entro),
        conContrasena: Boolean(datos.cuenta?.conContrasena),
      });
    } catch {
      setEstado({
        paso: "form",
        error: "Se cortó la conexión. Probá de nuevo o escribinos por WhatsApp.",
      });
    }
  };

  if (estado.paso === "listo") {
    const nombre = estado.nombre.split(" ")[0];
    return (
      <div className="reserva-form" role="status">
        <div className="reserva-form-head">
          <span className="reserva-form-paso">Reserva tomada</span>
          <h3>Listo, {nombre}.</h3>
        </div>
        <p className="reserva-form-nota">
          Guardamos tu pedido con el código <strong>{estado.codigo}</strong>. Queda pendiente hasta
          que te confirmemos el cupo por WhatsApp.
        </p>
        {estado.entro ? (
          <p className="reserva-form-nota">
            Te dejamos la cuenta abierta: en tu perfil vas a ver ésta y todas las que pidas.
          </p>
        ) : estado.conContrasena ? (
          <p className="reserva-form-nota">
            Ya tenías una cuenta con ese mail. Entrá a tu perfil con tu contraseña y ahí la vas a
            ver.
          </p>
        ) : null}
        <div className="reserva-form-acciones">
          {estado.entro || estado.conContrasena ? (
            <Link className="btn primary" href="/perfil">
              {estado.entro ? "Ver mis reservas" : "Entrar a mi perfil"}
            </Link>
          ) : null}
          <a
            className={`btn ${estado.entro || estado.conContrasena ? "ghost" : "primary"}`}
            href={WHATSAPP}
            target="_blank"
            rel="noreferrer"
          >
            Escribinos por WhatsApp
          </a>
          <button type="button" className="btn ghost" onClick={() => setEstado({ paso: "form" })}>
            Cargar otra reserva
          </button>
        </div>
      </div>
    );
  }

  const enviando = estado.paso === "enviando";
  const error = estado.paso === "form" ? estado.error : undefined;

  return (
    <form className="reserva-form" onSubmit={onSubmit} noValidate>
      <div className="reserva-form-head">
        <span className="reserva-form-paso">Pedido de reserva</span>
        <h3>{reglas.etiqueta}</h3>
      </div>

      <div className="campos">
        <p className="campo ancho">
          <label htmlFor={`${id}-nombre`}>Nombre y apellido</label>
          <input id={`${id}-nombre`} name="nombre" type="text" required maxLength={80} autoComplete="name" />
        </p>
        <p className="campo">
          <label htmlFor={`${id}-telefono`}>Teléfono</label>
          <input id={`${id}-telefono`} name="telefono" type="tel" required autoComplete="tel" />
        </p>
        <p className="campo">
          <label htmlFor={`${id}-email`}>Mail</label>
          <input id={`${id}-email`} name="email" type="email" required autoComplete="email" />
          <span className="pista">Con esto ves tus reservas</span>
        </p>
        <p className="campo">
          <label htmlFor={`${id}-fecha`}>Fecha</label>
          <input id={`${id}-fecha`} name="fecha" type="date" required min={hoy} defaultValue="" />
          <span className="pista">{reglas.diasTexto}</span>
        </p>
        <p className="campo">
          <label htmlFor={`${id}-hora`}>Horario</label>
          {horaFija ? (
            <input id={`${id}-hora`} type="text" value={`${horaFija} hs`} readOnly tabIndex={-1} />
          ) : (
            <select id={`${id}-hora`} name="hora" defaultValue={reglas.horas[1]}>
              {reglas.horas.map((hora) => (
                <option key={hora} value={hora}>
                  {hora} hs
                </option>
              ))}
            </select>
          )}
        </p>
        <p className="campo">
          <label htmlFor={`${id}-personas`}>Personas</label>
          <input
            id={`${id}-personas`}
            name="personas"
            type="number"
            required
            min={1}
            max={reglas.personasMax}
            defaultValue={2}
          />
          <span className="pista">Hasta {reglas.personasMax}</span>
        </p>
        <p className="campo ancho">
          <label htmlFor={`${id}-comentarios`}>Comentarios (opcional)</label>
          <textarea
            id={`${id}-comentarios`}
            name="comentarios"
            rows={2}
            maxLength={500}
            placeholder={
              tipo === "restaurant"
                ? "Restricciones alimentarias, festejos, sillita para bebé…"
                : "Cuál experiencia querés —huerta o granja—, con qué edades venís…"
            }
          />
        </p>
      </div>

      <p className="reserva-form-error" role="alert">
        {error}
      </p>

      <div className="reserva-form-acciones">
        <button type="submit" className="btn primary" disabled={enviando}>
          {enviando ? "Enviando…" : enviar}
        </button>
        <a className="btn ghost" href={WHATSAPP} target="_blank" rel="noreferrer">
          Consultar por WhatsApp
        </a>
      </div>
    </form>
  );
}
