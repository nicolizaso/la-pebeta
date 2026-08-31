import { NextResponse } from "next/server";
import { hayAsistente, leerContexto, responder } from "@/lib/asistente";
import {
  AVISO_LLENO,
  MAX_POR_HORA,
  VENTANA,
  hiloLleno,
  huellaDe,
  ipDe,
  validarEntrada,
} from "@/lib/consultas";
import {
  buscarConsulta,
  contarConsultasDe,
  crearConsulta,
  guardarConsulta,
  type CambioConsulta,
  type Consulta,
  type MensajeConsulta,
} from "@/lib/db";

/**
 * El chat: un POST por pregunta, y la respuesta baja en vivo.
 *
 * Es el único que habla con el modelo. El navegador manda el id de la
 * conversación y el texto; acá se lee la fila entera de la base, se contesta con
 * ese hilo y se vuelve a guardar. El historial nunca viaja desde el cliente: si
 * viajara, alcanzaría con editarlo para hacerle decir cualquier cosa al
 * asistente, y para eso está la tabla.
 *
 * Baja como SSE porque una respuesta que aparece letra por letra se lee mientras
 * se escribe, y porque una llamada al modelo puede tardar más que el timeout de
 * un fetch común.
 *
 * El freno del gasto es doble: cuántas conversaciones abre la misma huella en
 * una hora, y cuántos turnos aguanta una conversación. Ninguno de los dos es un
 * rate limit de verdad —haría falta Redis, que este stack no tiene— pero los dos
 * juntos acotan lo que puede costar una tarde con alguien haciendo `curl`.
 */

/** Nada de esto se puede prerenderizar: cada visita es una conversación. */
export const dynamic = "force-dynamic";

/** Una línea de SSE. El widget la lee con un parser de tres renglones. */
function evento(dato: unknown): string {
  return `data: ${JSON.stringify(dato)}\n\n`;
}

function ahora(): string {
  return new Date().toISOString();
}

export async function POST(request: Request) {
  if (!hayAsistente()) {
    return NextResponse.json(
      {
        ok: false,
        error: "El asistente está apagado en este momento. Escribinos por WhatsApp.",
      },
      { status: 503 }
    );
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "No pudimos leer tu mensaje." }, { status: 400 });
  }

  const validacion = validarEntrada(cuerpo);
  if (!validacion.ok) {
    return NextResponse.json({ ok: false, error: validacion.error }, { status: 400 });
  }
  const entrada = validacion.datos;
  const huella = huellaDe(ipDe(request.headers));

  // La conversación: la que sigue, o una nueva. Un id que no existe —una fila
  // borrada desde el panel, una pestaña de ayer— empieza de cero en vez de
  // fallar: para quien pregunta, el chat simplemente arranca otra vez.
  let consulta: Consulta | null = null;

  if (entrada.consultaId) {
    try {
      consulta = await buscarConsulta(entrada.consultaId);
    } catch (error) {
      console.error("No se pudo leer la conversación", error);
      return NextResponse.json(
        { ok: false, error: "No pudimos seguir la conversación. Probá de nuevo." },
        { status: 503 }
      );
    }
  }

  const preguntando: MensajeConsulta = { rol: "persona", texto: entrada.texto, momento: ahora() };

  if (!consulta) {
    try {
      const abiertas = await contarConsultasDe(huella, new Date(Date.now() - VENTANA).toISOString());
      if (abiertas >= MAX_POR_HORA) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Ya abriste varias conversaciones seguidas. Esperá un rato o escribinos por WhatsApp.",
          },
          { status: 429 }
        );
      }

      consulta = await crearConsulta({ hilo: [preguntando], pagina: entrada.pagina, huella });
    } catch (error) {
      console.error("No se pudo abrir la conversación", error);
      return NextResponse.json(
        { ok: false, error: "No pudimos abrir el chat. Escribinos por WhatsApp." },
        { status: 503 }
      );
    }
  } else {
    // Una conversación que llegó al tope se cierra sin llamar al modelo: la
    // respuesta es siempre la misma y no hace falta pagarla.
    if (hiloLleno(consulta.hilo)) {
      return NextResponse.json({ ok: false, error: AVISO_LLENO }, { status: 409 });
    }
    consulta.hilo = [...consulta.hilo, preguntando];
  }

  const abierta = consulta;
  const contexto = await leerContexto();

  const stream = new ReadableStream<Uint8Array>({
    async start(controlador) {
      const codificador = new TextEncoder();
      let cerrado = false;

      // Quien pregunta puede cerrar la pestaña en la mitad de una respuesta. El
      // stream se cae, pero el turno se termina igual y se guarda: la próxima
      // vez que abra el chat, la conversación está entera.
      const escribir = (dato: unknown) => {
        if (cerrado) return;
        try {
          controlador.enqueue(codificador.encode(evento(dato)));
        } catch {
          cerrado = true;
        }
      };

      // Lo primero que baja es el id: con eso el widget puede seguir la
      // conversación aunque la respuesta se corte a la mitad.
      escribir({ tipo: "consulta", id: abierta.id, codigo: abierta.codigo });

      const cambio: CambioConsulta = { hilo: abierta.hilo };
      let dicho = "";

      try {
        for await (const suceso of responder(abierta.hilo, contexto)) {
          if (suceso.tipo === "texto") {
            dicho += suceso.texto;
            escribir(suceso);
            continue;
          }

          if (suceso.tipo === "derivar") {
            cambio.estado = "derivada";
            escribir({ tipo: "derivar" });
            continue;
          }

          // La propuesta se guarda del lado del server y al navegador sólo le
          // baja para mostrarla. Lo que se confirma después se relee de la base:
          // el botón manda un id, no una reserva.
          cambio.propuesta = { datos: suceso.datos, propuesta: ahora() };
          cambio.contacto = {
            ...abierta.contacto,
            nombre: suceso.datos.nombre,
            telefono: suceso.datos.telefono,
            email: suceso.datos.email,
          };
          escribir({ tipo: "propuesta", datos: suceso.datos });
        }
      } catch (error) {
        console.error("El asistente no pudo contestar", error);
        escribir({
          tipo: "error",
          error: "Se me cortó la conexión. Probá de nuevo o escribinos por WhatsApp.",
        });
      }

      if (dicho.trim()) {
        cambio.hilo = [...cambio.hilo, { rol: "asistente", texto: dicho.trim(), momento: ahora() }];
      }

      try {
        await guardarConsulta(abierta.id, cambio);
      } catch (error) {
        // Que no se guarde no le arruina la respuesta a quien preguntó: ya la
        // leyó. Lo que se pierde es el turno en el panel, y eso va al log.
        console.error("No se pudo guardar el turno de la conversación", error);
      }

      escribir({ tipo: "fin" });
      if (!cerrado) controlador.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
