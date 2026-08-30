import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { buscarUsuario, tocarUsuario, type Usuario } from "./db";

/**
 * La sesión de quien reserva.
 *
 * Es la misma idea que la puerta del panel (`lib/admin.ts`), un escalón más
 * arriba: en vez de una clave para todos, una cookie firmada que dice de quién
 * es la sesión. No hay tabla de sesiones ni JWT de nadie —adentro va el id del
 * usuario, cuándo se abrió y una firma— porque todo lo que hay que decidir con
 * eso se decide del lado del server.
 *
 * El `epoch` es lo que permite cerrar sesiones a distancia: viaja en la cookie
 * y tiene que coincidir con el de la fila. Cambiar la contraseña le sube el
 * epoch al usuario y, con eso, todas las cookies que andaban dando vueltas
 * dejan de valer sin tener que ir a buscarlas.
 */

const COOKIE = "pebeta_usuario";
/**
 * La compañera de la de arriba: no está firmada, no dice quién es nadie y el
 * navegador puede leerla. Existe para una sola cosa —que la barra de navegación
 * muestre "Mi perfil" cuando hay sesión— sin que las páginas del sitio tengan
 * que leer cookies del lado del server, que es lo que las volvería dinámicas a
 * todas. Si quedara desfasada, lo peor que pasa es un link que lleva a la
 * puerta del perfil.
 */
const COOKIE_VISIBLE = "pebeta_sesion";
/** Treinta días: lo que dura entre una visita al campo y la siguiente. */
const DURACION = 60 * 60 * 24 * 30;

/**
 * Sin `SESION_SECRET` configurada las firmas salen con un secreto al azar que
 * vive lo que vive el proceso: en local se puede entrar al perfil sin
 * configurar nada, y lo único que pasa es que un `next dev` que se reinicia
 * pide volver a entrar. En producción hay que ponerla —si no, cada instancia
 * firma distinto y las sesiones se caen solas—; `hayClaveDeSesion()` es lo que
 * pregunta el perfil para avisarlo en pantalla.
 */
const SECRETO = process.env.SESION_SECRET || randomBytes(32).toString("hex");

export function hayClaveDeSesion(): boolean {
  return Boolean(process.env.SESION_SECRET);
}

function firma(cuerpo: string): string {
  return createHmac("sha256", SECRETO).update(cuerpo).digest("hex");
}

function igual(a: string, b: string): boolean {
  const uno = Buffer.from(a);
  const otro = Buffer.from(b);
  return uno.length === otro.length && timingSafeEqual(uno, otro);
}

/** Lo que dice la cookie, si la firma cierra. No prueba que el usuario exista. */
function leerCookie(valor: string): { id: string; epoch: string } | null {
  const partes = valor.split(".");
  if (partes.length !== 3) return null;

  const [id, epoch, firmada] = partes;
  if (!id || !epoch) return null;

  return igual(firmada, firma(`${id}:${epoch}`)) ? { id, epoch } : null;
}

/**
 * Quién está mirando la página, o null.
 *
 * Vuelve a la base en cada llamada a propósito: la cookie dice quién dice ser,
 * pero quién es —y si su sesión sigue valiendo— lo dice la fila.
 */
export async function usuarioActual(): Promise<Usuario | null> {
  const cookie = (await cookies()).get(COOKIE)?.value ?? "";
  if (!cookie) return null;

  const leida = leerCookie(cookie);
  if (!leida) return null;

  let usuario: Usuario | null;
  try {
    usuario = await buscarUsuario(leida.id);
  } catch (error) {
    console.error("No se pudo leer la sesión", error);
    return null;
  }
  if (!usuario) return null;

  // la sesión es de antes del último cambio de contraseña: ya no vale
  if (String(new Date(usuario.sesion_epoch).getTime()) !== leida.epoch) return null;

  return usuario;
}

/** Abre la sesión de un usuario. La cookie caduca con su epoch. */
export async function abrirSesion(usuario: Usuario): Promise<void> {
  const epoch = String(new Date(usuario.sesion_epoch).getTime());
  const cuerpo = `${usuario.id}.${epoch}`;

  const cajita = await cookies();
  cajita.set(COOKIE, `${cuerpo}.${firma(`${usuario.id}:${epoch}`)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION,
  });
  cajita.set(COOKIE_VISIBLE, "1", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION,
  });

  try {
    await tocarUsuario(usuario.id);
  } catch (error) {
    // que no se pueda anotar la visita no es motivo para no dejar entrar
    console.error("No se pudo anotar el último acceso", error);
  }
}

export async function cerrarSesion(): Promise<void> {
  const cajita = await cookies();
  cajita.delete({ name: COOKIE, path: "/" });
  cajita.delete({ name: COOKIE_VISIBLE, path: "/" });
}
