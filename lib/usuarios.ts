import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";
import type { Usuario } from "./db";

/**
 * Las reglas de una cuenta: cómo se escribe un mail, qué es una contraseña
 * aceptable y cómo se guarda.
 *
 * Este módulo usa `node:crypto`, así que es sólo del server: lo llaman la API
 * de reservas, la de compras y las acciones del perfil. Lo que necesita el
 * navegador para validar antes de mandar vive en `lib/reservas.ts`.
 *
 * Una cuenta nace sin contraseña —el hash vacío— y entra sólo con el mail. La
 * contraseña se pone después, desde el perfil, y a partir de ahí es la única
 * forma de entrar a esa cuenta.
 */

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** El mail siempre en minúsculas y sin espacios: es la llave de la cuenta. */
export function normalizarEmail(valor: unknown): string {
  return typeof valor === "string" ? valor.trim().toLowerCase() : "";
}

export function esEmail(valor: string): boolean {
  return valor.length <= 120 && RE_EMAIL.test(valor);
}

/** ¿Esta cuenta ya se puso una contraseña? */
export function tieneContrasena(usuario: Usuario): boolean {
  return usuario.password_hash !== "";
}

const RE_TELEFONO = /^[\d\s+()-]{6,30}$/;

type Contacto = { ok: true; datos: { nombre: string; telefono: string } } | { ok: false; error: string; campo: string };

/**
 * El nombre y el teléfono de una cuenta, corregidos desde el perfil. Son los
 * mismos que pide una reserva, porque son para lo mismo: con eso la casa llama
 * para confirmar.
 */
export function validarContacto(nombre: string, telefono: string): Contacto {
  const limpio = nombre.trim();
  if (limpio.length < 2 || limpio.length > 80) {
    return { ok: false, error: "Escribí tu nombre y apellido.", campo: "nombre" };
  }

  const linea = telefono.trim();
  if (!RE_TELEFONO.test(linea)) {
    return { ok: false, error: "Ese teléfono no parece válido.", campo: "telefono" };
  }

  return { ok: true, datos: { nombre: limpio, telefono: linea } };
}

export const MIN_CONTRASENA = 8;
const MAX_CONTRASENA = 200;

type Revision = { ok: true } | { ok: false; error: string; campo: string };

/** Lo que se le pide a una contraseña nueva, y que las dos veces sean la misma. */
export function validarContrasena(nueva: string, repetida: string): Revision {
  if (nueva.length < MIN_CONTRASENA) {
    return {
      ok: false,
      error: `La contraseña necesita al menos ${MIN_CONTRASENA} caracteres.`,
      campo: "nueva",
    };
  }
  if (nueva.length > MAX_CONTRASENA) {
    return { ok: false, error: "Esa contraseña es demasiado larga.", campo: "nueva" };
  }
  if (nueva !== repetida) {
    return { ok: false, error: "Las dos contraseñas no son iguales.", campo: "repetida" };
  }
  return { ok: true };
}

/* ---------- cómo se guarda ----------
   scrypt, que viene con Node: sal propia por cuenta y el costo suficiente para
   que probar contraseñas de a millones no sea gratis. El formato guarda los
   parámetros adelante, así que subirlos el día de mañana no invalida lo que ya
   está guardado. */

const COSTO = 16384;
const BLOQUE = 8;
const PARALELO = 1;
const LARGO = 64;

/** `scrypt` con promesa, que es como se lo usa acá. */
function derivar(
  clave: string,
  sal: Buffer,
  largo: number,
  opciones: ScryptOptions
): Promise<Buffer> {
  return new Promise((resolver, rechazar) => {
    scrypt(clave.normalize("NFKC"), sal, largo, opciones, (error, derivada) => {
      if (error) rechazar(error);
      else resolver(derivada);
    });
  });
}

export async function hashDeContrasena(clave: string): Promise<string> {
  const sal = randomBytes(16);
  const derivada = await derivar(clave, sal, LARGO, { N: COSTO, r: BLOQUE, p: PARALELO });

  return `scrypt$${COSTO}$${BLOQUE}$${PARALELO}$${sal.toString("hex")}$${derivada.toString("hex")}`;
}

/** ¿Es ésta la contraseña de esa cuenta? Falso si la cuenta no tiene ninguna. */
export async function esLaContrasena(clave: string, hash: string): Promise<boolean> {
  const partes = hash.split("$");
  if (partes.length !== 6 || partes[0] !== "scrypt") return false;

  const [, costo, bloque, paralelo, sal, esperada] = partes;
  const guardada = Buffer.from(esperada, "hex");
  if (guardada.length === 0) return false;

  let derivada: Buffer;
  try {
    derivada = await derivar(clave, Buffer.from(sal, "hex"), guardada.length, {
      N: Number(costo),
      r: Number(bloque),
      p: Number(paralelo),
    });
  } catch (error) {
    console.error("No se pudo revisar la contraseña", error);
    return false;
  }

  return timingSafeEqual(derivada, guardada);
}
