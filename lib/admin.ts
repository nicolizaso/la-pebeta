import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * La puerta del panel.
 *
 * Es a propósito lo más chico posible: una clave en `ADMIN_PASSWORD` y una
 * cookie firmada con su hash, nada de usuarios ni de tabla de sesiones. Alcanza
 * para que el listado de reservas —que tiene teléfonos y mails— no quede
 * abierto en una URL adivinable, y el día que haya varias personas cargando
 * horarios se reemplaza por auth de verdad sin tocar las páginas: todas
 * preguntan por `haySesion()`.
 *
 * Sin `ADMIN_PASSWORD` configurada el panel queda abierto y lo avisa en
 * pantalla, así en local se entra sin fricción.
 */

const COOKIE = "pebeta_admin";
/** Doce horas: un turno de trabajo, y al día siguiente se vuelve a entrar. */
const DURACION = 60 * 60 * 12;

function clave(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

/** ¿Hay clave configurada? Si no la hay, el panel no pide nada. */
export function panelAbierto(): boolean {
  return clave() === "";
}

/** El valor de la cookie: el hash de la clave, nunca la clave. */
function token(secreto: string): string {
  return createHash("sha256").update(`pebeta:${secreto}`).digest("hex");
}

function igual(a: string, b: string): boolean {
  const uno = Buffer.from(a);
  const otro = Buffer.from(b);
  return uno.length === otro.length && timingSafeEqual(uno, otro);
}

export async function haySesion(): Promise<boolean> {
  if (panelAbierto()) return true;
  const cookie = (await cookies()).get(COOKIE)?.value ?? "";
  return cookie !== "" && igual(cookie, token(clave()));
}

/** Devuelve false si la clave no es la que va. */
export async function abrirSesion(intento: string): Promise<boolean> {
  if (!igual(token(intento), token(clave()))) return false;

  (await cookies()).set(COOKIE, token(clave()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: DURACION,
  });
  return true;
}

export async function cerrarSesion(): Promise<void> {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}
