import { supabase, supabaseAdmin } from "./supabase";

/**
 * La capa de datos del sitio: acá viven los tipos y las únicas funciones que
 * hablan con la base. Todo lo demás (la API, el formulario, el panel de admin)
 * pasa por este archivo, así que mover los datos de lugar es reescribir esto y
 * nada más.
 *
 * Son ocho tablas en Postgres, en el proyecto de Supabase de La Pebeta. El
 * esquema está en `supabase/migrations/`: si acá se agrega un campo, allá va la
 * migración que lo crea.
 *
 * Las funciones que usan `supabaseAdmin()` saltean RLS y son sólo del panel:
 * están marcadas una por una.
 */

export const TABLAS = {
  reservas: "reservas",
  productos: "productos",
  categorias: "categorias",
  compras: "compras",
  horarios: "horarios",
  notas: "notas",
  secciones: "secciones",
  usuarios: "usuarios",
} as const;

/**
 * La cuenta de quien reserva o compra.
 *
 * Nadie se registra: nace sola con la primera reserva y el mail es la llave.
 * Mientras `password_hash` esté vacío se entra con sólo escribir el mail;
 * ponerse una contraseña desde el perfil es lo que cierra esa puerta.
 */
export type Usuario = {
  id: string;
  /** Siempre en minúsculas. Es la llave de la cuenta. */
  email: string;
  nombre: string;
  telefono: string;
  /** Vacío mientras la cuenta no tenga contraseña. */
  password_hash: string;
  password_puesta: string | null;
  /** Sube al cambiar la contraseña y ahí caducan las sesiones abiertas. */
  sesion_epoch: string;
  creado: string;
  actualizado: string;
  ultimo_acceso: string;
};

export type ReservaTipo = "paseos" | "restaurant";
export type ReservaEstado = "pendiente" | "confirmada" | "cancelada";

export type Reserva = {
  id: string;
  /** Código corto que se le muestra a quien reserva. */
  codigo: string;
  /** La cuenta que la tomó. Null en las reservas anteriores a las cuentas. */
  usuario_id: string | null;
  tipo: ReservaTipo;
  estado: ReservaEstado;
  creada: string;
  nombre: string;
  telefono: string;
  email: string;
  /** YYYY-MM-DD */
  fecha: string;
  /** HH:MM */
  hora: string;
  personas: number;
  comentarios: string;
};

/** Las partes del sitio que se pueden apagar desde el panel. */
export type Seccion = "tienda" | "blog";

/** Cuáles están abiertas al público, todas juntas. */
export type Secciones = Record<Seccion, boolean>;

/** Las dos áreas que atienden al público con horario propio. */
export type HorarioArea = "proveeduria" | "restaurant";

export type Horario = {
  area: HorarioArea;
  /** 0 = domingo … 6 = sábado, igual que `getDay()`. */
  dia: number;
  abierto: boolean;
  /** HH:MM, vacío si ese día está cerrado. */
  desde: string;
  /** HH:MM, vacío si ese día está cerrado. */
  hasta: string;
  nota: string;
};

export type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  /** En pesos, sin decimales. */
  precio: number;
  /** "kg", "docena", "frasco 250 g", … */
  unidad: string;
  stock: number;
  /** El `id` de una fila de `categorias`. */
  categoria: string;
  /** Clave del manifiesto de fotos ("huerta/17"), o vacía si no tiene. */
  foto: string;
  activo: boolean;
  creado: string;
};

/** Los cajones en los que se ordena el catálogo de la tienda. */
export type Categoria = {
  id: string;
  nombre: string;
  descripcion: string;
  /** En qué orden se listan; el chico primero. */
  orden: number;
  activa: boolean;
};

/** Lo que se carga en el formulario del panel, ya validado. */
export type DatosProducto = {
  nombre: string;
  descripcion: string;
  precio: number;
  unidad: string;
  stock: number;
  categoria: string;
  foto: string;
  activo: boolean;
};

