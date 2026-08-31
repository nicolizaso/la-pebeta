import { createHash } from "node:crypto";
import type { ConsultaEstado, MensajeConsulta } from "./db";

/**
 * Las reglas del chat, del mismo lado que las de las reservas y las de la
 * tienda: acá para poder explicar qué está mal, y como constraints de la tabla
 * para que no entre nada raro ni escribiendo contra la base de forma directa.
 *
 * Hay una razón de más para que estos topes existan: `/api/chat` es un endpoint
 * público que cuesta plata cada vez que contesta. Sin límites, alguien con un
 * `curl` en un `for` vacía la cuenta de la casa en una tarde. Nada de esto
 * reemplaza un rate limit de verdad —para eso haría falta Redis, que este stack
 * no tiene— pero acota el daño con lo que hay: Postgres y un hash.
 */

/** Lo que se puede escribir de una vez. Alcanza para una pregunta larga. */
export const MAX_MENSAJE = 600;

/** Cuántas preguntas admite una conversación antes de derivar al WhatsApp. */
export const MAX_PREGUNTAS = 20;

/**
 * El tope de renglones del hilo: las preguntas y sus respuestas. Es el mismo
 * número que el constraint de `consultas.hilo`.
 */
export const MAX_HILO = MAX_PREGUNTAS * 2;

/** Cuántas conversaciones puede abrir la misma IP en una hora. */
export const MAX_POR_HORA = 5;

/** La ventana del contador de arriba, en milisegundos. */
export const VENTANA = 60 * 60 * 1000;

/** De dónde se abrió el chat: se guarda para leer las consultas en contexto. */
export const MAX_PAGINA = 200;

/**
 * Cuánto vive una propuesta de reserva antes de que haya que volver a pedirla.
 *
 * Media hora es lo que tarda una charla en enfriarse. Pasado eso el botón no
 * confirma: la fecha pudo llenarse, o la persona pudo cerrar todo y volver
 * mañana con la pestaña abierta y apretar sin leer.
 */
export const VENCE_PROPUESTA = 30 * 60 * 1000;

/** ¿Todavía se puede confirmar esta propuesta? */
export function propuestaVigente(momento: string, ahora = new Date()): boolean {
  const cuando = Date.parse(momento);
  return Number.isFinite(cuando) && ahora.getTime() - cuando <= VENCE_PROPUESTA;
}

/**
 * El hash de la IP, no la IP.
 *
 * Sirve para una sola cosa: contar cuántas conversaciones abrió el mismo lugar
 * en la última hora. No se puede volver de acá a la dirección, y no queremos
 * poder: lo que importa es si son cinco o son quinientas.
 */
export function huellaDe(ip: string): string {
  if (!ip) return "";
  return createHash("sha256").update(`pebeta:consultas:${ip}`).digest("hex").slice(0, 32);
}

/**
 * La IP de quien pregunta, mirando los headers que pone el proxy. En Vercel
 * viene en `x-forwarded-for`, que puede traer una cadena: la primera es la del
 * cliente. Si no hay ninguno —en local, por ejemplo— devuelve vacío y el
 * contador queda sin efecto, que es lo que corresponde.
 */
export function ipDe(headers: Headers): string {
  const cadena = headers.get("x-forwarded-for") ?? "";
  const primera = cadena.split(",")[0]?.trim() ?? "";
  return primera || (headers.get("x-real-ip") ?? "").trim();
}

export type EntradaChat = {
  /** La conversación que sigue, o vacío si es la primera pregunta. */
  consultaId: string;
  texto: string;
  pagina: string;
};

type Resultado =
  | { ok: true; datos: EntradaChat }
  | { ok: false; error: string };

const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const texto = (valor: unknown) => (typeof valor === "string" ? valor.trim() : "");

/** Lo que manda el widget en cada pregunta. */
export function validarEntrada(cuerpo: unknown): Resultado {
  const datos = (cuerpo ?? {}) as Record<string, unknown>;

  const mensaje = texto(datos.texto);
  if (mensaje.length === 0) {
    return { ok: false, error: "Escribí tu pregunta." };
  }
  if (mensaje.length > MAX_MENSAJE) {
    return {
      ok: false,
      error: `La pregunta quedó muy larga: hasta ${MAX_MENSAJE} caracteres.`,
    };
  }

  const consultaId = texto(datos.consultaId);
  if (consultaId && !RE_UUID.test(consultaId)) {
    return { ok: false, error: "No pudimos seguir esa conversación." };
  }

  return {
    ok: true,
    datos: {
      consultaId,
      texto: mensaje,
      pagina: texto(datos.pagina).slice(0, MAX_PAGINA),
    },
  };
}

/**
 * ¿Se agotó la conversación? A partir de acá se deriva y no se contesta más.
 *
 * Pregunta si entra otro turno entero —la pregunta y su respuesta son dos
 * renglones—, no si ya está lleno: el `check` de la tabla es sobre el hilo
 * guardado, y un turno que arranca con 39 renglones lo dejaría en 41.
 */
export function hiloLleno(hilo: MensajeConsulta[]): boolean {
  return hilo.length + 2 > MAX_HILO;
}

/** Lo que se le dice a quien llegó al tope, con el WhatsApp al lado. */
export const AVISO_LLENO =
  "Esta conversación ya dio para largo y no quiero hacerte perder tiempo: " +
  "escribinos por WhatsApp y te contesta alguien de la casa.";

export const ESTADOS: { valor: ConsultaEstado; texto: string }[] = [
  { valor: "abierta", texto: "Abierta" },
  { valor: "derivada", texto: "Para contestar" },
  { valor: "resuelta", texto: "Resuelta" },
];

export function esEstadoConsulta(valor: unknown): valor is ConsultaEstado {
  return valor === "abierta" || valor === "derivada" || valor === "resuelta";
}

export function textoDeEstado(estado: ConsultaEstado): string {
  return ESTADOS.find((e) => e.valor === estado)?.texto ?? estado;
}

/** La primera pregunta de la conversación, que es con lo que se la lista. */
export function asuntoDe(hilo: MensajeConsulta[]): string {
  const primera = hilo.find((m) => m.rol === "persona");
  return primera?.texto ?? "(sin preguntas)";
}
