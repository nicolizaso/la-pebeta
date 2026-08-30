import { NextResponse } from "next/server";
import { asegurarUsuario, crearReserva, type Usuario } from "@/lib/db";
import { validarReserva } from "@/lib/reservas";
import { abrirSesion } from "@/lib/sesion";
import { tieneContrasena } from "@/lib/usuarios";

/**
 * Alta de reservas: cada POST agrega una fila a `reservas`.
 *
 * Acá también nacen las cuentas. Nadie se registra en este sitio: se reserva, y
 * con el mail de la reserva queda hecha la cuenta desde la que después se ven
 * las reservas en `/perfil`. Si esa cuenta todavía no se puso una contraseña,
 * el POST además abre la sesión, así se termina de reservar y ya se está
 * adentro; si ya tiene una, la reserva se toma igual pero la sesión se pide en
 * `/perfil` —de lo contrario alcanzaría con escribir el mail de otra persona
 * para entrar a su cuenta—.
 *
 * Que la cuenta falle no cancela la reserva: primero está atender a quien
 * reserva. La fila queda sin dueño y el perfil no la muestra, que es bastante
 * mejor que perder la mesa.
 *
 * No hay GET a propósito — el listado tiene teléfonos y mails, así que sale
 * por el panel de admin, que lee con la secret key.
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
  const datos = validacion.datos;

  let usuario: Usuario | null = null;
  try {
    usuario = await asegurarUsuario({
      email: datos.email,
      nombre: datos.nombre,
      telefono: datos.telefono,
    });
  } catch (error) {
    console.error("No se pudo abrir la cuenta de quien reserva", error);
  }

  let reserva;
  try {
    reserva = await crearReserva(datos, usuario?.id ?? null);
  } catch (error) {
    console.error("No se pudo guardar la reserva", error);
    return NextResponse.json(
      { ok: false, error: "No pudimos guardar la reserva. Escribinos por WhatsApp y la tomamos a mano." },
      { status: 500 }
    );
  }

  const conContrasena = usuario ? tieneContrasena(usuario) : false;
  if (usuario && !conContrasena) await abrirSesion(usuario);

  return NextResponse.json(
    {
      ok: true,
      reserva,
      cuenta: { entro: Boolean(usuario) && !conContrasena, conContrasena },
    },
    { status: 201 }
  );
}
