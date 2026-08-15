import type { Categoria, DatosProducto } from "./db";
import { normalizar } from "./tienda";

/**
 * Las reglas del catálogo, del mismo lado que las de las reservas y las de la
 * tienda: las usa el formulario del panel —para avisar antes de mandar— y la
 * server action, que es la que realmente decide. Las mismas cotas están como
 * constraints de `pebeta_productos` y `pebeta_categorias`, así que acá están
 * para poder explicar qué está mal, no para ser la única defensa.
 *
 * Este módulo lo importa código de cliente, así que no puede tocar la base ni
 * el manifiesto de fotos: las categorías que existen y las fotos que hay se le
 * pasan como listas.
 */

export const MAX_NOMBRE = 120;
export const MAX_DESCRIPCION = 400;
/** Un producto de la proveeduría no llega ni cerca, pero algo tiene que topear. */
export const MAX_PRECIO = 9_999_999;
export const MAX_STOCK = 9_999;
export const MAX_UNIDAD = 40;
/** El id de una categoría entra en `^[a-z][a-z0-9-]{1,39}$`. */
export const MAX_ID_CATEGORIA = 40;

/** El valor que toma el select cuando se está inventando una categoría. */
export const CATEGORIA_NUEVA = "__nueva";

/**
 * El id de una categoría a partir de su nombre: "Quesos de tambo" queda como
 * `quesos-de-tambo`. Es lo que viaja en la URL de la tienda y lo que guarda cada
 * producto, así que se arma una sola vez —cuando la categoría nace— y después
 * no se toca: cambiarle el nombre a una categoría no le cambia el id.
 */
export function slugDeCategoria(nombre: string): string {
  const base = normalizar(nombre)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_ID_CATEGORIA);

  // la tabla pide que arranque con letra: "5 quesos" entra como "c-5-quesos"
  const conLetra = /^[a-z]/.test(base) ? base : `c-${base}`.slice(0, MAX_ID_CATEGORIA);
  return conLetra.replace(/-+$/g, "");
}

type ResultadoProducto =
  | { ok: true; datos: DatosProducto }
  | { ok: false; error: string; campo: string };

/** Lo que llega del formulario: todo texto, como sale de un FormData. */
export type ProductoCrudo = {
  nombre: string;
  descripcion: string;
  precio: string;
  unidad: string;
  stock: string;
  categoria: string;
  foto: string;
  activo: boolean;
};

/** "1.500" y "1500" son el mismo precio: el punto de los miles no molesta. */
function entero(valor: string): number | null {
  const limpio = valor.replace(/[.\s]/g, "");
  if (!/^\d+$/.test(limpio)) return null;
  return Number(limpio);
}

/**
 * Valida un producto entero. `categorias` son los ids que existen y `fotos` las
 * claves del manifiesto: las dos listas las arma quien llama, que es el único
 * que puede mirar la base y el manifiesto.
 */
export function validarProducto(
  crudo: ProductoCrudo,
  { categorias, fotos }: { categorias: string[]; fotos: string[] }
): ResultadoProducto {
  const nombre = crudo.nombre.trim();
  if (nombre.length < 2 || nombre.length > MAX_NOMBRE) {
    return { ok: false, error: "El nombre del producto va entre 2 y 120 caracteres.", campo: "nombre" };
  }

  const descripcion = crudo.descripcion.trim();
  if (descripcion.length > MAX_DESCRIPCION) {
    return { ok: false, error: "La descripción quedó muy larga.", campo: "descripcion" };
  }

  const precio = entero(crudo.precio);
  if (precio === null || precio > MAX_PRECIO) {
    return { ok: false, error: "El precio va en pesos enteros, sin centavos.", campo: "precio" };
  }

  const unidad = crudo.unidad.trim();
  if (!unidad || unidad.length > MAX_UNIDAD) {
    return {
      ok: false,
      error: "Escribí de a cuánto se vende: kilo, docena, frasco de 250 g…",
      campo: "unidad",
    };
  }

  const stock = entero(crudo.stock);
  if (stock === null || stock > MAX_STOCK) {
    return { ok: false, error: "El stock es un número entero de unidades.", campo: "stock" };
  }

  const categoria = crudo.categoria.trim();
  if (!categoria) {
    return { ok: false, error: "Elegí una categoría, o creá una nueva.", campo: "categoria" };
  }
  if (!categorias.includes(categoria)) {
    return { ok: false, error: "Esa categoría ya no está.", campo: "categoria" };
  }

  const foto = crudo.foto.trim();
  if (foto && !fotos.includes(foto)) {
    return { ok: false, error: "Esa foto no está en el manifiesto.", campo: "foto" };
  }

  return {
    ok: true,
    datos: { nombre, descripcion, precio, unidad, stock, categoria, foto, activo: crudo.activo },
  };
}

type ResultadoCategoria =
  | { ok: true; categoria: Categoria }
  | { ok: false; error: string };

/** Lo que llega del formulario de una categoría. El id ya viene resuelto. */
export type CategoriaCruda = {
  id: string;
  nombre: string;
  descripcion: string;
  orden: string;
  activa: boolean;
};

export function validarCategoria(crudo: CategoriaCruda): ResultadoCategoria {
  const nombre = crudo.nombre.trim();
  if (nombre.length < 2 || nombre.length > 60) {
    return { ok: false, error: `"${nombre}" no entra como nombre de categoría: van de 2 a 60 caracteres.` };
  }

  const id = crudo.id.trim();
  if (!/^[a-z][a-z0-9-]{1,39}$/.test(id)) {
    return {
      ok: false,
      error: `De "${nombre}" no sale un nombre corto para la URL. Probá con letras y números.`,
    };
  }

  const descripcion = crudo.descripcion.trim();
  if (descripcion.length > 200) {
    return { ok: false, error: `La bajada de ${nombre} quedó muy larga.` };
  }

  const orden = entero(crudo.orden);
  if (orden === null || orden > 999) {
    return { ok: false, error: `El orden de ${nombre} es un número de 0 a 999.` };
  }

  return { ok: true, categoria: { id, nombre, descripcion, orden, activa: crudo.activa } };
}

/** El lugar que le toca a una categoría nueva: la última de la lista. */
export function proximoOrden(categorias: Categoria[]): number {
  return categorias.reduce((mayor, categoria) => Math.max(mayor, categoria.orden), 0) + 1;
}

/** Cuántos productos tiene cada categoría, para el panel. */
export function contarPorCategoria(productos: { categoria: string }[]): Record<string, number> {
  const cuenta: Record<string, number> = {};
  for (const producto of productos) {
    cuenta[producto.categoria] = (cuenta[producto.categoria] ?? 0) + 1;
  }
  return cuenta;
}
