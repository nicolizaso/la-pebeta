import type { DatosNota, Nota } from "./db";
import { normalizar } from "./tienda";

/**
 * Las reglas del blog, del mismo lado que las del catálogo: las usa el
 * formulario del panel —para avisar antes de mandar— y la server action, que es
 * la que realmente decide. Las mismas cotas están como constraints de
 * `pebeta_notas`, así que acá están para poder explicar qué está mal, no para
 * ser la única defensa.
 *
 * Este módulo lo importa código de cliente, así que no puede tocar la base ni
 * el manifiesto de fotos: las fotos que hay se le pasan como lista.
 */

export const MAX_TITULO = 140;
export const MAX_BAJADA = 300;
export const MAX_CUERPO = 20_000;
export const MAX_AUTOR = 60;
/** El slug entra en `^[a-z0-9][a-z0-9-]{1,79}$`. */
export const MAX_SLUG = 80;

/**
 * El slug de una nota a partir de su título: "La primera cosecha" queda como
 * `la-primera-cosecha`. Se propone al escribir el título y después se puede
 * corregir a mano, pero una vez publicada conviene no tocarlo: es la URL, y
 * cambiarla rompe el link que alguien haya guardado.
 */
export function slugDeTitulo(titulo: string): string {
  return normalizar(titulo)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG)
    .replace(/-+$/g, "");
}

/**
 * Dónde está una nota. No es una columna: sale de cruzar `publicada` con la
 * fecha, que es lo mismo que hace la policy de la tabla.
 *
 * - `borrador`: cargada y guardada, no se ve.
 * - `programada`: lista para salir, esperando que llegue el día.
 * - `publicada`: está en el blog.
 */
export type EstadoNota = "borrador" | "programada" | "publicada";

export function estadoDeNota(nota: Pick<Nota, "publicada" | "fecha">, ahora = Date.now()): EstadoNota {
  if (!nota.publicada) return "borrador";
  return new Date(nota.fecha).getTime() > ahora ? "programada" : "publicada";
}

/** Lo que llega del formulario: todo texto, como sale de un FormData. */
export type NotaCruda = {
  titulo: string;
  slug: string;
  bajada: string;
  cuerpo: string;
  autor: string;
  foto: string;
  publicada: boolean;
  /** Ya resuelta a ISO por quien llama: el input manda hora local, sin zona. */
  fecha: string;
};

type ResultadoNota = { ok: true; datos: DatosNota } | { ok: false; error: string; campo: string };

/**
 * Valida una nota entera. `fotos` son las claves del manifiesto: la lista la
 * arma quien llama, que es el único que puede mirarlo.
 */
export function validarNota(crudo: NotaCruda, { fotos }: { fotos: string[] }): ResultadoNota {
  const titulo = crudo.titulo.trim();
  if (titulo.length < 3 || titulo.length > MAX_TITULO) {
    return { ok: false, error: "El título de la nota va entre 3 y 140 caracteres.", campo: "titulo" };
  }

  const slug = crudo.slug.trim();
  if (!/^[a-z0-9][a-z0-9-]{1,79}$/.test(slug)) {
    return {
      ok: false,
      error: "La dirección de la nota va en minúsculas, con números y guiones. Probá con otro título.",
      campo: "slug",
    };
  }

  const bajada = crudo.bajada.trim();
  if (bajada.length > MAX_BAJADA) {
    return { ok: false, error: "La bajada quedó muy larga.", campo: "bajada" };
  }

  const cuerpo = crudo.cuerpo.trim();
  if (!cuerpo) {
    return { ok: false, error: "Escribí la nota: sin texto no hay nada que publicar.", campo: "cuerpo" };
  }
  if (cuerpo.length > MAX_CUERPO) {
    return { ok: false, error: "La nota quedó muy larga. Partila en dos.", campo: "cuerpo" };
  }

  const autor = crudo.autor.trim();
  if (autor.length > MAX_AUTOR) {
    return { ok: false, error: "El nombre de quien firma quedó muy largo.", campo: "autor" };
  }

  const foto = crudo.foto.trim();
  if (foto && !fotos.includes(foto)) {
    return { ok: false, error: "Esa foto no está en el manifiesto.", campo: "foto" };
  }

  const fecha = new Date(crudo.fecha);
  if (Number.isNaN(fecha.getTime())) {
    return { ok: false, error: "Esa fecha no se entiende. Elegí día y hora.", campo: "fecha" };
  }

  return {
    ok: true,
    datos: {
      titulo,
      slug,
      bajada,
      cuerpo,
      autor,
      foto,
      publicada: crudo.publicada,
      fecha: fecha.toISOString(),
    },
  };
}

/**
 * El cuerpo, partido en lo que se va a dibujar. La nota se escribe en un
 * textarea, no en un editor, así que la sintaxis es la que alguien usaría sin
 * que se la expliquen: un renglón en blanco separa párrafos, `##` al principio
 * es un subtítulo y `>` una cita.
 */
export type Bloque = { tipo: "parrafo" | "subtitulo" | "cita"; texto: string };

export function bloquesDelCuerpo(cuerpo: string): Bloque[] {
  return cuerpo
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((crudo) => crudo.trim())
    .filter(Boolean)
    .map((texto) => {
      if (texto.startsWith("##")) {
        return { tipo: "subtitulo" as const, texto: texto.replace(/^#+\s*/, "") };
      }
      if (texto.startsWith(">")) {
        return {
          tipo: "cita" as const,
          // una cita de varios renglones sigue siendo una: cada uno trae su >
          texto: texto
            .split("\n")
            .map((linea) => linea.replace(/^>\s?/, ""))
            .join(" ")
            .trim(),
        };
      }
      return { tipo: "parrafo" as const, texto };
    });
}

/** La línea que se muestra en el listado: la bajada, o el principio de la nota. */
export function resumenDe(nota: Pick<Nota, "bajada" | "cuerpo">): string {
  if (nota.bajada) return nota.bajada;

  const primero = bloquesDelCuerpo(nota.cuerpo).find((bloque) => bloque.tipo === "parrafo");
  if (!primero) return "";

  return primero.texto.length > 180 ? `${primero.texto.slice(0, 177).trimEnd()}…` : primero.texto;
}

/** Doscientas palabras por minuto, redondeando para arriba: nunca "0 min". */
export function minutosDeLectura(cuerpo: string): number {
  const palabras = cuerpo.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}
