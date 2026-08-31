import type { Reserva, ReservaTipo } from "./db";
import { desdeElReloj } from "./fechas";
import { buscarPaseo, esPaseoId } from "./paseos";

/**
 * Las reglas de una reserva viven acá porque las usan los dos lados: el
 * formulario, para no ofrecer lo que no existe, y la API, que es la que
 * realmente decide.
 */

export const ZONA = "America/Argentina/Buenos_Aires";

/**
 * No todo abre los mismos días, así que cada tipo lleva los suyos (`dias`, en
 * getDay): el restaurant atiende de jueves a domingo, pero los paseos del
 * campo salen viernes, sábados y domingos. La tabla tiene la misma regla.
 */
export const REGLAS: Record<
  ReservaTipo,
  { etiqueta: string; personasMax: number; horas: string[]; dias: number[]; diasTexto: string }
> = {
  paseos: {
    etiqueta: "Paseo por el campo",
    personasMax: 15,
    horas: ["11:00"],
    dias: [0, 5, 6],
    diasTexto: "Viernes, sábados y domingos",
  },
  restaurant: {
    etiqueta: "Mesa en el restaurant",
    personasMax: 10,
    horas: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00"],
    dias: [0, 4, 5, 6],
    diasTexto: "Jueves a domingo",
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
  /** Cuál paseo. Vacío cuando lo que se reserva es una mesa. */
  paseo: string;
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

  // un paseo es uno de los dos; una mesa no lleva ninguno
  let paseo = "";
  if (tipo === "paseos") {
    if (!esPaseoId(datos.paseo)) {
      return { ok: false, error: "Elegí cuál de los dos paseos querés.", campo: "paseo" };
    }
    paseo = datos.paseo;
  }

  const nombre = texto(datos.nombre);
  if (nombre.length < 2 || nombre.length > 80) {
    return { ok: false, error: "Escribí tu nombre y apellido.", campo: "nombre" };
  }

  const telefono = texto(datos.telefono);
  if (!RE_TELEFONO.test(telefono)) {
    return { ok: false, error: "Dejanos un teléfono para confirmarte.", campo: "telefono" };
  }

  // el mail dejó de ser opcional: es con lo que se arma la cuenta y con lo que
  // después se entra al perfil a ver esta misma reserva
  const email = texto(datos.email).toLowerCase();
  if (!email) {
    return { ok: false, error: "Dejanos tu mail: con eso vas a ver tu reserva.", campo: "email" };
  }
  if (email.length > 120 || !RE_EMAIL.test(email)) {
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
  if (!reglas.dias.includes(dia)) {
    const cuando = reglas.diasTexto.toLowerCase();
    return {
      ok: false,
      error:
        tipo === "paseos"
          ? `Los paseos salen ${cuando}.`
          : `Abrimos de ${cuando}.`,
      campo: "fecha",
    };
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

  return {
    ok: true,
    datos: { tipo, paseo, nombre, telefono, email, fecha, hora, personas, comentarios },
  };
}

/**
 * Cómo se llama esta reserva en un listado: para una mesa, la etiqueta de su
 * tipo; para un paseo, cuál de los dos. Las reservas viejas —tomadas antes de
 * que se pudiera elegir— no tienen paseo y caen en la etiqueta genérica.
 */
export function nombreDeReserva(reserva: Pick<Reserva, "tipo" | "paseo">): string {
  if (reserva.tipo === "paseos") {
    const paseo = buscarPaseo(reserva.paseo);
    if (paseo) return paseo.nombre;
  }
  return REGLAS[reserva.tipo].etiqueta;
}

/* ---------- cancelar desde el perfil ----------
   La casa cancela cuando quiere, desde el panel. Quien reservó puede hacerlo
   solo hasta unas horas antes: después ya hay una mesa levantada o un paseo
   armado, y eso se habla. */

/** Cuánto tiempo antes se puede soltar una reserva sin llamar. */
export const HORAS_PARA_CANCELAR = 24;

/** Cuándo empieza la reserva, como instante. Null si la fila vino rara. */
export function momentoDe(reserva: Pick<Reserva, "fecha" | "hora">): Date | null {
  const iso = desdeElReloj(`${reserva.fecha}T${reserva.hora}`);
  return iso ? new Date(iso) : null;
}

type Cancelacion = { ok: true } | { ok: false; error: string };

/**
 * ¿Puede esta persona cancelar esta reserva ahora?
 *
 * La usan la vista del perfil —para mostrar el botón o explicar por qué no
 * está— y la action que cancela de verdad, que vuelve a preguntar porque una
 * server action es un endpoint como cualquier otro.
 */
export function sePuedeCancelar(reserva: Reserva, ahora = new Date()): Cancelacion {
  if (reserva.estado === "cancelada") {
    return { ok: false, error: "Esa reserva ya está cancelada." };
  }

  const momento = momentoDe(reserva);
  if (!momento) return { ok: false, error: "No pudimos leer la fecha de esa reserva." };

  if (momento.getTime() <= ahora.getTime()) {
    return { ok: false, error: "Esa reserva ya pasó." };
  }

  const horas = (momento.getTime() - ahora.getTime()) / 3_600_000;
  if (horas < HORAS_PARA_CANCELAR) {
    return {
      ok: false,
      error: `Faltan menos de ${HORAS_PARA_CANCELAR} horas. Escribinos por WhatsApp y la damos de baja nosotros.`,
    };
  }

  return { ok: true };
}
