"use server";

import { revalidatePath } from "next/cache";
import { abrirSesion, cerrarSesion, haySesion } from "@/lib/admin";
import {
  cambiarEstadoCompra,
  cambiarEstadoReserva,
  guardarHorarios,
  type CompraEstado,
  type Horario,
  type ReservaEstado,
} from "@/lib/db";
import { DIAS, esHorarioArea, validarSemana } from "@/lib/horarios";

/**
 * Todo lo que el panel escribe pasa por acá.
 *
 * Una server action es un endpoint más, así que cada una vuelve a preguntar por
 * la sesión: que la página no se haya renderizado no alcanza como permiso.
 */

export type Respuesta = { ok: boolean; mensaje: string } | null;

const SIN_SESION: Respuesta = {
  ok: false,
  mensaje: "Se cerró la sesión. Recargá la página y volvé a entrar.",
};

const texto = (valor: FormDataEntryValue | null) =>
  typeof valor === "string" ? valor.trim() : "";

export async function ingresar(_previo: Respuesta, datos: FormData): Promise<Respuesta> {
  const clave = texto(datos.get("clave"));
  if (!clave) return { ok: false, mensaje: "Escribí la clave." };

  if (!(await abrirSesion(clave))) {
    return { ok: false, mensaje: "Esa clave no es." };
  }

  revalidatePath("/admin", "layout");
  return { ok: true, mensaje: "" };
}

export async function salir(): Promise<void> {
  await cerrarSesion();
  revalidatePath("/admin", "layout");
}

const ESTADOS: ReservaEstado[] = ["pendiente", "confirmada", "cancelada"];

/** Confirmar o cancelar una reserva desde el listado. */
export async function cambiarEstado(datos: FormData): Promise<void> {
  if (!(await haySesion())) return;

  const id = texto(datos.get("id"));
  const estado = texto(datos.get("estado")) as ReservaEstado;
  if (!id || !ESTADOS.includes(estado)) return;

  await cambiarEstadoReserva(id, estado);
  revalidatePath("/admin/reservas");
  revalidatePath("/admin");
}

const ESTADOS_COMPRA: CompraEstado[] = ["pendiente", "pagada", "entregada", "cancelada"];

/** Marcar una compra como entregada, cancelarla o volverla a pagada. */
export async function cambiarEstadoDeCompra(datos: FormData): Promise<void> {
  if (!(await haySesion())) return;

  const id = texto(datos.get("id"));
  const estado = texto(datos.get("estado")) as CompraEstado;
  if (!id || !ESTADOS_COMPRA.includes(estado)) return;

  await cambiarEstadoCompra(id, estado);
  revalidatePath("/admin/compras");
  revalidatePath("/admin");
}

/** Guarda la semana completa de un área: es lo que manda el formulario. */
export async function guardarSemana(_previo: Respuesta, datos: FormData): Promise<Respuesta> {
  if (!(await haySesion())) return SIN_SESION;

  const area = texto(datos.get("area"));
  if (!esHorarioArea(area)) return { ok: false, mensaje: "No sabemos de qué área es ese horario." };

  const entradas: Horario[] = DIAS.map(({ dia }) => ({
    area,
    dia,
    abierto: datos.get(`abierto-${dia}`) === "on",
    desde: texto(datos.get(`desde-${dia}`)),
    hasta: texto(datos.get(`hasta-${dia}`)),
    nota: texto(datos.get(`nota-${dia}`)),
  }));

  const validacion = validarSemana(area, entradas);
  if (!validacion.ok) return { ok: false, mensaje: validacion.error };

  try {
    await guardarHorarios(area, validacion.semana);
  } catch (error) {
    console.error("No se pudieron guardar los horarios", error);
    return { ok: false, mensaje: "No pudimos guardar los horarios. Probá de nuevo." };
  }

  revalidatePath("/admin/horarios");
  return { ok: true, mensaje: "Horarios guardados." };
}
