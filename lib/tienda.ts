import type { CompraItem, NuevaCompra, Producto } from "./db";
import type { PhotoAsset } from "./photo-manifest.generated";

/**
 * Las reglas de la tienda, del mismo lado que las de las reservas: las usa la
 * página —para filtrar, sumar y avisar antes de mandar— y la API, que es la que
 * realmente decide. Los precios nunca salen del navegador: el carrito manda qué
 * producto y cuántos, y el total se vuelve a calcular contra el catálogo.
 *
 * Este módulo lo importa código de cliente, así que no puede tocar la base ni
 * el manifiesto de fotos.
 */

/**
 * Un producto listo para mostrarse: el de la base más su foto ya resuelta
 * contra el manifiesto. La resuelve la página, del lado del server, para no
 * mandarle al navegador el manifiesto entero por veintiocho fotos.
 */
export type ProductoVista = Producto & { imagen: PhotoAsset | null };

/** Cuántas unidades del mismo producto entran en un pedido. */
export const MAX_UNIDADES = 20;
/** Cuántos renglones distintos entran. La tabla tiene el mismo tope. */
export const MAX_RENGLONES = 40;

const PESOS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

/** "$ 6.800" */
export function precio(pesos: number): string {
  return PESOS.format(pesos);
}

/** Sin acentos y en minúsculas, para que el buscador no dependa de la tilde. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export type Orden = "categoria" | "precio-asc" | "precio-desc" | "nombre";

export const ORDENES: { valor: Orden; texto: string }[] = [
  { valor: "categoria", texto: "Por categoría" },
  { valor: "precio-asc", texto: "Precio: de menor a mayor" },
  { valor: "precio-desc", texto: "Precio: de mayor a menor" },
  { valor: "nombre", texto: "Alfabético" },
];

export type FiltroTienda = {
  texto: string;
  /** El id de una categoría, o "" para todo el catálogo. */
  categoria: string;
  soloConStock: boolean;
  /** Precio máximo por unidad, en pesos. */
  hasta: number;
  orden: Orden;
};

export function filtroInicial(hasta: number): FiltroTienda {
  return { texto: "", categoria: "", soloConStock: false, hasta, orden: "categoria" };
}

/**
 * El recorte del catálogo que se ve en la grilla. Es genérico porque la página
 * le agrega la foto a cada producto antes de mandarlo al cliente.
 */
export function filtrarProductos<T extends Producto>(productos: T[], filtro: FiltroTienda): T[] {
  const buscado = normalizar(filtro.texto);

  const recorte = productos.filter((producto) => {
    if (filtro.categoria && producto.categoria !== filtro.categoria) return false;
    if (filtro.soloConStock && producto.stock < 1) return false;
    if (producto.precio > filtro.hasta) return false;
    if (!buscado) return true;

    const donde = normalizar(`${producto.nombre} ${producto.descripcion} ${producto.unidad}`);
    // cada palabra por separado: "mermelada naranja" encuentra igual
    return buscado.split(/\s+/).every((palabra) => donde.includes(palabra));
  });

  if (filtro.orden === "categoria") return recorte;

  return [...recorte].sort((uno, otro) => {
    if (filtro.orden === "precio-asc") return uno.precio - otro.precio;
    if (filtro.orden === "precio-desc") return otro.precio - uno.precio;
    return uno.nombre.localeCompare(otro.nombre, "es");
  });
}

/* ---------- la pasarela de pago ----------
   Es ficticia y lo dice en pantalla: no hay cobro, no se guarda nada de la
   tarjeta y se puede terminar la compra con los campos vacíos. Lo que sí hace
   es revisar lo que se haya escrito, para que el formulario se comporte como
   uno de verdad cuando alguien carga datos. */

export type DatosTarjeta = {
  numero: string;
  /** MM/AA */
  vencimiento: string;
  cvv: string;
  titular: string;
};

/** La que ofrece el botón "usar tarjeta de prueba". Pasa todas las revisiones. */
export const TARJETA_DEMO: DatosTarjeta = {
  numero: "4111 1111 1111 1111",
  vencimiento: "12/30",
  cvv: "123",
  titular: "LA PEBETA",
};

export const TARJETA_VACIA: DatosTarjeta = { numero: "", vencimiento: "", cvv: "", titular: "" };

type ResultadoPago = { ok: true } | { ok: false; error: string; campo: string };

const soloDigitos = (valor: string) => valor.replace(/\D/g, "");

/** El dígito verificador que usan todas las tarjetas. */
function pasaLuhn(numero: string): boolean {
  let suma = 0;
  let doble = false;
  for (let i = numero.length - 1; i >= 0; i -= 1) {
    let cifra = Number(numero[i]);
    if (doble) {
      cifra *= 2;
      if (cifra > 9) cifra -= 9;
    }
    suma += cifra;
    doble = !doble;
  }
  return suma % 10 === 0;
}

const texto = (valor: unknown) => (typeof valor === "string" ? valor.trim() : "");

export function leerTarjeta(cuerpo: unknown): DatosTarjeta {
  const datos = (cuerpo ?? {}) as Record<string, unknown>;
  return {
    numero: texto(datos.numero),
    vencimiento: texto(datos.vencimiento),
    cvv: texto(datos.cvv),
    titular: texto(datos.titular),
  };
}

