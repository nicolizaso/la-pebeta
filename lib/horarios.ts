import type { Horario, HorarioArea } from "./db";

/**
 * Las reglas de los horarios de atención, del mismo lado que las de las
 * reservas: las usa el formulario del panel para armar la semana y la acción
 * que guarda para no dejar entrar cualquier cosa.
 */

export const AREAS: { id: HorarioArea; etiqueta: string; bajada: string }[] = [
  {
    id: "restaurant",
    etiqueta: "Restaurant",
    bajada: "Cuándo abre la cocina. Es lo que ve quien viene a comer.",
  },
  {
    id: "proveeduria",
    etiqueta: "Proveeduría",
    bajada: "Cuándo se puede pasar a comprar verdura, huevos y conservas.",
  },
];

export function esHorarioArea(valor: unknown): valor is HorarioArea {
  return valor === "proveeduria" || valor === "restaurant";
}

/** Arranca el lunes, que es como se lee un cartel de horarios. */
export const DIAS: { dia: number; nombre: string }[] = [
  { dia: 1, nombre: "Lunes" },
  { dia: 2, nombre: "Martes" },
  { dia: 3, nombre: "Miércoles" },
  { dia: 4, nombre: "Jueves" },
  { dia: 5, nombre: "Viernes" },
  { dia: 6, nombre: "Sábado" },
  { dia: 0, nombre: "Domingo" },
];

export function nombreDia(dia: number): string {
  return DIAS.find((d) => d.dia === dia)?.nombre ?? "";
}

const RE_HORA = /^\d{2}:\d{2}$/;

/**
 * La semana completa de un área: las filas que ya están en la base, más los
 * días que todavía no se cargaron, en cero. Así el formulario siempre muestra
 * los siete renglones aunque la tabla esté vacía.
 */
export function semanaDe(area: HorarioArea, horarios: Horario[]): Horario[] {
  return DIAS.map(({ dia }) => {
    const guardado = horarios.find((h) => h.area === area && h.dia === dia);
    return guardado ?? { area, dia, abierto: false, desde: "", hasta: "", nota: "" };
  });
}

/** "12:00 a 16:00 hs", o "Cerrado" si ese día no abre. */
export function franjaTexto(horario: Horario): string {
  if (!horario.abierto) return "Cerrado";
  return `${horario.desde} a ${horario.hasta} hs`;
}

type Resultado =
  | { ok: true; semana: Horario[] }
  | { ok: false; error: string };

/**
 * Valida los siete días de un área. Las mismas reglas están como constraints de
 * la tabla, igual que en las reservas: acá para poder explicar qué está mal, y
 * allá para que no entre nada raro ni escribiendo contra la base de forma
 * directa.
 */
export function validarSemana(area: HorarioArea, entradas: Horario[]): Resultado {
  const semana: Horario[] = [];

  for (const { dia } of DIAS) {
    const entrada = entradas.find((e) => e.dia === dia);
    if (!entrada) return { ok: false, error: `Falta el ${nombreDia(dia).toLowerCase()}.` };

    const nota = entrada.nota.trim();
    if (nota.length > 120) {
      return { ok: false, error: `La nota del ${nombreDia(dia).toLowerCase()} quedó muy larga.` };
    }

    if (!entrada.abierto) {
      semana.push({ area, dia, abierto: false, desde: "", hasta: "", nota });
      continue;
    }

    const desde = entrada.desde.trim();
    const hasta = entrada.hasta.trim();
    if (!RE_HORA.test(desde) || !RE_HORA.test(hasta)) {
      return {
        ok: false,
        error: `Completá desde y hasta el ${nombreDia(dia).toLowerCase()}, o marcalo cerrado.`,
      };
    }
    // como son HH:MM con cero adelante, comparar los textos alcanza
    if (desde >= hasta) {
      return {
        ok: false,
        error: `El ${nombreDia(dia).toLowerCase()} cierra antes de abrir.`,
      };
    }

    semana.push({ area, dia, abierto: true, desde, hasta, nota });
  }

  return { ok: true, semana };
}
