import { supabase } from "./supabase";

/**
 * La capa de datos del sitio: acá viven los tipos y las únicas funciones que
 * hablan con la base. Todo lo demás (la API, el formulario, el ABM que viene)
 * pasa por este archivo, así que mover los datos de lugar es reescribir esto y
 * nada más.
 *
 * Hoy son tres tablas en Postgres (Supabase), con prefijo `pebeta_` porque
 * comparten proyecto con otra app. Cuando La Pebeta tenga su propio proyecto,
 * cambia el prefijo y la conexión; los tipos y las firmas quedan igual.
 */

export const TABLAS = {
  reservas: "pebeta_reservas",
  productos: "pebeta_productos",
  compras: "pebeta_compras",
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