/**
 * La revisión de la tarjeta.
 *
 * Con los cuatro campos vacíos aprueba: es una demo y la idea es poder llegar
 * al final sin inventarse un número. Lo que está escrito, en cambio, se revisa
 * campo por campo, así el error aparece donde está el problema.
 */
export function autorizarPago(tarjeta: DatosTarjeta, ahora = new Date()): ResultadoPago {
  const numero = soloDigitos(tarjeta.numero);
  const cvv = soloDigitos(tarjeta.cvv);
  const vencimiento = tarjeta.vencimiento.trim();

  if (!numero && !cvv && !vencimiento && !tarjeta.titular) return { ok: true };

  if (numero) {
    if (numero.length < 13 || numero.length > 19) {
      return { ok: false, error: "Un número de tarjeta tiene entre 13 y 19 dígitos.", campo: "numero" };
    }
    if (!pasaLuhn(numero)) {
      return { ok: false, error: "Ese número de tarjeta no es válido. Revisá los dígitos.", campo: "numero" };
    }
  }

  if (vencimiento) {
    const partes = /^(\d{2})\s*\/?\s*(\d{2})$/.exec(vencimiento);
    if (!partes) {
      return { ok: false, error: "El vencimiento va como MM/AA.", campo: "vencimiento" };
    }
    const mes = Number(partes[1]);
    const anio = 2000 + Number(partes[2]);
    if (mes < 1 || mes > 12) {
      return { ok: false, error: "Ese mes no existe.", campo: "vencimiento" };
    }
    // vence el último día del mes, así que sigue viva todo ese mes
    const ultimoDia = new Date(anio, mes, 0, 23, 59, 59);
    if (ultimoDia < ahora) {
      return { ok: false, error: "Esa tarjeta ya venció.", campo: "vencimiento" };
    }
  }

  if (cvv && (cvv.length < 3 || cvv.length > 4)) {
    return { ok: false, error: "El código de seguridad tiene 3 o 4 dígitos.", campo: "cvv" };
  }

  return { ok: true };
}

/* ---------- el pedido ---------- */

/** Lo que manda el carrito: qué producto y cuántos. Nada de precios. */
export type ItemPedido = { productoId: string; cantidad: number };

type ResultadoCompra =
  | { ok: true; datos: NuevaCompra }
  | { ok: false; error: string; campo?: string };

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RE_TELEFONO = /^[\d\s+()-]{6,30}$/;

/**
 * Valida el pedido entero contra el catálogo: quién compra, qué se lleva y
 * cuánto sale. El precio y el nombre de cada renglón salen de la base, no del
 * navegador, y quedan copiados en la compra para que el ticket no cambie si
 * después se toca el catálogo.
 */
export function validarCompra(cuerpo: unknown, catalogo: Producto[]): ResultadoCompra {
  const datos = (cuerpo ?? {}) as Record<string, unknown>;
  const cliente = (datos.cliente ?? {}) as Record<string, unknown>;

  const nombre = texto(cliente.nombre);
  if (nombre.length < 2 || nombre.length > 80) {
    return { ok: false, error: "Escribí tu nombre y apellido.", campo: "nombre" };
  }

  const telefono = texto(cliente.telefono);
  if (!RE_TELEFONO.test(telefono)) {
    return { ok: false, error: "Dejanos un teléfono para avisarte cuando esté listo.", campo: "telefono" };
  }

  // el mail dejó de ser opcional, igual que en una reserva: con él se arma la
  // cuenta desde la que después se ve el pedido en el perfil
  const email = texto(cliente.email).toLowerCase();
  if (!email) {
    return { ok: false, error: "Dejanos tu mail: con eso vas a ver tu pedido.", campo: "email" };
  }
  if (email.length > 120 || !RE_EMAIL.test(email)) {
    return { ok: false, error: "Ese mail no parece válido.", campo: "email" };
  }

  const crudos = Array.isArray(datos.items) ? datos.items : [];
  if (crudos.length === 0) {
    return { ok: false, error: "El carrito está vacío.", campo: "items" };
  }
  if (crudos.length > MAX_RENGLONES) {
    return { ok: false, error: "El pedido tiene demasiados productos distintos.", campo: "items" };
  }

  const items: CompraItem[] = [];
  const vistos = new Set<string>();

  for (const crudo of crudos) {
    const item = (crudo ?? {}) as Record<string, unknown>;
    const productoId = texto(item.productoId);
    const producto = catalogo.find((p) => p.id === productoId);

    if (!producto) {
      return { ok: false, error: "Uno de los productos ya no está en el catálogo.", campo: "items" };
    }
    if (vistos.has(productoId)) {
      return { ok: false, error: "Ese producto está dos veces en el pedido.", campo: "items" };
    }
    vistos.add(productoId);

    const cantidad = Number(item.cantidad);
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_UNIDADES) {
      return {
        ok: false,
        error: `De cada producto se pueden llevar hasta ${MAX_UNIDADES} unidades.`,
        campo: "items",
      };
    }
    if (cantidad > producto.stock) {
      return {
        ok: false,
        error: `De ${producto.nombre} nos quedan ${producto.stock}.`,
        campo: "items",
      };
    }

    items.push({
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad,
      precio: producto.precio,
    });
  }

  const pago = autorizarPago(leerTarjeta(datos.pago));
  if (!pago.ok) return { ok: false, error: pago.error, campo: pago.campo };

  const total = items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

  return { ok: true, datos: { cliente: { nombre, telefono, email }, items, total } };
}
