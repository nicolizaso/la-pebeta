import { supabase, supabaseAdmin } from "./supabase";

/**
 * La capa de datos del sitio: acá viven los tipos y las únicas funciones que
 * hablan con la base. Todo lo demás (la API, el formulario, el panel de admin)
 * pasa por este archivo, así que mover los datos de lugar es reescribir esto y
 * nada más.
 *
 * Hoy son cuatro tablas en Postgres (Supabase), con prefijo `pebeta_` porque
 * comparten proyecto con otra app. Cuando La Pebeta tenga su propio proyecto,
 * cambia el prefijo y la conexión; los tipos y las firmas quedan igual.
 *
 * Las funciones que usan `supabaseAdmin()` saltean RLS y son sólo del panel:
 * están marcadas una por una.
 */

export const TABLAS = {
  reservas: "pebeta_reservas",
  productos: "pebeta_productos",
  compras: "pebeta_compras",
  horarios: "pebeta_horarios",
} as const;

export type ReservaTipo = "paseos" | "restaurant";
export type ReservaEstado = "pendiente" | "confirmada" | "cancelada";

export type Reserva = {
  id: string;
  /** Código corto que se le muestra a quien reserva. */
  codigo: string;
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
  categoria: string;
  activo: boolean;
  creado: string;
};

export type CompraItem = {
  productoId: string;
  nombre: string;
  cantidad: number;
  /** Precio unitario al momento de la compra. */
  precio: number;
};

export type Compra = {
  id: string;
  codigo: string;
  estado: "pendiente" | "pagada" | "entregada" | "cancelada";
  creada: string;
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
 * La fila se arma entera acá y el insert no pide RETURNING a propósito: con
 * RLS, leer la fila recién insertada exige una policy de SELECT, y las
 * reservas no tienen ninguna —nadie puede listar teléfonos ni mails desde
 * afuera—. Los defaults de la tabla quedan igual, como red de contención.
 */
export async function crearReserva(datos: NuevaReserva): Promise<Reserva> {
  const reserva: Reserva = {
    id: crypto.randomUUID(),
    codigo: nuevoCodigo(),
    estado: "pendiente",
    creada: new Date().toISOString(),
    ...datos,
  };

  const { error } = await supabase().from(TABLAS.reservas).insert(reserva);
  if (error) throw new Error(`No se pudo guardar la reserva: ${error.message}`);

  return reserva;
}

/** El catálogo publicado de la proveeduría. */
export async function listarProductos(): Promise<Producto[]> {
  const { data, error } = await supabase()
    .from(TABLAS.productos)
    .select()
    .eq("activo", true)
    .order("categoria", { ascending: true });

  if (error) throw new Error(`No se pudo leer el catálogo: ${error.message}`);
  return (data ?? []) as Producto[];
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
 * El listado del panel. Va con la secret key porque `pebeta_reservas` no tiene
 * policy de SELECT: los teléfonos y los mails no salen de acá para afuera.
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
