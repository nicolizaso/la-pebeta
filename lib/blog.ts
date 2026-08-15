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
/** Cuántas etiquetas entran en una nota. La tabla tiene el mismo tope. */
export const MAX_ETIQUETAS = 6;
export const MAX_ETIQUETA = 40;

/**
 * El slug de una nota a partir de su título: "La primera cosecha" queda como
 * `la-primera-cosecha`. No hay campo para escribirlo: sale del título y listo.
 * Cuando dos títulos dan el mismo, quien guarda le agrega un número; y una vez
 * que la nota salió, el slug no se mueve más aunque le cambien el título,
 * porque es el link que alguien puede haber guardado.
 */
export function slugDeTitulo(titulo: string): string {
  return normalizar(titulo)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG)
    .replace(/-+$/g, "");
}

/**
 * Las etiquetas de una nota, como se escriben en el panel: separadas por coma.
 * La primera es la sección en la que va la nota —"La Pebeta en tu casa",
 * "Huerta en tu casa"— y las demás, temas sueltos.
 *
 * Se limpian acá: sin repetidas —"Huerta" y "huerta" son la misma—, sin vacías
 * y hasta seis.
 */
export function etiquetasDesdeTexto(texto: string): string[] {
  const vistas = new Set<string>();
  const etiquetas: string[] = [];

  for (const cruda of texto.split(",")) {
    const etiqueta = cruda.trim().replace(/\s+/g, " ");
    if (!etiqueta) continue;

    const clave = normalizar(etiqueta);
    if (vistas.has(clave)) continue;

    vistas.add(clave);
    etiquetas.push(etiqueta);
    if (etiquetas.length === MAX_ETIQUETAS) break;
  }

  return etiquetas;
}

/** Cómo se escriben en el campo del panel: "Recetas, Huerta en tu casa". */
export function etiquetasComoTexto(etiquetas: string[]): string {
  return etiquetas.join(", ");
}

/** Lo que viaja en la URL del blog: `/blog?etiqueta=huerta-en-tu-casa`. */
export function slugDeEtiqueta(etiqueta: string): string {
  return normalizar(etiqueta)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Las etiquetas que hay en el blog, ordenadas y sin repetir. */
export function etiquetasDe(notas: { etiquetas: string[] }[]): string[] {
  const vistas = new Map<string, string>();

  for (const nota of notas) {
    for (const etiqueta of nota.etiquetas) {
      const clave = slugDeEtiqueta(etiqueta);
      if (clave && !vistas.has(clave)) vistas.set(clave, etiqueta);
    }
  }

  return [...vistas.values()].sort((una, otra) => una.localeCompare(otra, "es"));
}

/**
 * La foto de una nota puede ser una clave del manifiesto o una imagen subida
 * desde el panel, que vive en el bucket de Supabase y llega como URL.
 */
export function esFotoSubida(foto: string): boolean {
  return /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/[\w./-]+$/.test(foto);
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
  /** Lo resuelve quien llama: sale del título y no hay campo para escribirlo. */
  slug: string;
  bajada: string;
  cuerpo: string;
  autor: string;
  etiquetas: string[];
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
      error: "De ese título no sale una dirección para la nota. Probá con letras y números.",
      campo: "titulo",
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

  const etiquetas = crudo.etiquetas.map((etiqueta) => etiqueta.trim()).filter(Boolean);
  if (etiquetas.length > MAX_ETIQUETAS) {
    return { ok: false, error: `Hasta ${MAX_ETIQUETAS} etiquetas por nota.`, campo: "etiquetas" };
  }
  for (const etiqueta of etiquetas) {
    if (etiqueta.length < 2 || etiqueta.length > MAX_ETIQUETA) {
      return {
        ok: false,
        error: `"${etiqueta}" no entra como etiqueta: van de 2 a ${MAX_ETIQUETA} caracteres.`,
        campo: "etiquetas",
      };
    }
    if (!slugDeEtiqueta(etiqueta)) {
      return { ok: false, error: `"${etiqueta}" no sirve como etiqueta.`, campo: "etiquetas" };
    }
  }

  const foto = crudo.foto.trim();
  if (foto && !fotos.includes(foto) && !esFotoSubida(foto)) {
    return { ok: false, error: "Esa foto no está.", campo: "foto" };
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
      etiquetas,
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
 * es un subtítulo, `>` una cita, `-` una lista y `1.` una lista numerada.
 */
export type Bloque =
  | { tipo: "parrafo" | "subtitulo" | "cita"; texto: string }
  | { tipo: "lista"; ordenada: boolean; items: string[] };

const VINETA = /^[-*•]\s+/;
const NUMERO = /^\d+[.)]\s+/;

export function bloquesDelCuerpo(cuerpo: string): Bloque[] {
  return cuerpo
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((crudo) => crudo.trim())
    .filter(Boolean)
    .map((texto): Bloque => {
      if (texto.startsWith("##")) {
        return { tipo: "subtitulo", texto: texto.replace(/^#+\s*/, "") };
      }

      if (texto.startsWith(">")) {
        return {
          tipo: "cita",
          // una cita de varios renglones sigue siendo una: cada uno trae su >
          texto: texto
            .split("\n")
            .map((linea) => linea.replace(/^>\s?/, ""))
            .join(" ")
            .trim(),
        };
      }

      // una lista es un bloque en el que todos los renglones empiezan igual;
      // si uno solo se sale, es un párrafo que arranca con un guión y listo
      const lineas = texto.split("\n").map((linea) => linea.trim()).filter(Boolean);
      for (const marca of [VINETA, NUMERO]) {
        if (lineas.length > 0 && lineas.every((linea) => marca.test(linea))) {
          return {
            tipo: "lista",
            ordenada: marca === NUMERO,
            items: lineas.map((linea) => linea.replace(marca, "")),
          };
        }
      }

      return { tipo: "parrafo", texto };
    });
}

/** La línea que se muestra en el listado: la bajada, o el principio de la nota. */
export function resumenDe(nota: Pick<Nota, "bajada" | "cuerpo">): string {
  if (nota.bajada) return nota.bajada;

  const primero = bloquesDelCuerpo(nota.cuerpo).find((bloque) => bloque.tipo === "parrafo");
  if (!primero || primero.tipo !== "parrafo") return "";

  return primero.texto.length > 180 ? `${primero.texto.slice(0, 177).trimEnd()}…` : primero.texto;
}

/** Doscientas palabras por minuto, redondeando para arriba: nunca "0 min". */
export function minutosDeLectura(cuerpo: string): number {
  const palabras = cuerpo.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}
