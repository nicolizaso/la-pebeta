import type { PhotoKey } from "./photos";

/**
 * Los dos paseos de La Pebeta, en un solo lugar.
 *
 * Los mismos datos —los días, la duración, el costo, lo que hace falta para
 * venir— se muestran en la página de paseos, en la home y en la de
 * reservas. Están acá para que no se contradigan entre pantallas: si cambia el
 * precio o el horario, se cambia una vez.
 */

/** Lo que sale el recorrido por la granja, por persona. Los chicos no pagan. */
export const PRECIO_GRANJA = 18_000;

/** Viernes, sábados y domingos, a las 11. Los dos salen juntos. */
export const DIAS_TEXTO = "Viernes, sábados y domingos";
export const HORA_SALIDA = "11:00";

export type PaseoId = "huerta" | "granja";

export type Paseo = {
  id: PaseoId;
  /** El número con el que se anuncia en la página. */
  orden: string;
  eyebrow: string;
  nombre: string;
  /** El subtítulo que lo distingue del otro: "Paseo consciente". */
  modalidad: string;
  /** El costo, ya escrito para mostrar. */
  costo: string;
  /** Una línea con lo que hay que saber para elegirlo en el formulario. */
  resumen: string;
  /** La frase de arriba de todo, la que invita. */
  claim: string;
  /** Los párrafos de la descripción principal. */
  descripcion: string[];
  /** La ficha de datos clave. */
  ficha: { k: string; v: string }[];
  foto: PhotoKey;
  fotoAlt: string;
  fotoTag: string;
  fotoChica: PhotoKey;
  fotoChicaAlt: string;
};

export const PASEOS: Paseo[] = [
  {
    id: "huerta",
    orden: "01",
    eyebrow: "Paseo 01 — Sin cargo",
    nombre: "Visita a la Huerta",
    modalidad: "Paseo consciente",
    costo: "Sin cargo",
    resumen: "40 minutos, sin cargo, apta para toda la familia",
    claim:
      "Descubrí los secretos del cultivo agroecológico y caminá entre los frutales de La Pebeta.",
    descripcion: [
      "Te invitamos a conectar con la tierra a través de un paseo informativo y educativo por nuestra huerta. Durante aproximadamente 40 minutos, aprendés sobre nuestros métodos de cultivo orgánico, los ritmos de cada temporada y el trabajo diario detrás de cada verdura y cada fruta.",
      "Caminás entre árboles frutales y canteros biodiversos, descubriendo la historia humana y agroecológica que sostiene la cocina de La Pebeta.",
    ],
    ficha: [
      { k: "Días", v: DIAS_TEXTO },
      { k: "Salida", v: `${HORA_SALIDA} hs` },
      { k: "Duración", v: "40 minutos aprox." },
      { k: "Recorrido", v: "Caminata por la huerta y los frutales" },
      { k: "Exigencia física", v: "Baja, caminata tranquila" },
      { k: "Aptitud", v: "Apta para toda la familia" },
      { k: "Costo", v: "Paseo sin cargo por persona" },
      { k: "Al terminar", v: "Tu mesa lista para almorzar" },
      { k: "Requisito", v: "Reserva previa" },
    ],
    foto: "huerta/13",
    fotoAlt: "Canteros de hoja bajo el riego, con una persona cosechando al fondo",
    fotoTag: "Huerta — 40 minutos",
    fotoChica: "huerta/11",
    fotoChicaAlt: "Cítrico maduro entre las hojas del árbol",
  },
  {
    id: "granja",
    orden: "02",
    eyebrow: "Paseo 02 — Arancelada",
    nombre: "Paseo por la Granja",
    modalidad: "Recorrido productivo",
    costo: "$18.000 por persona",
    resumen: "1 hora y 30 minutos, 2 km a pie, $18.000 por persona (mayores de 10 años)",
    claim:
      "A continuación del recorrido por la huerta, la visita sigue al sector de animales: 2 km a pie para descubrir el origen y la trazabilidad de los alimentos que llegan a tu mesa.",
    descripcion: [
      "A lo largo de un recorrido guiado a pie de aproximadamente 2 km —una hora y media de duración—, transitamos los distintos espacios donde cultivamos, criamos y trabajamos con respeto y dedicación.",
      "Es un paseo profundamente educativo y de observación consciente, pensado para comprender el ciclo natural de la tierra y los procesos sostenibles que dan vida a nuestra propuesta gastronómica. Contemplamos a los animales y los cultivos respetando su espacio, su ritmo y su hábitat natural.",
    ],
    ficha: [
      { k: "Días", v: DIAS_TEXTO },
      { k: "Salida", v: `${HORA_SALIDA} hs` },
      { k: "Duración", v: "1 hora y 30 minutos aprox." },
      { k: "Recorrido", v: "2 km a pie: huerta y espacios productivos" },
      { k: "Exigencia física", v: "Moderada, por terreno rural" },
      { k: "Edades", v: "Recomendado para mayores de 10 años" },
      {
        k: "Accesibilidad",
        v: "No recomendado para personas con movilidad reducida ni para el tránsito con cochecitos",
      },
      { k: "Costo", v: "$18.000 por persona, niños sin cargo" },
      { k: "Al terminar", v: "Tu mesa lista para almorzar" },
      { k: "Requisito", v: "Reserva previa" },
    ],
    foto: "paseos/13",
    fotoAlt: "Novillo Hereford mirando a cámara en el pastizal",
    fotoTag: "Granja — 2 km, 1:30 hs",
    fotoChica: "paseos/5",
    fotoChicaAlt: "Bol de madera con huevos de campo recién juntados",
  },
];

