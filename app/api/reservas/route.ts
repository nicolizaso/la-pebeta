import { NextResponse } from "next/server";
import { actualizarDB, nuevoCodigo, nuevoId, type Reserva } from "@/lib/db";
import { validarReserva } from "@/lib/reservas";

/**
 * Alta de reservas: cada POST agrega un objeto a `reservas` en data/db.json.
 *
 * No hay GET a propósito — el listado tiene teléfonos y mails, así que sale
 * por el ABM de admin cuando tenga auth, no por una ruta pública.
 */
export async function POST(request: Request) {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "No pudimos leer el formulario." }, { status: 400 });
  }

  const validacion = validarReserva(cuerpo);
  if (!validacion.ok) {
    return NextResponse.json(
      { ok: false, error: validacion.error, campo: validacion.campo },
      { status: 400 }
    );
  }

  const reserva: Reserva = {
    id: nuevoId(),
    codigo: nuevoCodigo(),
    estado: "pendiente",
    creada: new Date().toISOString(),
    ...validacion.datos,
  };

  try {
    await actualizarDB((db) => {
      db.reservas.push(reserva);
    });
  } catch (error) {
    console.error("No se pudo guardar la reserva", error);
    return NextResponse.json(
      { ok: false, error: "No pudimos guardar la reserva. Escribinos por WhatsApp y la tomamos a mano." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, reserva }, { status: 201 });
}
