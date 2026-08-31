"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { abrirSesion, cerrarSesion, haySesion } from "@/lib/admin";
import { estadoDeNota, etiquetasDesdeTexto, slugDeTitulo, validarNota } from "@/lib/blog";
import {
  actualizarNota,
  actualizarProducto,
  borrarCategoria,
  borrarNota,
  borrarProducto,
  buscarNota,
  borrarConsulta,
  cambiarEstadoCompra,
  cambiarEstadoConsulta,
  cambiarEstadoReserva,
  contarProductosDe,
  crearNota,
  crearProducto,
  guardarCategorias,
  guardarHorarios,
  guardarSeccion,
  listarCategoriasDelPanel,
  olvidarContrasena,
  publicarNota,
  publicarProducto,
  slugLibre,
  type Categoria,
  type CompraEstado,
  type ConsultaEstado,
  type Horario,
  type Nota,
  type ReservaEstado,
} from "@/lib/db";
import { desdeElReloj } from "@/lib/fechas";
import { DIAS, esHorarioArea, validarSemana } from "@/lib/horarios";
import { PHOTO_MANIFEST } from "@/lib/photos";
import {
  CATEGORIA_NUEVA,
  proximoOrden,
  slugDeCategoria,
  validarCategoria,
  validarProducto,
} from "@/lib/productos";
import { esEstadoConsulta } from "@/lib/consultas";
import { esSeccion, SECCIONES } from "@/lib/secciones";
import { subirImagen } from "@/lib/subidas";

/**
 * Todo lo que el panel escribe pasa por acá.
 *
 * Una server action es un endpoint más, así que cada una vuelve a preguntar por
 * la sesión: que la página no se haya renderizado no alcanza como permiso.
 */

export type Respuesta = { ok: boolean; mensaje: string; campo?: string } | null;

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

/**
 * Marca una consulta del chat como resuelta, o la vuelve a abrir.
 *
 * "Derivada" la pone el asistente solo, cuando no supo contestar: es la pila de
 * lo que hay que contestar a mano. Desde acá se la cierra cuando ya se le
 * contestó a la persona por WhatsApp.
 */
export async function cambiarEstadoDeConsulta(datos: FormData): Promise<void> {
  if (!(await haySesion())) return;

  const id = texto(datos.get("id"));
  const estado = texto(datos.get("estado"));
  if (!id || !esEstadoConsulta(estado)) return;

  await cambiarEstadoConsulta(id, estado as ConsultaEstado);
  revalidatePath("/admin/consultas");
  revalidatePath("/admin");
}

/**
 * Borra una conversación del chat, de verdad.
 *
 * Un hilo puede tener un teléfono y un mail adentro —los deja quien pregunta,
 * escribiéndolos— así que tiene que haber una forma de que deje de existir. La
 * reserva que haya salido de esa conversación no se toca: es una fila aparte.
 */
export async function eliminarConsulta(datos: FormData): Promise<void> {
  if (!(await haySesion())) return;

  const id = texto(datos.get("id"));
  if (!id) return;

  await borrarConsulta(id);
  revalidatePath("/admin/consultas");
  revalidatePath("/admin");
}

/**
 * Le saca la contraseña a una cuenta.
 *
 * Es la salida para quien se la olvidó: no hay mail de reseteo —el sitio no
 * manda mails—, así que esa persona escribe o llama, y desde acá su cuenta
 * vuelve a entrar con sólo el mail, como el día que se abrió. Las sesiones que
 * tuviera abiertas se caen en el momento.
 */