/** Los ids, para validar lo que llega del formulario. */
export const PASEO_IDS: PaseoId[] = PASEOS.map((paseo) => paseo.id);

export function esPaseoId(valor: unknown): valor is PaseoId {
  return typeof valor === "string" && (PASEO_IDS as string[]).includes(valor);
}

/**
 * El paseo de un id que viene de la base o del formulario, que TypeScript no
 * puede validar. Null si no es ninguno de los dos —una reserva vieja, tomada
 * antes de que se pudiera elegir, guarda la cadena vacía—.
 */
export function buscarPaseo(id: string): Paseo | null {
  return PASEOS.find((paseo) => paseo.id === id) ?? null;
}

/**
 * La tabla comparativa. Se escribe aparte de las fichas porque dice lo mismo
 * más corto: acá se leen los dos paseos de una, renglón contra renglón.
 */
export const COMPARATIVA: { k: string; huerta: string; granja: string }[] = [
  {
    k: "Días y horarios",
    huerta: `${DIAS_TEXTO}, ${HORA_SALIDA} hs`,
    granja: `${DIAS_TEXTO}, ${HORA_SALIDA} hs`,
  },
  { k: "Duración estimada", huerta: "40 minutos aprox.", granja: "1 hora y 30 minutos aprox." },
  {
    k: "Recorrido",
    huerta: "Caminata amena por la huerta y los frutales",
    granja: "A continuación de la huerta, los espacios productivos (2 km en total)",
  },
  { k: "Costo", huerta: "Sin cargo", granja: "$18.000 por persona, niños sin cargo" },
  {
    k: "Público",
    huerta: "Todo público, caminata liviana",
    granja:
      "Mayores de 10 años. No recomendado con movilidad reducida ni con cochecitos de bebé",
  },
  { k: "Modalidad", huerta: "Con reserva previa", granja: "Con reserva previa" },
  {
    k: "Al terminar",
    huerta: "Mesa lista para almorzar",
    granja: "Mesa lista para almorzar",
  },
];

/** Lo que conviene traer. Vale igual para los dos paseos. */
export const RECOMENDACIONES: { titulo: string; texto: string }[] = [
  {
    titulo: "En verano",
    texto: "Gorro, repelente y una botella de agua: gran parte del recorrido es a cielo abierto.",
  },
  {
    titulo: "Después de días de lluvia",
    texto: "Botas de lluvia. El campo tarda en secarse y el camino se pone blando.",
  },
];