/** El catálogo publicado, leído de una sola vez: las categorías y sus productos. */
export type Catalogo = { categorias: Categoria[]; productos: Producto[] };

/**
 * Una nota del blog.
 *
 * `fecha` hace las dos cosas: es la que se lee al pie del título y es cuándo
 * sale. Con `publicada` en true y la fecha todavía por venir, la nota queda
 * cargada y aparece sola cuando llega el día, sin que nadie tenga que volver al
 * panel a apretar un botón.
 */
export type Nota = {
  id: string;
  /** Lo que va en la URL: `/blog/la-primera-cosecha`. */
  slug: string;
  titulo: string;
  /** La línea que se lee debajo del título, en el listado y en la nota. */
  bajada: string;
  /** El texto, en párrafos separados por un renglón en blanco. */
  cuerpo: string;
  autor: string;
  /**
   * La sección en la que va la nota y sus temas: la primera etiqueta es la
   * sección ("Huerta en tu casa") y las demás, temas sueltos.
   */
  etiquetas: string[];
  /**
   * Clave del manifiesto de fotos ("huerta/17"), la URL de una foto subida
   * desde el panel, o vacía si no tiene.
   */
  foto: string;
  /** ¿Está para salir? Sin esto no se ve, tenga la fecha que tenga. */
  publicada: boolean;
  /** ISO. Cuándo sale y qué fecha lleva. */
  fecha: string;
  creada: string;
  actualizada: string;
};

/** Lo que se carga en el formulario del panel, ya validado. */
export type DatosNota = {
  slug: string;
  titulo: string;
  bajada: string;
  cuerpo: string;
  autor: string;
  etiquetas: string[];
  foto: string;
  publicada: boolean;
  fecha: string;
};

export type CompraItem = {
  productoId: string;
  nombre: string;
  cantidad: number;
  /** Precio unitario al momento de la compra. */
  precio: number;
};

export type CompraEstado = "pendiente" | "pagada" | "entregada" | "cancelada";

export type Compra = {
  id: string;
  codigo: string;
  /** La cuenta que la hizo. Null en las compras anteriores a las cuentas. */
  usuario_id: string | null;
  estado: CompraEstado;
  creada: string;
  cliente: { nombre: string; telefono: string; email: string };
  items: CompraItem[];
  total: number;
};

/** Lo que la tienda manda a la API, ya validado y con los precios del catálogo. */
export type NuevaCompra = {
  cliente: { nombre: string; telefono: string; email: string };
  items: CompraItem[];
  total: number;
};

/** Los datos que llegan del formulario, ya validados. */
export type NuevaReserva = {
  tipo: ReservaTipo;
  nombre: string;
  telefono: string;
  email: string;
  fecha: string;
  hora: string;
  personas: number;
  comentarios: string;
};

