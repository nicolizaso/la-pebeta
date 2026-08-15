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

const MOMENTO = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  // de 0 a 23, como el resto de los horarios del sitio
  hourCycle: "h23",
  timeZone: "America/Argentina/Buenos_Aires",
});

/**
 * "21 ago, 14:35" — para lo que se guarda con hora exacta, como el momento en
 * que entró una compra. Va en hora de Los Cardales, no en la del server.
 */
export function fechaHora(iso: string): string {
  return MOMENTO.format(new Date(iso));
}
