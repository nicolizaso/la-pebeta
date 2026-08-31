"use client";

import { useState } from "react";
import Link from "next/link";
import { WHATSAPP } from "@/lib/contacto";
import { buscarPaseo } from "@/lib/paseos";
import { REGLAS, type EntradaReserva } from "@/lib/reservas";

/**
 * El resumen de la reserva que el asistente armó, con el botón que la toma.
 *
 * Lo que se manda al confirmar es el id de la conversación y nada más: la
 * reserva de verdad la lee `/api/chat/reserva` de la base, donde la dejó el
 * turno anterior. Este componente muestra una copia para leer, no la fuente:
 * si alguien la edita en el navegador, lo único que cambia es lo que ve.
 *
 * Que exista este paso es el punto: el modelo propone y la persona confirma.
 * Sin este botón, una charla podría terminar en una mesa reservada que nadie
 * pidió.
 */
export function Propuesta({
  datos,
  consultaId,
  alConfirmar,
}: {
  datos: EntradaReserva;
  consultaId: string;
  alConfirmar: (aviso: string) => void;
}) {
  const [estado, setEstado] = useState<"lista" | "tomando" | "tomada">("lista");
  const [error, setError] = useState("");

  const paseo = buscarPaseo(datos.paseo);
  const que = paseo ? paseo.nombre : REGLAS[datos.tipo].etiqueta;

  const confirmar = async () => {
    setEstado("tomando");
    setError("");

    try {
      const respuesta = await fetch("/api/chat/reserva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultaId }),
      });
      const cuerpo = await respuesta.json();

      if (!respuesta.ok || !cuerpo.ok) {
        setError(cuerpo?.error ?? "No pudimos tomar la reserva.");
        setEstado("lista");
        return;
      }

      setEstado("tomada");
      alConfirmar(cuerpo.aviso);
    } catch {
      setError("Se cortó la conexión. Probá de nuevo o escribinos por WhatsApp.");
      setEstado("lista");
    }
  };

  if (estado === "tomada") return null;

  return (
    <div className="chat-propuesta">
      <div className="chat-propuesta-titulo">Revisá y confirmá</div>

      <dl>
        <div>
          <dt>Qué</dt>
          <dd>{que}</dd>
        </div>
        <div>
          <dt>Cuándo</dt>
          <dd>
            {datos.fecha} a las {datos.hora} hs
          </dd>
        </div>
        <div>
          <dt>Cuántos</dt>
          <dd>{datos.personas === 1 ? "1 persona" : `${datos.personas} personas`}</dd>
        </div>
        <div>
          <dt>A nombre de</dt>
          <dd>
            {datos.nombre} — {datos.telefono}
          </dd>
        </div>
        <div>
          <dt>Mail</dt>
          <dd>{datos.email}</dd>
        </div>
        {datos.comentarios ? (
          <div>
            <dt>Nota</dt>
            <dd>{datos.comentarios}</dd>
          </div>
        ) : null}
      </dl>

      {error ? <p className="chat-error">{error}</p> : null}

      <button type="button" className="btn primary" onClick={confirmar} disabled={estado === "tomando"}>
        {estado === "tomando" ? "Tomando la reserva…" : "Confirmar la reserva"}
      </button>

      <p className="chat-propuesta-pie">
        Entra como pendiente: la casa la confirma después. Si algo está mal, decíselo al
        asistente o <Link href="/reservas">usá el formulario</Link>. También estamos por{" "}
        <a href={WHATSAPP} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
        .
      </p>
    </div>
  );
}