/** Código corto y legible para dictar por teléfono: PB-4F2K9A. */
export function nuevoCodigo(prefijo = "PB"): string {
  const alfabeto = "ACDEFGHJKLMNPQRSTUVWXYZ2345679";
  let cuerpo = "";
  for (let i = 0; i < 6; i += 1) {
    cuerpo += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return `${prefijo}-${cuerpo}`;
}

/**
 * Agrega la reserva y devuelve el objeto tal como quedó guardado.
 *
 * La fila se arma entera acá y el insert no pide RETURNING a propósito: leer la
 * fila recién insertada obligaría a traerse de vuelta teléfonos y mails que ya
 * están acá. Los defaults de la tabla quedan igual, como red de contención.
 *
 * Va con la secret key desde que las reservas tienen dueño: el alta y la cuenta
 * son el mismo movimiento, y `usuarios` no se toca desde afuera. La policy de
 * alta pública de la tabla sigue estando —nada cambió del lado de la base—,
 * pero el sitio ya no la usa.
 */
export async function crearReserva(
  datos: NuevaReserva,
  usuarioId: string | null = null
): Promise<Reserva> {
  const reserva: Reserva = {
    id: crypto.randomUUID(),
    codigo: nuevoCodigo(),
    usuario_id: usuarioId,
    estado: "pendiente",
    creada: new Date().toISOString(),
    ...datos,
  };

  const { error } = await supabaseAdmin().from(TABLAS.reservas).insert(reserva);
  if (error) throw new Error(`No se pudo guardar la reserva: ${error.message}`);

  return reserva;
}

/* ---------- las cuentas ----------
   Todo lo de acá va con la secret key: `usuarios` tiene RLS y ninguna policy,
   así que la tabla no existe para nadie que no sea el server. */

/** Una cuenta por id. Null si no está. */
export async function buscarUsuario(id: string): Promise<Usuario | null> {
  const { data, error } = await supabaseAdmin()
    .from(TABLAS.usuarios)
    .select()
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer la cuenta: ${error.message}`);
  return (data as Usuario | null) ?? null;
}

/** Una cuenta por mail, que es su llave. El mail tiene que venir normalizado. */
export async function buscarUsuarioPorEmail(email: string): Promise<Usuario | null> {
  const { data, error } = await supabaseAdmin()
    .from(TABLAS.usuarios)
    .select()
    .eq("email", email)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer la cuenta: ${error.message}`);
  return (data as Usuario | null) ?? null;
}

/**
 * La cuenta de quien está reservando o comprando: la que ya tenía ese mail, o
 * una nueva.
 *
 * El nombre y el teléfono que llegan del formulario sólo rellenan lo que esté
 * vacío. Quien los corrigió en su perfil escribió la última palabra, y una
 * reserva cargada a las apuradas desde el teléfono de otra persona no se la
 * puede pisar.
 *
 * Dos reservas del mismo mail al mismo tiempo pueden querer crear la cuenta las
 * dos: la que llega segunda choca contra el índice único y se queda con la que
 * acaba de nacer.
 */
export async function asegurarUsuario(datos: {
  email: string;
  nombre: string;
  telefono: string;
}): Promise<Usuario> {
  const existente = await buscarUsuarioPorEmail(datos.email);
  if (existente) {
    const faltan: Partial<Usuario> = {};
    if (!existente.nombre && datos.nombre) faltan.nombre = datos.nombre;
    if (!existente.telefono && datos.telefono) faltan.telefono = datos.telefono;
    if (Object.keys(faltan).length === 0) return existente;

    return actualizarUsuario(existente.id, faltan);
  }

  const { data, error } = await supabaseAdmin()
    .from(TABLAS.usuarios)
    .insert({ email: datos.email, nombre: datos.nombre, telefono: datos.telefono })
    .select()
    .maybeSingle();

  if (error) {
    // 23505: alguien creó la misma cuenta en el medio, así que es la suya
    if (error.code === "23505") {
      const recien = await buscarUsuarioPorEmail(datos.email);
      if (recien) return recien;
    }
    throw new Error(`No se pudo crear la cuenta: ${error.message}`);
  }
  if (!data) throw new Error("No se pudo crear la cuenta.");

  return data as Usuario;
}

