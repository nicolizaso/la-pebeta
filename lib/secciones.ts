import { cache } from "react";
import { listarSecciones, type Seccion, type Secciones } from "./db";

/**
 * La tienda y el blog se pueden apagar.
 *
 * El sitio salió a producción con las dos secciones hechas pero cerradas: la
 * casa las prende desde el panel cuando el catálogo y las primeras notas estén
 * listos. Mientras están apagadas no aparecen en el menú, su dirección muestra
 * un "Próximamente" y la tienda tampoco toma pedidos por la API.
 *
 * Este módulo es el que consultan el menú, las páginas y el panel; el estado
 * vive en la tabla `secciones` y se lee por `lib/db.ts`, como todo lo demás.
 */

/** Todo lo que el panel necesita para preguntar antes de prender o apagar. */
export type FichaDeSeccion = {
  id: Seccion;
  /** Cómo se la nombra en una oración: "la tienda online". */
  nombre: string;
  /** Lo que dice el interruptor: "Activar tienda". */
  interruptor: string;
  /** El recuadro que salta al prenderla. */
  confirmacion: string;
  /** El recuadro que salta al apagarla. */
  advertencia: string;
};

export const SECCIONES: Record<Seccion, FichaDeSeccion> = {
  tienda: {
    id: "tienda",
    nombre: "la tienda online",
    interruptor: "Activar tienda",
    confirmacion:
      "Al marcar este botón se va a activar la tienda online, ¿estás seguro que querés activar esta sección? Desde ese momento Tienda vuelve al menú del sitio y cualquiera puede ver el catálogo y comprar.",
    advertencia:
      "Al desmarcar este botón la tienda online sale del sitio: Tienda desaparece del menú, /tienda pasa a mostrar “Próximamente” y no se van a poder cerrar compras. ¿Estás seguro que querés desactivar esta sección?",
  },
  blog: {
    id: "blog",
    nombre: "el blog",
    interruptor: "Activar blog",
    confirmacion:
      "Al marcar este botón se va a activar el blog, ¿estás seguro que querés activar esta sección? Desde ese momento Blog vuelve al menú del sitio y las notas publicadas quedan a la vista.",
    advertencia:
      "Al desmarcar este botón el blog sale del sitio: Blog desaparece del menú y /blog —y cada nota— pasa a mostrar “Próximamente”. ¿Estás seguro que querés desactivar esta sección?",
  },
};

export function esSeccion(valor: unknown): valor is Seccion {
  return valor === "tienda" || valor === "blog";
}

/**
 * Qué secciones están abiertas, para esta visita.
 *
 * Nunca tira: si la base no contesta —o si todavía no corrió la migración que
 * crea la tabla— las secciones quedan apagadas. Cerrado de más es una página
 * que dice "Próximamente"; abierto de más es una tienda a la venta sin que
 * nadie la haya prendido.
 *
 * `cache` la deja en una consulta por request: el menú y la página que lo
 * muestra preguntan lo mismo.
 */
export const seccionesActivas = cache(async (): Promise<Secciones> => {
  try {
    return await listarSecciones();
  } catch (error) {
    console.error("No se pudo leer qué secciones están activas", error);
    return { tienda: false, blog: false };
  }
});

/** ¿Está abierta esta sección? Es la pregunta que hace cada página. */
export async function seccionActiva(seccion: Seccion): Promise<boolean> {
  return (await seccionesActivas())[seccion];
}
