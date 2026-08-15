/**
 * Las fechas del panel se guardan como YYYY-MM-DD y se muestran en castellano.
 * Se parsean al mediodía a propósito: así el día no se corre por la zona
 * horaria del server, igual que en `lib/reservas.ts`.
 */

const CORTA = new Intl.DateTimeFormat("es-AR", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const LARGA = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** "jue 21 ago" */
export function fechaCorta(fecha: string): string {
  return CORTA.format(new Date(`${fecha}T12:00:00`));
}

/** "jueves 21 de agosto" */
export function fechaLarga(fecha: string): string {
  return LARGA.format(new Date(`${fecha}T12:00:00`));
}

/** La hora de la casa. Todo lo que se guarda con hora exacta se lee acá. */
export const ZONA = "America/Argentina/Buenos_Aires";

const MOMENTO = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  // de 0 a 23, como el resto de los horarios del sitio
  hourCycle: "h23",
  timeZone: ZONA,
});

/**
 * "21 ago, 14:35" — para lo que se guarda con hora exacta, como el momento en
 * que entró una compra. Va en hora de Los Cardales, no en la del server.
 */
export function fechaHora(iso: string): string {
  return MOMENTO.format(new Date(iso));
}

const DIA = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: ZONA,
});

/** "21 de agosto de 2026" — la firma de una nota del blog. */
export function fechaDelDia(iso: string): string {
  return DIA.format(new Date(iso));
}

/**
 * Las piezas de un instante en la hora de la casa, como las escribiría un
 * reloj de Los Cardales.
 */
function partes(momento: Date): Record<string, string> {
  const reloj = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: ZONA,
    timeZoneName: "longOffset",
  });

  return Object.fromEntries(reloj.formatToParts(momento).map(({ type, value }) => [type, value]));
}

/**
 * Un instante como lo espera un `<input type="datetime-local">`:
 * "2026-08-21T14:35", ya pasado a la hora de la casa.
 */
export function paraElReloj(iso: string): string {
  const momento = new Date(iso);
  if (Number.isNaN(momento.getTime())) return "";

  const { year, month, day, hour, minute } = partes(momento);
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * El camino de vuelta: lo que escribió alguien en un `datetime-local`, leído
 * como hora de Los Cardales y guardado como instante.
 *
 * El input no manda zona —"2026-08-21T14:35" y nada más—, así que hay que
 * elegir una: si se la dejara al server, una nota programada para las nueve de
 * la mañana saldría a las seis, porque en Vercel el reloj está en UTC. Se
 * resuelve en dos pasos: se lee el texto como si fuera UTC para saber en qué
 * momento del año cae, se le pregunta a la zona qué desfasaje tenía ese día
 * —Argentina hace años que no mueve las agujas, pero preguntarlo no cuesta— y
 * recién ahí se arma el instante de verdad.
 */
export function desdeElReloj(valor: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(valor)) return null;

  const tentativo = new Date(`${valor}:00Z`);
  if (Number.isNaN(tentativo.getTime())) return null;

  // "GMT-03:00" → "-03:00"; en el borde del año nuevo la zona podría no tener
  // nombre de offset, y ahí no queda más que confiar en el paso tentativo
  const offset = partes(tentativo).timeZoneName?.replace("GMT", "") || "Z";
  const momento = new Date(`${valor}:00${offset}`);
  return Number.isNaN(momento.getTime()) ? null : momento.toISOString();
}