/** Guarda campos de una cuenta y devuelve cómo quedó. */
async function actualizarUsuario(id: string, cambios: Partial<Usuario>): Promise<Usuario> {
  const { data, error } = await supabaseAdmin()
    .from(TABLAS.usuarios)
    .update({ ...cambios, actualizado: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(`No se pudo guardar la cuenta: ${error.message}`);
  if (!data) throw new Error("Esa cuenta ya no está.");

  return data as Usuario;
}

/** Nombre y teléfono, corregidos por su dueño desde el perfil. */
export async function guardarDatosDeUsuario(
  id: string,
  datos: { nombre: string; telefono: string }
): Promise<Usuario> {
  return actualizarUsuario(id, datos);
}

/**
 * Guarda la contraseña de una cuenta y le sube el epoch, con lo que se caen
 * todas las sesiones abiertas: la que la acaba de poner se vuelve a abrir en el
 * momento, y cualquier otra que hubiera quedado dando vueltas, no.
 */
export async function guardarContrasena(id: string, hash: string): Promise<Usuario> {
  const ahora = new Date().toISOString();
  return actualizarUsuario(id, {
    password_hash: hash,
    password_puesta: ahora,
    sesion_epoch: ahora,
  });
}

/**
 * Le saca la contraseña a una cuenta: vuelve a entrar sólo con el mail. Es la
 * salida para quien se la olvidó, y la hace la casa desde el panel después de
 * hablar con esa persona.
 */
export async function olvidarContrasena(id: string): Promise<Usuario> {
  return actualizarUsuario(id, {
    password_hash: "",
    password_puesta: null,
    sesion_epoch: new Date().toISOString(),
  });
}

/** Anota que esta cuenta entró recién. */
export async function tocarUsuario(id: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from(TABLAS.usuarios)
    .update({ ultimo_acceso: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(`No se pudo anotar el acceso: ${error.message}`);
}

/** Las reservas de una cuenta, la más próxima primero. */
export async function listarReservasDe(usuarioId: string): Promise<Reserva[]> {
  const { data, error } = await supabaseAdmin()
    .from(TABLAS.reservas)
    .select()
    .eq("usuario_id", usuarioId)
    .order("fecha", { ascending: false })
    .order("hora", { ascending: false });

  if (error) throw new Error(`No se pudieron leer tus reservas: ${error.message}`);
  return (data ?? []) as Reserva[];
}

/** Las compras de una cuenta, la última primero. */
export async function listarComprasDe(usuarioId: string): Promise<Compra[]> {
  const { data, error } = await supabaseAdmin()
    .from(TABLAS.compras)
    .select()
    .eq("usuario_id", usuarioId)
    .order("creada", { ascending: false });

  if (error) throw new Error(`No se pudieron leer tus pedidos: ${error.message}`);
  return (data ?? []) as Compra[];
}

/**
 * Una reserva de esta cuenta, para poder decidir sobre ella. El id lo manda el
 * navegador, así que la cuenta va en la consulta y no en un `if` de después.
 */
export async function buscarReservaDe(
  usuarioId: string,
  reservaId: string
): Promise<Reserva | null> {
  const { data, error } = await supabaseAdmin()
    .from(TABLAS.reservas)
    .select()
    .eq("id", reservaId)
    .eq("usuario_id", usuarioId)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer la reserva: ${error.message}`);
  return (data as Reserva | null) ?? null;
}

/** Las cuentas del panel, la última en entrar primero. */
export async function listarUsuarios(): Promise<Usuario[]> {
  const { data, error } = await supabaseAdmin()
    .from(TABLAS.usuarios)
    .select()
    .order("ultimo_acceso", { ascending: false });

  if (error) throw new Error(`No se pudieron leer las cuentas: ${error.message}`);
  return (data ?? []) as Usuario[];
}

/** Las categorías publicadas, en el orden en que se muestran en la tienda. */
export async function listarCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase()
    .from(TABLAS.categorias)
    .select()
    .eq("activa", true)
    .order("orden", { ascending: true });

  if (error) throw new Error(`No se pudieron leer las categorías: ${error.message}`);
  return (data ?? []) as Categoria[];
}

/**
 * El catálogo publicado de la proveeduría: las categorías que están a la vista
 * y los productos que caen en ellas.
 *
 * Los dos viajan juntos porque uno depende del otro: un producto de una
 * categoría escondida no se muestra ni se puede comprar, así que esconder una
 * categoría en el panel alcanza para sacar del catálogo todo lo que tiene
 * adentro, sin tocar producto por producto y sin perder cuál estaba publicado
 * cuando se la vuelve a mostrar.
 */
export async function listarCatalogo(): Promise<Catalogo> {
  const categorias = await listarCategorias();
  if (categorias.length === 0) return { categorias, productos: [] };

  const { data, error } = await supabase()
    .from(TABLAS.productos)
    .select()
    .eq("activo", true)
    .in(
      "categoria",
      categorias.map((categoria) => categoria.id)
    )
    .order("nombre", { ascending: true });

  if (error) throw new Error(`No se pudo leer el catálogo: ${error.message}`);
  return { categorias, productos: (data ?? []) as Producto[] };
}

/* ---------- el catálogo desde el panel ----------
   Todo lo de acá va con la secret key: `productos` y `categorias` sólo tienen
   policy de lectura, y de lo publicado. Escribir el catálogo y ver lo que
   todavía no está a la vista es cosa del panel. */

/** El catálogo entero, publicado y sin publicar, para el listado del panel. */
export async function listarProductosDelPanel(): Promise<Producto[]> {
  const { data, error } = await supabaseAdmin()
    .from(TABLAS.productos)
    .select()
    .order("nombre", { ascending: true });

  if (error) throw new Error(`No se pudo leer el catálogo: ${error.message}`);
  return (data ?? []) as Producto[];
}

/** Un producto por id, para editarlo. Null si ya no está. */
export async function buscarProducto(id: string): Promise<Producto | null> {
  const { data, error } = await supabaseAdmin()
    .from(TABLAS.productos)
    .select()
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer el producto: ${error.message}`);
  return (data as Producto | null) ?? null;
}

/** Agrega un producto y devuelve el id con el que quedó guardado. */
export async function crearProducto(datos: DatosProducto): Promise<string> {
  const id = crypto.randomUUID();

  const { error } = await supabaseAdmin()
    .from(TABLAS.productos)
    .insert({ id, creado: new Date().toISOString(), ...datos });

  if (error) throw new Error(`No se pudo guardar el producto: ${error.message}`);
  return id;
}

export async function actualizarProducto(id: string, datos: DatosProducto): Promise<void> {
  const { error } = await supabaseAdmin().from(TABLAS.productos).update(datos).eq("id", id);

  if (error) throw new Error(`No se pudo guardar el producto: ${error.message}`);
}

/** Publicar o esconder un producto, sin abrir el formulario. */
export async function publicarProducto(id: string, activo: boolean): Promise<void> {
  const { error } = await supabaseAdmin().from(TABLAS.productos).update({ activo }).eq("id", id);

  if (error) throw new Error(`No se pudo cambiar el producto: ${error.message}`);
}

/**
 * Borra un producto de verdad. Las compras viejas no se tocan: cada una guarda
 * el nombre y el precio de lo que se llevó, así que el ticket sigue igual.
 */
export async function borrarProducto(id: string): Promise<void> {
  const { error } = await supabaseAdmin().from(TABLAS.productos).delete().eq("id", id);

  if (error) throw new Error(`No se pudo borrar el producto: ${error.message}`);
}

/** Las categorías del panel: también las escondidas. */
export async function listarCategoriasDelPanel(): Promise<Categoria[]> {
  const { data, error } = await supabaseAdmin()
    .from(TABLAS.categorias)
    .select()
    .order("orden", { ascending: true });

  if (error) throw new Error(`No se pudieron leer las categorías: ${error.message}`);
  return (data ?? []) as Categoria[];
}

/**
 * Guarda categorías. Es un upsert sobre el id —que es el nombre en minúsculas y
 * con guiones—, así que crear una nueva y editar una que ya estaba son la misma
 * operación, y la lista entera se guarda de una sola vez.
 */
export async function guardarCategorias(categorias: Categoria[]): Promise<void> {
  if (categorias.length === 0) return;

  const { error } = await supabaseAdmin().from(TABLAS.categorias).upsert(categorias);

  if (error) throw new Error(`No se pudo guardar la categoría: ${error.message}`);
}

/** Cuántos productos hay en una categoría, contando los que no están publicados. */
export async function contarProductosDe(categoria: string): Promise<number> {
  const { count, error } = await supabaseAdmin()
    .from(TABLAS.productos)
    .select("id", { count: "exact", head: true })
    .eq("categoria", categoria);

  if (error) throw new Error(`No se pudieron contar los productos: ${error.message}`);
  return count ?? 0;
}

/**
 * Borra una categoría. La base la protege igual: `productos.categoria`
 * apunta acá, así que una categoría con productos adentro no se puede borrar.
 */
export async function borrarCategoria(id: string): Promise<void> {
  const { error } = await supabaseAdmin().from(TABLAS.categorias).delete().eq("id", id);

  if (error) throw new Error(`No se pudo borrar la categoría: ${error.message}`);
}

/* ---------- el blog ----------
   Las notas se leen con la publishable key —son públicas, es lo que hay para
   leer—, pero la policy sólo deja ver las que están publicadas y ya salieron.
   Una nota programada no existe para afuera hasta que llega su fecha: la misma
   condición está en la base y acá. */

/** Las notas que ya salieron, la última primero. */
export async function listarNotas(limite = 0): Promise<Nota[]> {
  let consulta = supabase()
    .from(TABLAS.notas)
    .select()
    .eq("publicada", true)
    .lte("fecha", new Date().toISOString())
    .order("fecha", { ascending: false });

  if (limite > 0) consulta = consulta.limit(limite);

  const { data, error } = await consulta;
  if (error) throw new Error(`No se pudieron leer las notas: ${error.message}`);
  return (data ?? []) as Nota[];
}

/** Una nota por su slug, si ya salió. Null si no está o todavía no es su día. */
export async function buscarNotaPublicada(slug: string): Promise<Nota | null> {
  const { data, error } = await supabase()
    .from(TABLAS.notas)
    .select()
    .eq("slug", slug)
    .eq("publicada", true)
    .lte("fecha", new Date().toISOString())
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer la nota: ${error.message}`);
  return (data as Nota | null) ?? null;
}

/* Lo que sigue es del panel: borradores, notas programadas y las escrituras. */

/** El blog entero: borradores, programadas y publicadas. */
export async function listarNotasDelPanel(): Promise<Nota[]> {
  const { data, error } = await supabaseAdmin()
    .from(TABLAS.notas)
    .select()
    .order("fecha", { ascending: false });

  if (error) throw new Error(`No se pudieron leer las notas: ${error.message}`);
  return (data ?? []) as Nota[];
}

/** Una nota por id, para editarla. Null si ya no está. */
export async function buscarNota(id: string): Promise<Nota | null> {
  const { data, error } = await supabaseAdmin()
    .from(TABLAS.notas)
    .select()
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer la nota: ${error.message}`);
  return (data as Nota | null) ?? null;
}

/**
 * La dirección libre más parecida a la que pide el título. Dos notas que se
 * llamen igual no pueden compartir URL, así que la segunda queda en
 * `la-primera-cosecha-2`. Nadie escribe esto a mano: sale del título.
 */
export async function slugLibre(base: string, exceptoId = ""): Promise<string> {
  let consulta = supabaseAdmin().from(TABLAS.notas).select("slug").like("slug", `${base}%`);
  if (exceptoId) consulta = consulta.neq("id", exceptoId);

  const { data, error } = await consulta;
  if (error) throw new Error(`No se pudo revisar la dirección: ${error.message}`);

  const tomadas = new Set((data ?? []).map((fila) => (fila as { slug: string }).slug));
  if (!tomadas.has(base)) return base;

  // el sufijo tiene que entrar en los 80 caracteres que admite la columna
  const raiz = base.slice(0, 76).replace(/-+$/g, "");
  for (let numero = 2; numero < 1000; numero += 1) {
    const intento = `${raiz}-${numero}`;
    if (!tomadas.has(intento)) return intento;
  }

  return `${raiz}-${Date.now().toString(36)}`;
}

/** Agrega una nota y devuelve el id con el que quedó guardada. */
export async function crearNota(datos: DatosNota): Promise<string> {
  const id = crypto.randomUUID();
  const ahora = new Date().toISOString();

  const { error } = await supabaseAdmin()
    .from(TABLAS.notas)
    .insert({ id, creada: ahora, actualizada: ahora, ...datos });

  if (error) throw new Error(`No se pudo guardar la nota: ${error.message}`);
  return id;
}

export async function actualizarNota(id: string, datos: DatosNota): Promise<void> {
  const { error } = await supabaseAdmin()
    .from(TABLAS.notas)
    .update({ ...datos, actualizada: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(`No se pudo guardar la nota: ${error.message}`);
}

/**
 * Sacar una nota del blog o volver a ponerla, sin abrir el formulario. Volver a
 * ponerla no le toca la fecha: si era de la semana pasada, vuelve con la fecha
 * que tenía; si estaba programada, sigue programada.
 */
export async function publicarNota(id: string, publicada: boolean): Promise<void> {
  const { error } = await supabaseAdmin()
    .from(TABLAS.notas)
    .update({ publicada, actualizada: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(`No se pudo cambiar la nota: ${error.message}`);
}

/** Borra una nota de verdad: no queda en ningún lado. */
export async function borrarNota(id: string): Promise<void> {
  const { error } = await supabaseAdmin().from(TABLAS.notas).delete().eq("id", id);

  if (error) throw new Error(`No se pudo borrar la nota: ${error.message}`);
}

/**
 * Agrega la compra y devuelve el objeto tal como quedó guardado.
 *
 * Nace `pagada` porque la pasarela ya le dio el ok, y por la misma razón que
 * las reservas el insert no pide RETURNING ni va con la publishable key: el
 * pedido y la cuenta de quien compra se guardan en el mismo movimiento.
 */
export async function crearCompra(
  datos: NuevaCompra,
  usuarioId: string | null = null
): Promise<Compra> {
  const compra: Compra = {
    id: crypto.randomUUID(),
    codigo: nuevoCodigo("PT"),
    usuario_id: usuarioId,
    estado: "pagada",
    creada: new Date().toISOString(),
    ...datos,
  };

  const { error } = await supabaseAdmin().from(TABLAS.compras).insert(compra);
  if (error) throw new Error(`No se pudo guardar la compra: ${error.message}`);

  return compra;
}

export type FiltroCompras = {
  estado?: CompraEstado;
  /** Sólo las creadas de este momento en adelante (ISO). */
  desde?: string;
};

/**
 * El listado de compras del panel. Va con la secret key: los pedidos tienen
 * nombre, teléfono y mail de quien compró.
 */
export async function listarCompras(filtro: FiltroCompras = {}): Promise<Compra[]> {
  let consulta = supabaseAdmin().from(TABLAS.compras).select();

  if (filtro.estado) consulta = consulta.eq("estado", filtro.estado);
  if (filtro.desde) consulta = consulta.gte("creada", filtro.desde);

  // lo último que entró, primero: es lo que hay que preparar
  const { data, error } = await consulta.order("creada", { ascending: false });

  if (error) throw new Error(`No se pudieron leer las compras: ${error.message}`);
  return (data ?? []) as Compra[];
}

/** Marcar una compra como entregada, o darla de baja, desde el panel. */
export async function cambiarEstadoCompra(id: string, estado: CompraEstado): Promise<void> {
  const { error } = await supabaseAdmin()
    .from(TABLAS.compras)
    .update({ estado })
    .eq("id", id);

  if (error) throw new Error(`No se pudo cambiar el estado de la compra: ${error.message}`);
}

export type FiltroReservas = {
  tipo?: ReservaTipo;
  estado?: ReservaEstado;
  /** Sólo reservas de esta fecha en adelante (YYYY-MM-DD). */
  desde?: string;
  /** Sólo reservas anteriores a esta fecha (YYYY-MM-DD). */
  antesDe?: string;
  /** Las próximas se leen en orden cronológico; el historial, al revés. */
  orden?: "asc" | "desc";
};

/**
 * El listado del panel. Va con la secret key porque `reservas` no tiene policy
 * de SELECT: los teléfonos y los mails no salen de acá para afuera.
 */
export async function listarReservas(filtro: FiltroReservas = {}): Promise<Reserva[]> {
  let consulta = supabaseAdmin().from(TABLAS.reservas).select();

  if (filtro.tipo) consulta = consulta.eq("tipo", filtro.tipo);
  if (filtro.estado) consulta = consulta.eq("estado", filtro.estado);
  if (filtro.desde) consulta = consulta.gte("fecha", filtro.desde);
  if (filtro.antesDe) consulta = consulta.lt("fecha", filtro.antesDe);

  const ascendente = (filtro.orden ?? "asc") === "asc";
  const { data, error } = await consulta
    .order("fecha", { ascending: ascendente })
    .order("hora", { ascending: ascendente });

  if (error) throw new Error(`No se pudieron leer las reservas: ${error.message}`);
  return (data ?? []) as Reserva[];
}

/** Confirmar o cancelar una reserva desde el panel. */
export async function cambiarEstadoReserva(id: string, estado: ReservaEstado): Promise<void> {
  const { error } = await supabaseAdmin()
    .from(TABLAS.reservas)
    .update({ estado })
    .eq("id", id);

  if (error) throw new Error(`No se pudo cambiar el estado: ${error.message}`);
}

/**
 * Los horarios de atención, ordenados por área y día.
 *
 * Son públicos —el sitio los muestra—, así que se leen con la publishable key.
 */
export async function listarHorarios(): Promise<Horario[]> {
  const { data, error } = await supabase()
    .from(TABLAS.horarios)
    .select("area, dia, abierto, desde, hasta, nota")
    .order("area", { ascending: true })
    .order("dia", { ascending: true });

  if (error) throw new Error(`No se pudieron leer los horarios: ${error.message}`);
  return (data ?? []) as Horario[];
}

/**
 * Guarda la semana entera de un área de una sola vez. Es un upsert sobre
 * (área, día), así que cargar un horario que todavía no existe y editar uno que
 * ya estaba son la misma operación. Sólo del panel: la tabla no tiene policy de
 * escritura.
 */
export async function guardarHorarios(area: HorarioArea, semana: Horario[]): Promise<void> {
  const filas = semana.map((horario) => ({
    ...horario,
    area,
    actualizado: new Date().toISOString(),
  }));

  const { error } = await supabaseAdmin()
    .from(TABLAS.horarios)
    .upsert(filas, { onConflict: "area,dia" });

  if (error) throw new Error(`No se pudieron guardar los horarios: ${error.message}`);
}

/* ---------- las secciones que se prenden y se apagan ---------- */

/**
 * Qué secciones del sitio están abiertas.
 *
 * Son públicas —el menú y cada página preguntan por ellas en cada visita—, así
 * que se leen con la publishable key. Lo que no esté cargado cuenta como
 * apagado: la falta de una fila no puede abrir una sección.
 */
export async function listarSecciones(): Promise<Secciones> {
  const { data, error } = await supabase().from(TABLAS.secciones).select("id, activa");

  if (error) throw new Error(`No se pudieron leer las secciones: ${error.message}`);

  const estado: Secciones = { tienda: false, blog: false };
  for (const fila of (data ?? []) as { id: string; activa: boolean }[]) {
    if (fila.id === "tienda" || fila.id === "blog") estado[fila.id] = fila.activa;
  }
  return estado;
}

/**
 * Prende o apaga una sección. Sólo del panel: la tabla no tiene policy de
 * escritura, y es un upsert para que la primera vez no haya que haber corrido
 * ningún alta a mano.
 */
export async function guardarSeccion(seccion: Seccion, activa: boolean): Promise<void> {
  const { error } = await supabaseAdmin()
    .from(TABLAS.secciones)
    .upsert({ id: seccion, activa, actualizado: new Date().toISOString() }, { onConflict: "id" });

  if (error) {
    throw new Error(
      `No se pudo ${activa ? "activar" : "desactivar"} la sección: ${error.message}`
    );
  }
}
