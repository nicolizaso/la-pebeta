"use server";

import { revalidatePath } from "next/cache";
import {
  buscarReservaDe,
  buscarUsuarioPorEmail,
  cambiarEstadoReserva,
  guardarContrasena,
  guardarDatosDeUsuario,
} from "@/lib/db";
import { sePuedeCancelar } from "@/lib/reservas";
import { abrirSesion, cerrarSesion, usuarioActual } from "@/lib/sesion";
import {
  esEmail,
  esLaContrasena,
  hashDeContrasena,
  normalizarEmail,
  tieneContrasena,
  validarContacto,
  validarContrasena,
} from "@/lib/usuarios";

/**
 * Todo lo que el perfil escribe pasa por acá.
 *
 * Igual que en el panel, cada action vuelve a preguntar quién es: que la página
 * se haya renderizado no alcanza como permiso, porque una server action es un
 * endpoint más y se puede llamar sin pasar por la pantalla. Y por la misma
 * razón el id de una reserva nunca alcanza para tocarla: se busca por reserva
 * *y* por cuenta, así que pedir la de otra persona devuelve nada.
 */

export type Respuesta =
  | { ok: boolean; mensaje: string; campo?: string; pideContrasena?: boolean }
  | null;

const SIN_SESION: Respuesta = {
  ok: false,
  mensaje: "Se cerró la sesión. Recargá la página y volvé a entrar.",
};

const texto = (valor: FormDataEntryValue | null) =>
  typeof valor === "string" ? valor.trim() : "";

/** El texto tal cual se escribió: una contraseña puede empezar o terminar con un espacio. */
const crudo = (valor: FormDataEntryValue | null) => (typeof valor === "string" ? valor : "");

/**
 * La puerta del perfil, en uno o dos pasos según la cuenta.
 *
 * Una cuenta que todavía no se puso contraseña entra con sólo el mail: es la
 * misma que se abrió sola al reservar y no habría con qué más. Una que sí la
 * tiene pide la contraseña, y ahí el primer intento vuelve con
 * `pideContrasena` para que el formulario muestre el campo.
 */
export async function entrar(_previo: Respuesta, datos: FormData): Promise<Respuesta> {
  const email = normalizarEmail(datos.get("email"));
  if (!esEmail(email)) {
    return { ok: false, mensaje: "Escribí el mail con el que reservaste.", campo: "email" };
  }

  let usuario;
  try {
    usuario = await buscarUsuarioPorEmail(email);
  } catch (error) {
    console.error("No se pudo buscar la cuenta", error);
    return { ok: false, mensaje: "No pudimos abrir tu cuenta. Probá de nuevo en un minuto." };
  }

  if (!usuario) {
    return {
      ok: false,
      mensaje: "No tenemos ninguna cuenta con ese mail. Se abre sola cuando reservás.",
      campo: "email",
    };
  }

  if (tieneContrasena(usuario)) {
    const clave = crudo(datos.get("clave"));
    if (!clave) {
      return { ok: false, mensaje: "", campo: "clave", pideContrasena: true };
    }
    if (!(await esLaContrasena(clave, usuario.password_hash))) {
      return {
        ok: false,
        mensaje: "Esa contraseña no es.",
        campo: "clave",
        pideContrasena: true,
      };
    }
  }

  await abrirSesion(usuario);
  revalidatePath("/perfil");
  return { ok: true, mensaje: "" };
}

export async function salir(): Promise<void> {
  await cerrarSesion();
  revalidatePath("/perfil");
}

