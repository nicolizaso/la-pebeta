import { NextResponse } from "next/server";
import { asegurarUsuario, crearCompra, listarCatalogo, type Usuario } from "@/lib/db";
import { seccionActiva } from "@/lib/secciones";
import { abrirSesion } from "@/lib/sesion";
import { validarCompra } from "@/lib/tienda";
import { tieneContrasena } from "@/lib/usuarios";

/**
 * El cierre de la compra: cada POST agrega una fila a `compras`.
 *
 * El carrito manda qué producto y cuántos; los precios y el total se calculan
 * acá contra el catálogo, así que lo que se guarda no depende de lo que haya
 * pasado en el navegador. La tarjeta se revisa en `validarCompra` y no se
 * guarda: la pasarela es ficticia y no hay nada que cobrar.
 *
 * Como en las reservas, el mail del pedido abre la cuenta desde la que después
 * se ve en `/perfil`, y la sesión queda abierta salvo que esa cuenta ya tenga
 * contraseña. Que la cuenta falle no voltea la compra: el pedido se guarda
 * igual, sin dueño.
 *
 * No hay GET: los pedidos tienen nombre y teléfono, así que el listado sale por
 * el panel, que lee del lado del server con la secret key.
 *
 * Con la tienda apagada desde el panel no entra ninguna compra: la puerta está
 * acá y no sólo en la página, porque una URL de API no deja de existir porque
 * la vista se haya escondido.
 */
export async function POST(request: Request) {
  if (!(await seccionActiva("tienda"))) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "La tienda todavía no está abierta. Escribinos por WhatsApp y te tomamos el pedido a mano.",
      },
      { status: 503 }
    );
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "No pudimos leer el pedido." }, { status: 400 });
  }

  let catalogo;
  try {
    catalogo = (await listarCatalogo()).productos;
  } catch (error) {
    console.error("No se pudo leer el catálogo para cerrar la compra", error);
    return NextResponse.json(
      { ok: false, error: "No pudimos abrir el catálogo. Probá de nuevo en un minuto." },
      { status: 503 }
    );
  }

  const validacion = validarCompra(cuerpo, catalogo);
  if (!validacion.ok) {
    return NextResponse.json(
      { ok: false, error: validacion.error, campo: validacion.campo },
      { status: 400 }
    );
  }

  const cliente = validacion.datos.cliente;
  let usuario: Usuario | null = null;
  try {
    usuario = await asegurarUsuario({
      email: cliente.email,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
    });
  } catch (error) {
    console.error("No se pudo abrir la cuenta de quien compra", error);
  }

  let compra;
  try {
    compra = await crearCompra(validacion.datos, usuario?.id ?? null);
  } catch (error) {
    console.error("No se pudo guardar la compra", error);
    return NextResponse.json(
      {
        ok: false,
        error: "No pudimos cerrar la compra. Escribinos por WhatsApp y te la preparamos igual.",
      },
      { status: 500 }
    );
  }

  const conContrasena = usuario ? tieneContrasena(usuario) : false;
  if (usuario && !conContrasena) await abrirSesion(usuario);

  return NextResponse.json(
    {
      ok: true,
      compra,
      cuenta: { entro: Boolean(usuario) && !conContrasena, conContrasena },
    },
    { status: 201 }
  );
}
