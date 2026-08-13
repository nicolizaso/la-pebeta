import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * La "base de datos" del sitio mientras esto es una versión de prueba: un solo
 * JSON en `data/db.json` con las colecciones que maneja el ABM de admin
 * (reservas, productos de la proveeduría y compras).
 *
 * Todo pasa por acá, así que el día que esto se mude a una base de verdad hay
 * un único archivo que reescribir. Ojo con dos cosas mientras tanto:
 *
 *   - Escribe en el filesystem, así que necesita un server con disco propio.
 *     En un deploy serverless (Vercel) el archivo es de sólo lectura y, si no
 *     lo fuera, cada instancia tendría su copia.
 *   - No hay auth: cualquier lectura de las colecciones desde el navegador
 *     expondría datos de contacto. Por eso la API pública sólo escribe.
 */

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

export type DB = {
  meta: { version: number; descripcion: string; actualizado: string };
  reservas: Reserva[];
  productos: Producto[];
  compras: Compra[];
};

const RUTA = path.join(process.cwd(), "data", "db.json");

const VACIA: DB = {
  meta: {
    version: 1,
    descripcion:
      "Base de datos de prueba de La Pebeta: reservas, productos de la proveeduría y compras. Es el archivo al que apunta el ABM de admin.",
    actualizado: new Date(0).toISOString(),
  },
  reservas: [],
  productos: [],
  compras: [],
};

/** Las escrituras se encadenan: dos reservas simultáneas no se pisan. */
let cola: Promise<unknown> = Promise.resolve();

function enCola<T>(tarea: () => Promise<T>): Promise<T> {
  const proxima = cola.then(tarea, tarea);
  cola = proxima.catch(() => {});
  return proxima;
}

export async function leerDB(): Promise<DB> {
  try {
    const crudo = await readFile(RUTA, "utf8");
    const datos = JSON.parse(crudo) as Partial<DB>;
    // una colección que falte no debería tumbar el resto del archivo
    return {
      meta: { ...VACIA.meta, ...datos.meta },
      reservas: datos.reservas ?? [],
      productos: datos.productos ?? [],
      compras: datos.compras ?? [],
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { ...VACIA };
    throw error;
  }
}

/** Escribe a un temporal y renombra, para no dejar el JSON a medio escribir. */
async function guardarDB(db: DB) {
  db.meta.actualizado = new Date().toISOString();
  await mkdir(path.dirname(RUTA), { recursive: true });
  const temporal = `${RUTA}.${process.pid}.tmp`;
  await writeFile(temporal, `${JSON.stringify(db, null, 2)}\n`, "utf8");
  await rename(temporal, RUTA);
}

/**
 * Lee, deja que `cambio` toque las colecciones y vuelve a escribir, todo dentro
 * del mismo turno de la cola. Lo que devuelva `cambio` es lo que devuelve la
 * operación.
 */
export function actualizarDB<T>(cambio: (db: DB) => T | Promise<T>): Promise<T> {
  return enCola(async () => {
    const db = await leerDB();
    const resultado = await cambio(db);
    await guardarDB(db);
    return resultado;
  });
}

/** Código corto y legible para dictar por teléfono: PB-4F2K9A. */
export function nuevoCodigo(prefijo = "PB"): string {
  const alfabeto = "ACDEFGHJKLMNPQRSTUVWXYZ2345679";
  let cuerpo = "";
  for (let i = 0; i < 6; i += 1) {
    cuerpo += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return `${prefijo}-${cuerpo}`;
}

export function nuevoId(): string {
  return randomUUID();
}