/** Nombre y teléfono: lo que la casa usa para llamar y confirmar. */
export async function guardarMisDatos(_previo: Respuesta, datos: FormData): Promise<Respuesta> {
  const usuario = await usuarioActual();
  if (!usuario) return SIN_SESION;

  const validacion = validarContacto(texto(datos.get("nombre")), texto(datos.get("telefono")));
  if (!validacion.ok) {
    return { ok: false, mensaje: validacion.error, campo: validacion.campo };
  }

  try {
    await guardarDatosDeUsuario(usuario.id, validacion.datos);
  } catch (error) {
    console.error("No se pudieron guardar los datos", error);
    return { ok: false, mensaje: "No pudimos guardar tus datos. Probá de nuevo." };
  }

  revalidatePath("/perfil");
  return { ok: true, mensaje: "Datos guardados." };
}

/**
 * Poner la primera contraseña, o cambiar la que hay.
 *
 * Guardarla le sube el epoch a la cuenta, así que todas las sesiones abiertas
 * dejan de valer —lo que echa a cualquiera que hubiera entrado con sólo el
 * mail— y por eso la de acá se vuelve a abrir en el momento: quien la está
 * poniendo no tiene por qué salir a la calle.
 */
export async function ponerMiContrasena(
  _previo: Respuesta,
  datos: FormData
): Promise<Respuesta> {
  const usuario = await usuarioActual();
  if (!usuario) return SIN_SESION;

  // cambiarla exige la que estaba: la sesión sola no alcanza para eso
  if (tieneContrasena(usuario)) {
    const actual = crudo(datos.get("actual"));
    if (!actual) {
      return { ok: false, mensaje: "Escribí tu contraseña actual.", campo: "actual" };
    }
    if (!(await esLaContrasena(actual, usuario.password_hash))) {
      return { ok: false, mensaje: "Esa no es tu contraseña actual.", campo: "actual" };
    }
  }

  const nueva = crudo(datos.get("nueva"));
  const validacion = validarContrasena(nueva, crudo(datos.get("repetida")));
  if (!validacion.ok) {
    return { ok: false, mensaje: validacion.error, campo: validacion.campo };
  }

  let guardado;
  try {
    guardado = await guardarContrasena(usuario.id, await hashDeContrasena(nueva));
  } catch (error) {
    console.error("No se pudo guardar la contraseña", error);
    return { ok: false, mensaje: "No pudimos guardar la contraseña. Probá de nuevo." };
  }

  await abrirSesion(guardado);
  revalidatePath("/perfil");
  return {
    ok: true,
    mensaje: tieneContrasena(usuario)
      ? "Contraseña cambiada. Si habías entrado en otro dispositivo, ahí te va a pedir la nueva."
      : "Listo: desde ahora tu cuenta entra con contraseña.",
  };
}

/**
 * Cancelar una reserva propia, hasta las horas que fija `sePuedeCancelar`. La
 * casa la ve cancelada en el panel, que es de donde sale lo que hay que
 * preparar cada día.
 */
export async function cancelarMiReserva(
  _previo: Respuesta,
  datos: FormData
): Promise<Respuesta> {
  const usuario = await usuarioActual();
  if (!usuario) return SIN_SESION;

  const id = texto(datos.get("id"));
  if (!id) return { ok: false, mensaje: "No sabemos qué reserva cancelar." };

  let reserva;
  try {
    reserva = await buscarReservaDe(usuario.id, id);
  } catch (error) {
    console.error("No se pudo leer la reserva", error);
    return { ok: false, mensaje: "No pudimos leer esa reserva. Probá de nuevo." };
  }
  if (!reserva) return { ok: false, mensaje: "Esa reserva no es tuya o ya no está." };

  const permiso = sePuedeCancelar(reserva);
  if (!permiso.ok) return { ok: false, mensaje: permiso.error };

  try {
    await cambiarEstadoReserva(reserva.id, "cancelada");
  } catch (error) {
    console.error("No se pudo cancelar la reserva", error);
    return { ok: false, mensaje: "No pudimos cancelar la reserva. Probá de nuevo." };
  }

  revalidatePath("/perfil");
  revalidatePath("/admin/reservas");
  revalidatePath("/admin");
  return { ok: true, mensaje: `Cancelamos la reserva ${reserva.codigo}.` };
}
