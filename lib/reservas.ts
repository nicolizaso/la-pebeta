import type { ReservaTipo } from "./db";

/**
 * Las reglas de una reserva viven acá porque las usan los dos lados: el
 * formulario, para no ofrecer lo que no existe, y la API, que es la que
 * realmente decide.
 */

export const ZONA = "America/Argentina/Buenos_Aires";

/** Domingo, jueves, viernes y sábado (getDay). */
export const DIAS_ABIERTOS = [0, 4, 5, 6];

export const REGLAS: Record<
  ReservaTipo,
  { etiqueta: string; personasMax: number; horas: string[] }
> = {
  paseos: {
    etiqueta: "Paseo por el campo",
    personasMax: 15,
    horas: ["11:00"],
  },
  restaurant: {
    etiqueta: "Mesa en el restaurant",
    personasMax: 10,
    horas: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00"],
  },
};

export function esReservaTipo(valor: unknown): valor is ReservaTipo {
  return valor === "paseos" || valor === "restaurant";
}

/** Hoy en Los Cardales, no en la zona horaria del server. */
export function hoyISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(new Date());
}

export type EntradaReserva = {
  tipo: ReservaTipo;
  nombre: string;
  telefono: string;
  email: string;
  fecha: string;
  hora: string;
  personas: number;
  comentarios: string;
};

type Resultado =
  | { ok: true; datos: EntradaReserva }
  | { ok: false; error: string; campo?: string };

const RE_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RE_TELEFONO = /^[\d\s+()-]{6,30}$/;

const texto = (valor: unknown) => (typeof valor === "string" ? valor.trim() : "");

export function validarReserva(cuerpo: unknown): Resultado {
  const datos = (cuerpo ?? {}) as Record<string, unknown>;

  const tipo = datos.tipo;
  if (!esReservaTipo(tipo)) {
    return { ok: false, error: "Elegí si querés reservar un paseo o una mesa.", campo: "tipo" };
  }
  const reglas = REGLAS[tipo];

  const nombre = texto(datos.nombre);
  if (nombre.length < 2 || nombre.length > 80) {
    return { ok: false, error: "Escribí tu nombre y apellido.", campo: "nombre" };
  }

  const telefono = texto(datos.telefono);
  if (!RE_TELEFONO.test(telefono)) {
    return { ok: false, error: "Dejanos un teléfono para confirmarte.", campo: "telefono" };
  }

  const email = texto(datos.email);
  if (email && !RE_EMAIL.test(email)) {
    return { ok: false, error: "Ese mail no parece válido.", campo: "email" };
  }

  const fecha = texto(datos.fecha);
  if (!RE_FECHA.test(fecha)) {
    return { ok: false, error: "Elegí una fecha.", campo: "fecha" };
  }
  if (fecha < hoyISO()) {
    return { ok: false, error: "Esa fecha ya pasó.", campo: "fecha" };
  }
  // el mediodía evita que el parseo se corra de día por la zona horaria
  const dia = new Date(`${fecha}T12:00:00`).getDay();
  if (!DIAS_ABIERTOS.includes(dia)) {
    return { ok: false, error: "Abrimos de jueves a domingo.", campo: "fecha" };
  }

  const hora = texto(datos.hora) || reglas.horas[0];
  if (!reglas.horas.includes(hora)) {
    return { ok: false, error: "Ese horario no está disponible.", campo: "hora" };
  }

  const personas = Number(datos.personas);
  if (!Number.isInteger(personas) || personas < 1 || personas > reglas.personasMax) {
    return {
      ok: false,
      error: `Aceptamos de 1 a ${reglas.personasMax} personas por reserva.`,
      campo: "personas",
    };
  }

  const comentarios = texto(datos.comentarios);
  if (comentarios.length > 500) {
    return { ok: false, error: "El comentario quedó muy largo.", campo: "comentarios" };
  }

  return { ok: true, datos: { tipo, nombre, telefono, email, fecha, hora, personas, comentarios } };
}
