import type { PhotoKey } from "./photos";

/**
 * Lo que la casa es y dónde queda: los datos que no viven en la base porque no
 * cambian de una semana a la otra.
 *
 * Estaban escritos adentro del JSX de las secciones que los muestran, y salieron
 * de ahí cuando apareció un segundo lector: el asistente del chat, que tiene que
 * poder contestar dónde queda y cómo se llega sin que nadie lo escriba una
 * segunda vez. Es el mismo criterio que `lib/contacto.ts` con el WhatsApp.
 *
 * Lo que sí cambia —los horarios, el catálogo, las notas— no está acá: está en
 * la base, y el asistente lo lee de ahí.
 */

export const UBICACION = {
  calle: "Camino S.A. de Areco, Km 184",
  localidad: "Los Cardales",
  provincia: "Buenos Aires",
  /** Como lo abrevia el cartel, donde el renglón es corto. */
  provinciaCorta: "Bs. As.",
  /** Cómo se dice en el mapa del sitio. */
  referencia: "Ruta prov. 6, Km 184 — Los Cardales",
  /** Lo que le importa a quien está por manejar hasta acá. */
  distancia: "a 70 minutos de Buenos Aires",
} as const;

/** "Camino S.A. de Areco, Km 184, Los Cardales, Buenos Aires" */
export function direccionCompleta(): string {
  return `${UBICACION.calle}, ${UBICACION.localidad}, ${UBICACION.provincia}`;
}

/**
 * Qué es La Pebeta, en las palabras del sitio. Es la primera cosa que lee el
 * asistente, y lo que abre la home.
 */
export const QUE_ES =
  "La Pebeta es un restaurant, una granja agroecológica y una proveeduría en Los Cardales, " +
  "provincia de Buenos Aires. Todo lo que se sirve en la mesa se sembró antes en la huerta " +
  "de la casa: es farm to table de verdad, no una etiqueta.";

/**
 * Los cuatro rasgos de la carta. No es el menú —ese cambia cada semana y no está
 * cargado en ningún lado— sino cómo funciona la cocina, que es lo que se puede
 * contestar sin inventar.
 */
export const CARTA: {
  num: string;
  title: string;
  text: string;
  photo: PhotoKey;
  alt: string;
}[] = [
  {
    num: "01",
    title: "Carta semanal",
    text: "Cambia cada semana según lo que ofrece la huerta en ese momento.",
    photo: "restaurant/10",
    alt: "Carta del día sobre la mesa puesta, vista desde arriba",
  },
  {
    num: "02",
    title: "Recolección",
    text: "Verduras y frutas cosechadas a diario, del bosque a la cocina.",
    photo: "huerta/16",
    alt: "Trabajador de la huerta cosechando entre las hileras",
  },
  {
    num: "03",
    title: "Carnes de pastura",
    text: "Animales criados a pastoreo, con uso racional de proteína animal.",
    photo: "paseos/3",
    alt: "Vacas Hereford pastando en el campo abierto",
  },
  {
    num: "04",
    title: "Veganas y sin TACC",
    text: "Numerosos platos gluten free y opciones aptas para veganos.",
    photo: "restaurant/11",
    alt: "Ají relleno gratinado servido en plato blanco",
  },
];
