import { NextResponse } from "next/server";
import { propuestaVigente } from "@/lib/consultas";
import {
  asegurarUsuario,
  buscarConsulta,
  crearReserva,
  guardarConsulta,
  type Usuario,
} from "@/lib/db";
import { nombreDeReserva, validarReserva } from "@/lib/reservas";
import { abrirSesion } from "@/lib/sesion";
import { tieneContrasena } from "@/lib/usuarios";

/**
 * El botón de confirmar del chat: toma la reserva que el asistente propuso.
 *
 * Lo único que manda el navegador es el id de la conversación. La reserva se
 * lee de `consultas.propuesta` —donde la dejó `/api/chat`— y se vuelve a validar
 * con `validarReserva`, la misma función que usa el formulario. Ese ida y vuelta
 * es todo el punto: un tool call no es un consentimiento, y una propuesta que
 * viajara al navegador y volviera sería una reserva que cualquiera puede editar
 * antes de apretar.
 *
 * De acá en adelante es una reserva como cualquier otra: entra pendiente, abre
 * la cuenta con el mail y aparece en `/perfil` y en el panel.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "No pudimos leer la confirmación." }, { status: 400 });
  }

  const { consultaId } = (cuerpo ?? {}) as { consultaId?: unknown };
  if (typeof consultaId !== "string" || !consultaId) {
    return NextResponse.json({ ok: false, error: "No encontramos la conversación." }, { status: 400 });
  }

  let consulta;
  try {
    consulta = await buscarConsulta(consultaId);
  } catch (error) {
    console.error("No se pudo leer la conversación para confirmar", error);
    return NextResponse.json(
      { ok: false, error: "No pudimos confirmar la reserva. Probá de nuevo en un minuto." },
      { status: 503 }
    );
  }

  if (!consulta) {
    return NextResponse.json({ ok: false, error: "No encontramos la conversación." }, { status: 404 });
  }

  if (consulta.reserva) {
    return NextResponse.json(
      { ok: false, error: "Esa reserva ya estaba tomada. Mirala en tu perfil." },
      { status: 409 }
    );
  }

  const propuesta = consulta.propuesta;
  if (!propuesta) {
    return NextResponse.json(
      { ok: false, error: "No hay ninguna reserva para confirmar. Pedísela de nuevo al asistente." },
      { status: 409 }
    );
  }

  if (!propuestaVigente(propuesta.propuesta)) {
    return NextResponse.json(
      { ok: false, error: "Esta propuesta ya venció. Pedile al asistente que la arme de nuevo." },
      { status: 409 }
    );
  }

  // La misma puerta que el formulario. Entre que se propuso y que se apretó el
  // botón puede haber cambiado el día: una fecha de ayer no entra por acá.
  const validacion = validarReserva(propuesta.datos);
  if (!validacion.ok) {
    return NextResponse.json(
      { ok: false, error: `${validacion.error} Pedile al asistente que la arme de nuevo.` },
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
    console.error("No se pudo abrir la cuenta de quien reserva por el chat", error);
  }

  let reserva;
  try {
    reserva = await crearReserva(datos, usuario?.id ?? null);
  } catch (error) {
    console.error("No se pudo guardar la reserva del chat", error);
    return NextResponse.json(
      {
        ok: false,
        error: "No pudimos guardar la reserva. Escribinos por WhatsApp y la tomamos a mano.",
      },
      { status: 500 }
    );
  }

  // El hilo se queda con el rastro: quien lo lea desde el panel ve la reserva
  // salir de la conversación, y el asistente no vuelve a ofrecer lo mismo.
  const aviso = `Listo: ${nombreDeReserva(reserva)} para ${reserva.personas} el ${reserva.fecha} a las ${reserva.hora}. Queda pendiente hasta que la casa la confirme. El código es ${reserva.codigo}.`;

  try {
    await guardarConsulta(consulta.id, {
      hilo: [...consulta.hilo, { rol: "asistente", texto: aviso, momento: new Date().toISOString() }],
      estado: "resuelta",
      propuesta: null,
      reserva: reserva.id,
    });
  } catch (error) {
    console.error("No se pudo anotar la reserva en la conversación", error);
  }

  const conContrasena = usuario ? tieneContrasena(usuario) : false;
  if (usuario && !conContrasena) await abrirSesion(usuario);

  return NextResponse.json(
    {
      ok: true,
      reserva,
      aviso,
      cuenta: { entro: Boolean(usuario) && !conContrasena, conContrasena },
    },
    { status: 201 }
  );
}
