"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { WHATSAPP } from "@/lib/contacto";
import type { EntradaReserva } from "@/lib/reservas";
import { Propuesta } from "./Propuesta";

/**
 * El chat de La Pebeta: una burbuja abajo a la derecha que contesta consultas.
 *
 * Todo lo que sabe viene del server. Acá no hay reglas de negocio ni datos de
 * la casa: se manda el texto a `/api/chat` y se escribe lo que baja. El hilo
 * tampoco se manda —vive en la base— así que este componente sólo guarda lo que
 * hace falta para dibujar la conversación y el id con el que seguirla.
 *
 * La respuesta baja en SSE y se pinta a medida que llega, que es la diferencia
 * entre esperar quince segundos en blanco y leer mientras se escribe.
 */

type Renglon = { rol: "persona" | "asistente"; texto: string };

const SALUDO =
  "Hola, soy el asistente de La Pebeta. Puedo contarte de los paseos, el restaurant " +
  "y la proveeduría, y si querés te tomo la reserva. ¿Qué necesitás?";

/** Lo que se ofrece de arranque, para no arrancar con el cursor en blanco. */
const ATAJOS = ["¿Qué días abren?", "Quiero reservar una mesa", "¿Cómo llego?"];

export function Chat({
  /**
   * El tope de caracteres, que baja del server. `lib/consultas.ts` no se puede
   * importar acá: hashea la IP con `node:crypto` y eso no entra en el bundle
   * del navegador. Que el número viaje como prop lo deja igual en un solo lugar.
   */
  maxMensaje,
}: {
  maxMensaje: number;
}) {
  const [abierto, setAbierto] = useState(false);
  const [renglones, setRenglones] = useState<Renglon[]>([]);
  const [borrador, setBorrador] = useState("");
  const [esperando, setEsperando] = useState(false);
  const [error, setError] = useState("");
  const [derivada, setDerivada] = useState(false);
  const [propuesta, setPropuesta] = useState<EntradaReserva | null>(null);
  const consultaId = useRef("");
  const fondo = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();

  // El scroll sigue a lo último, incluso mientras la respuesta se escribe.
  useEffect(() => {
    fondo.current?.scrollTo({ top: fondo.current.scrollHeight, behavior: "smooth" });
  }, [renglones, propuesta, abierto]);

  useEffect(() => {
    if (abierto) campo.current?.focus();
  }, [abierto]);

  // Escape cierra, como el lightbox.
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierto]);

  const preguntar = async (texto: string) => {
    const pregunta = texto.trim();
    if (!pregunta || esperando) return;

    setBorrador("");
    setError("");
    setPropuesta(null);
    setRenglones((previos) => [...previos, { rol: "persona", texto: pregunta }]);
    setEsperando(true);

    try {
      const respuesta = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultaId: consultaId.current, texto: pregunta, pagina: pathname }),
      });

      // Los errores no vienen en el stream: vienen como JSON y con su status.
      if (!respuesta.ok || !respuesta.body) {
        const datos = await respuesta.json().catch(() => null);
        setError(datos?.error ?? "No pudimos contestarte. Probá de nuevo en un minuto.");
        return;
      }

      const lector = respuesta.body.getReader();
      const decodificador = new TextDecoder();
      let pendiente = "";
      // El renglón del asistente se crea vacío y se va llenando: por eso la
      // primera letra que baja ya empuja la burbuja a la pantalla.
      let abierta = false;

      const pintar = (trozo: string) => {
        setRenglones((previos) => {
          if (!abierta) return previos;
          const copia = [...previos];
          const ultimo = copia[copia.length - 1];
          copia[copia.length - 1] = { ...ultimo, texto: ultimo.texto + trozo };
          return copia;
        });
      };

      while (true) {
        const { done, value } = await lector.read();
        if (done) break;

        pendiente += decodificador.decode(value, { stream: true });
        const partes = pendiente.split("\n\n");
        pendiente = partes.pop() ?? "";

        for (const parte of partes) {
          const linea = parte.trim();
          if (!linea.startsWith("data:")) continue;

          let suceso;
          try {
            suceso = JSON.parse(linea.slice(5).trim());
          } catch {
            continue;
          }

          if (suceso.tipo === "consulta") {
            consultaId.current = suceso.id;
          } else if (suceso.tipo === "texto") {
            if (!abierta) {
              abierta = true;
              setRenglones((previos) => [...previos, { rol: "asistente", texto: "" }]);
            }
            pintar(suceso.texto);
          } else if (suceso.tipo === "propuesta") {
            setPropuesta(suceso.datos);
          } else if (suceso.tipo === "derivar") {
            setDerivada(true);
          } else if (suceso.tipo === "error") {
            setError(suceso.error);
          }
        }
      }
    } catch {
      setError("Se cortó la conexión. Probá de nuevo o escribinos por WhatsApp.");
    } finally {
      setEsperando(false);
    }
  };

  const alEnviar = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    void preguntar(borrador);
  };

  // Enter manda y shift+enter hace un renglón: lo que espera cualquiera que
  // haya usado un chat antes.
  const alTeclear = (evento: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (evento.key === "Enter" && !evento.shiftKey) {
      evento.preventDefault();
      void preguntar(borrador);
    }
  };

  return (
    <div className={`chat${abierto ? " abierto" : ""}`}>
      <button
        type="button"
        className="chat-boton"
        onClick={() => setAbierto((estaba) => !estaba)}
        aria-expanded={abierto}
        aria-controls="chat-panel"
      >
        <span className="chat-boton-icono" aria-hidden="true" />
        <span>{abierto ? "Cerrar" : "¿Te ayudo?"}</span>
      </button>

      <div className="chat-panel" id="chat-panel" role="dialog" aria-label="Chat con La Pebeta" hidden={!abierto}>
        <header className="chat-cabecera">
          <div>
            <strong>La Pebeta</strong>
            <span>Te contesta un asistente</span>
          </div>
          <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar el chat">
            ✕
          </button>
        </header>

        <div className="chat-hilo" ref={fondo}>
          <p className="chat-burbuja asistente">{SALUDO}</p>

          {renglones.map((renglon, indice) => (
            <p key={indice} className={`chat-burbuja ${renglon.rol}`}>
              {renglon.texto}
            </p>
          ))}

          {esperando && renglones[renglones.length - 1]?.rol === "persona" ? (
            <p className="chat-burbuja asistente escribiendo" aria-live="polite">
              <span />
              <span />
              <span />
            </p>
          ) : null}

          {propuesta ? (
            <Propuesta
              datos={propuesta}
              consultaId={consultaId.current}
              alConfirmar={(aviso) => {
                setPropuesta(null);
                setRenglones((previos) => [...previos, { rol: "asistente", texto: aviso }]);
              }}
            />
          ) : null}

          {derivada ? (
            <p className="chat-derivada">
              Esto lo contesta mejor alguien de la casa.{" "}
              <a href={WHATSAPP} target="_blank" rel="noreferrer">
                Escribinos por WhatsApp
              </a>
              .
            </p>
          ) : null}

          {error ? <p className="chat-error">{error}</p> : null}

          {renglones.length === 0 && !esperando ? (
            <div className="chat-atajos">
              {ATAJOS.map((atajo) => (
                <button key={atajo} type="button" onClick={() => void preguntar(atajo)}>
                  {atajo}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <form className="chat-escribir" onSubmit={alEnviar}>
          <textarea
            ref={campo}
            value={borrador}
            onChange={(evento) => setBorrador(evento.target.value)}
            onKeyDown={alTeclear}
            placeholder="Escribí tu consulta…"
            maxLength={maxMensaje}
            rows={1}
            disabled={esperando}
          />
          <button type="submit" disabled={esperando || !borrador.trim()} aria-label="Enviar">
            →
          </button>
        </form>
      </div>
    </div>
  );
}