export async function olvidarContrasenaDeCuenta(datos: FormData): Promise<void> {
  if (!(await haySesion())) return;

  const id = texto(datos.get("id"));
  if (!id) return;

  await olvidarContrasena(id);
  revalidatePath("/admin/usuarios");
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

/* ---------- el catálogo ---------- */

/** Lo que hay que volver a armar cuando se toca un producto o una categoría. */
function seTocoElCatalogo(): void {
  revalidatePath("/admin/productos");
  revalidatePath("/admin/productos/categorias");
  revalidatePath("/tienda");
}

const FOTOS = Object.keys(PHOTO_MANIFEST);

/**
 * Alta y edición de un producto: el mismo formulario para los dos, con `id`
 * vacío cuando es nuevo.
 *
 * Acá también nacen las categorías. Si el select vino en "nueva", la categoría
 * se arma con el nombre que se escribió al lado y se da de alta recién cuando el
 * resto del producto pasó la revisión, así un error en el precio no deja una
 * categoría vacía dando vueltas. Desde que se guarda está en el aside de la
 * tienda, en los filtros del panel y en el select del próximo producto, sin
 * pasar por ninguna otra pantalla.
 *
 * Si ya había una que se guardaba con el mismo id —sale del nombre, así que
 * "Quesos" y "quesos" son la misma— se usa esa en vez de duplicarla, y si estaba
 * escondida vuelve al catálogo: pedir un producto en una categoría es pedir que
 * esa categoría esté.
 */
export async function guardarProducto(_previo: Respuesta, datos: FormData): Promise<Respuesta> {
  if (!(await haySesion())) return SIN_SESION;

  const id = texto(datos.get("id"));
  let categorias: Categoria[];
  try {
    categorias = await listarCategoriasDelPanel();
  } catch (error) {
    console.error("No se pudieron leer las categorías", error);
    return { ok: false, mensaje: "No pudimos leer las categorías. Probá de nuevo." };
  }

  let categoria = texto(datos.get("categoria"));
  // la que está por nacer: se guarda al final, si todo lo demás está bien
  let pendiente: Categoria | null = null;

  if (categoria === CATEGORIA_NUEVA) {
    const nombre = texto(datos.get("categoria-nueva"));
    const validacion = validarCategoria({
      id: slugDeCategoria(nombre),
      nombre,
      descripcion: texto(datos.get("categoria-nueva-descripcion")),
      orden: String(proximoOrden(categorias)),
      activa: true,
    });
    if (!validacion.ok) return { ok: false, mensaje: validacion.error, campo: "categoria" };

    pendiente = validacion.categoria;
    categoria = pendiente.id;
  }

  const validacion = validarProducto(
    {
      nombre: texto(datos.get("nombre")),
      descripcion: texto(datos.get("descripcion")),
      precio: texto(datos.get("precio")),
      unidad: texto(datos.get("unidad")),
      stock: texto(datos.get("stock")),
      categoria,
      foto: texto(datos.get("foto")),
      activo: datos.get("activo") === "on",
    },
    {
      categorias: categorias.map((c) => c.id).concat(pendiente ? [pendiente.id] : []),
      fotos: FOTOS,
    }
  );
  if (!validacion.ok) {
    return { ok: false, mensaje: validacion.error, campo: validacion.campo };
  }

  let guardado = id;
  try {
    if (pendiente) {
      const nueva = pendiente;
      const yaEstaba = categorias.find((categoria) => categoria.id === nueva.id);
      if (!yaEstaba) await guardarCategorias([nueva]);
      else if (!yaEstaba.activa) await guardarCategorias([{ ...yaEstaba, activa: true }]);
    }

    if (id) await actualizarProducto(id, validacion.datos);
    else guardado = await crearProducto(validacion.datos);
  } catch (error) {
    console.error("No se pudo guardar el producto", error);
    return { ok: false, mensaje: "No pudimos guardar el producto. Probá de nuevo." };
  }

  seTocoElCatalogo();
  // vuelve al listado con el producto marcado, que es donde se sigue trabajando
  redirect(`/admin/productos?guardado=${guardado}`);
}

/** Publicar o esconder un producto desde el listado, sin abrir el formulario. */
export async function cambiarPublicacion(datos: FormData): Promise<void> {
  if (!(await haySesion())) return;

  const id = texto(datos.get("id"));
  if (!id) return;

  await publicarProducto(id, texto(datos.get("activo")) === "si");
  seTocoElCatalogo();
}

/** Borrar un producto. Las compras que se lo llevaron no se tocan. */
export async function eliminarProducto(datos: FormData): Promise<void> {
  if (!(await haySesion())) return;

  const id = texto(datos.get("id"));
  if (!id) return;

  await borrarProducto(id);
  seTocoElCatalogo();
  redirect("/admin/productos");
}

/**
 * La lista de categorías, guardada entera de una vez: nombres, bajadas, orden y
 * cuáles están en el catálogo, más la que se esté agregando al pie.
 *
 * El botón de borrar manda su id en el mismo submit, así que "guardar" y
 * "borrar esta" son la misma action y el formulario no se parte en siete.
 */
export async function guardarLasCategorias(
  _previo: Respuesta,
  datos: FormData
): Promise<Respuesta> {
  if (!(await haySesion())) return SIN_SESION;

  const borrar = texto(datos.get("borrar"));
  if (borrar) {
    try {
      // la base lo impide igual —los productos apuntan acá—, pero el panel
      // puede explicar por qué en vez de mostrar un error de Postgres
      const cuantos = await contarProductosDe(borrar);
      if (cuantos > 0) {
        return {
          ok: false,
          mensaje: `Esa categoría todavía tiene ${cuantos} ${cuantos === 1 ? "producto" : "productos"}. Movelos a otra o borralos primero.`,
        };
      }
      await borrarCategoria(borrar);
    } catch (error) {
      console.error("No se pudo borrar la categoría", error);
      return { ok: false, mensaje: "No pudimos borrar la categoría. Probá de nuevo." };
    }

    seTocoElCatalogo();
    return { ok: true, mensaje: "Categoría borrada." };
  }

  const lista: Categoria[] = [];
  for (const valor of datos.getAll("ids")) {
    const id = typeof valor === "string" ? valor : "";
    if (!id) continue;

    const validacion = validarCategoria({
      id,
      nombre: texto(datos.get(`nombre-${id}`)),
      descripcion: texto(datos.get(`descripcion-${id}`)),
      orden: texto(datos.get(`orden-${id}`)),
      activa: datos.get(`activa-${id}`) === "on",
    });
    if (!validacion.ok) return { ok: false, mensaje: validacion.error };

    lista.push(validacion.categoria);
  }

  const nombreNuevo = texto(datos.get("nueva-nombre"));
  if (nombreNuevo) {
    const validacion = validarCategoria({
      id: slugDeCategoria(nombreNuevo),
      nombre: nombreNuevo,
      descripcion: texto(datos.get("nueva-descripcion")),
      orden: String(proximoOrden(lista)),
      activa: true,
    });
    if (!validacion.ok) return { ok: false, mensaje: validacion.error };
    if (lista.some((categoria) => categoria.id === validacion.categoria.id)) {
      return { ok: false, mensaje: `Ya hay una categoría que se llama ${nombreNuevo}.` };
    }

    lista.push(validacion.categoria);
  }

  try {
    await guardarCategorias(lista);
  } catch (error) {
    console.error("No se pudieron guardar las categorías", error);
    return { ok: false, mensaje: "No pudimos guardar las categorías. Probá de nuevo." };
  }

  seTocoElCatalogo();
  return {
    ok: true,
    mensaje: nombreNuevo ? `Listo: ${nombreNuevo} ya está en el catálogo.` : "Categorías guardadas.",
  };
}

/* ---------- el blog ---------- */

/** Lo que hay que volver a armar cuando se toca una nota. */
function seTocoElBlog(): void {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

/**
 * Alta y edición de una nota: el mismo formulario para las dos, con `id` vacío
 * cuando es nueva.
 *
 * La fecha llega del `datetime-local` sin zona, así que se lee como hora de Los
 * Cardales y no como la del server, que en Vercel está en UTC. Con la fecha por
 * venir y la nota publicada, queda programada: no hay nada más que hacer, sale
 * sola cuando llega el día.
 *
 * La dirección no se escribe: sale del título. Mientras la nota no haya salido
 * la sigue —cambiar el título de un borrador le cambia la URL, que todavía no
 * la tiene nadie—, y desde que se publicó queda quieta, porque a partir de ahí
 * es un link que puede estar guardado en cualquier lado.
 */
export async function guardarNota(_previo: Respuesta, datos: FormData): Promise<Respuesta> {
  if (!(await haySesion())) return SIN_SESION;

  const id = texto(datos.get("id"));
  const fecha = desdeElReloj(texto(datos.get("fecha")));
  if (!fecha) {
    return { ok: false, mensaje: "Elegí cuándo sale la nota: día y hora.", campo: "fecha" };
  }

  const titulo = texto(datos.get("titulo"));
  let anterior: Nota | null = null;
  let slug: string;
  try {
    anterior = id ? await buscarNota(id) : null;
    slug =
      anterior && estadoDeNota(anterior) === "publicada"
        ? anterior.slug
        : await slugLibre(slugDeTitulo(titulo), id);
  } catch (error) {
    console.error("No se pudo resolver la dirección de la nota", error);
    return { ok: false, mensaje: "No pudimos guardar la nota. Probá de nuevo." };
  }

  const validacion = validarNota(
    {
      titulo,
      slug,
      bajada: texto(datos.get("bajada")),
      // el cuerpo conserva sus renglones: es lo único que no se aplana
      cuerpo: typeof datos.get("cuerpo") === "string" ? String(datos.get("cuerpo")) : "",
      autor: texto(datos.get("autor")),
      etiquetas: etiquetasDesdeTexto(texto(datos.get("etiquetas"))),
      foto: texto(datos.get("foto")),
      publicada: datos.get("publicada") === "on",
      fecha,
    },
    { fotos: FOTOS }
  );
  if (!validacion.ok) {
    return { ok: false, mensaje: validacion.error, campo: validacion.campo };
  }

  let guardada = id;
  try {
    if (id) await actualizarNota(id, validacion.datos);
    else guardada = await crearNota(validacion.datos);
  } catch (error) {
    console.error("No se pudo guardar la nota", error);
    return { ok: false, mensaje: "No pudimos guardar la nota. Probá de nuevo." };
  }

  seTocoElBlog();
  revalidatePath(`/blog/${validacion.datos.slug}`);
  // vuelve al listado con la nota marcada, que es donde se sigue trabajando
  redirect(`/admin/blog?guardada=${guardada}`);
}

/** Sacar una nota del blog o volver a ponerla, desde el listado. */
export async function cambiarPublicacionNota(datos: FormData): Promise<void> {
  if (!(await haySesion())) return;

  const id = texto(datos.get("id"));
  if (!id) return;

  await publicarNota(id, texto(datos.get("publicada")) === "si");
  seTocoElBlog();
  revalidatePath(`/blog/${texto(datos.get("slug"))}`);
}

export type Subida = { ok: true; url: string } | { ok: false; error: string };

/**
 * La foto que alguien elige del teléfono o de la computadora mientras escribe
 * una nota. Va al bucket y vuelve como URL, que es lo que se guarda en la nota:
 * el formulario nunca manda el archivo dos veces.
 */
export async function subirFotoDeNota(datos: FormData): Promise<Subida> {
  if (!(await haySesion())) {
    return { ok: false, error: "Se cerró la sesión. Recargá la página y volvé a entrar." };
  }

  const archivo = datos.get("archivo");
  if (!(archivo instanceof File)) return { ok: false, error: "No llegó ninguna foto." };

  return subirImagen(archivo);
}

/** Borrar una nota. Es lo único del blog que no se puede deshacer. */
export async function eliminarNota(datos: FormData): Promise<void> {
  if (!(await haySesion())) return;

  const id = texto(datos.get("id"));
  if (!id) return;

  await borrarNota(id);
  seTocoElBlog();
  revalidatePath(`/blog/${texto(datos.get("slug"))}`);
  redirect("/admin/blog");
}

/* ---------- las secciones del sitio ---------- */

/**
 * Prende o apaga la tienda o el blog.
 *
 * Es el interruptor que la casa tiene en Productos y en Blog: mientras una
 * sección está apagada no aparece en el menú, su dirección muestra un
 * "Próximamente" y —en el caso de la tienda— la API no cierra ninguna compra.
 * Lo que se carga en el panel se sigue cargando igual: apagar no esconde
 * productos ni despublica notas, cierra la puerta de calle.
 *
 * Se revalida el sitio entero (`"/"` como layout) porque el menú está en todas
 * las páginas: el cambio tiene que verse en la home, no sólo en la sección.
 */
export async function cambiarSeccion(_previo: Respuesta, datos: FormData): Promise<Respuesta> {
  if (!(await haySesion())) return SIN_SESION;

  const seccion = texto(datos.get("seccion"));
  if (!esSeccion(seccion)) return { ok: false, mensaje: "No sabemos de qué sección se trata." };

  const activa = texto(datos.get("activa")) === "si";
  try {
    await guardarSeccion(seccion, activa);
  } catch (error) {
    console.error("No se pudo cambiar la sección", error);
    return {
      ok: false,
      mensaje: `No pudimos ${activa ? "activar" : "desactivar"} ${SECCIONES[seccion].nombre}. Probá de nuevo.`,
    };
  }

  revalidatePath("/", "layout");
  return {
    ok: true,
    mensaje: activa
      ? `Listo: ${SECCIONES[seccion].nombre} ya está en el sitio.`
      : `Listo: ${SECCIONES[seccion].nombre} salió del sitio y queda en “Próximamente”.`,
  };
}
