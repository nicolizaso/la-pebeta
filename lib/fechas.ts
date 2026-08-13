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
