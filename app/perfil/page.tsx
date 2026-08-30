import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SiteAnimations } from "@/components/SiteAnimations";
import { CancelarReserva } from "@/components/perfil/CancelarReserva";
import { PerfilContrasena } from "@/components/perfil/PerfilContrasena";
import { PerfilDatos } from "@/components/perfil/PerfilDatos";
import { PerfilPuerta } from "@/components/perfil/PerfilPuerta";
import { WHATSAPP } from "@/lib/contacto";
import { listarComprasDe, listarReservasDe, type Compra, type Reserva } from "@/lib/db";
import { fechaHora, fechaLarga } from "@/lib/fechas";
import { momentoDe, REGLAS, sePuedeCancelar } from "@/lib/reservas";
import { hayClaveDeSesion, usuarioActual } from "@/lib/sesion";
import { precio } from "@/lib/tienda";
import { tieneContrasena } from "@/lib/usuarios";
import { salir } from "./acciones";

/**
 * El perfil: lo que reservaste, lo que compraste y tus datos.
 *
 * La cuenta se abrió sola con la primera reserva, así que a esta página se
 * llega de dos maneras: recién terminada una reserva, ya con la sesión abierta,
 * o escribiendo el mail en la puerta.
 *
 * Todo lo que se muestra se lee con la secret key filtrando por la cuenta de la
 * sesión —`reservas` y `compras` no tienen policy de lectura y no la van a
 * tener—, y por eso la página se arma en cada visita: acá no hay nada que
 * cachear que no sea de alguien.
 */

export const metadata: Metadata = {
  title: "Mi perfil — La Pebeta",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ESTADOS: Record<Reserva["estado"], string> = {
  pendiente: "A confirmar",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
};

const ESTADOS_COMPRA: Record<Compra["estado"], string> = {
  pendiente: "En preparación",
  pagada: "En preparación",
  entregada: "Entregada",
  cancelada: "Cancelada",
};

export default async function PerfilPage() {
  const usuario = await usuarioActual();

  if (!usuario) {
    return (
      <>
        <SiteAnimations />
        <Header />
        <main>
          <section className="perfil-portada">
            <div className="wrap">
              <div className="eyebrow reveal">Mi perfil</div>
              <h1 className="reveal">Tus reservas, en un solo lugar.</h1>
              <p className="reveal">
                Acá están los paseos y las mesas que pediste, tus pedidos de la proveeduría y los
                datos con los que te llamamos para confirmar.
              </p>
            </div>
          </section>
          <section className="perfil-cuerpo">
            <div className="wrap perfil-puerta-wrap">
              <PerfilPuerta />
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  let reservas: Reserva[] = [];
  let compras: Compra[] = [];
  let fallo = false;

  try {
    [reservas, compras] = await Promise.all([
      listarReservasDe(usuario.id),
      listarComprasDe(usuario.id),
    ]);
  } catch (error) {
    console.error("No se pudo leer el perfil", error);
    fallo = true;
  }

  const ahora = new Date();
  // lo que todavía va a pasar, de lo más próximo a lo más lejano; lo demás
  // —lo que ya fue y lo cancelado— cae al historial, que se lee al revés
  const esProxima = (reserva: Reserva) => {
    if (reserva.estado === "cancelada") return false;
    const momento = momentoDe(reserva);
    return momento !== null && momento.getTime() > ahora.getTime();
  };
  const proximas = reservas.filter(esProxima).reverse();
  const pasadas = reservas.filter((reserva) => !esProxima(reserva));

  const nombre = usuario.nombre.split(" ")[0];

  return (
    <>
      <SiteAnimations />
      <Header />
      <main>
        <section className="perfil-portada">
          <div className="wrap">
            <div className="eyebrow reveal">Mi perfil</div>
            <h1 className="reveal">{nombre ? `Hola, ${nombre}.` : "Hola."}</h1>
            <p className="reveal">{usuario.email}</p>
            <form action={salir} className="perfil-salir">
              <button type="submit">Cerrar sesión</button>
            </form>
          </div>
        </section>

        <section className="perfil-cuerpo">
          <div className="wrap">
            {fallo ? (
              <p className="perfil-caido">
                No pudimos leer tus reservas: la base no contestó. Recargá en un rato y, si sigue
                así, escribinos por WhatsApp.
              </p>
            ) : null}

            {hayClaveDeSesion() ? null : (
              <p className="perfil-caido">
                Ojo: no hay <code>SESION_SECRET</code> configurada, así que las sesiones se caen
                cada vez que se reinicia el server. En producción hay que ponerla.
              </p>
            )}

            <section className="perfil-bloque">
              <h2>Lo que viene</h2>
              {proximas.length === 0 ? (
                <p className="perfil-vacio">
                  No tenés nada reservado.{" "}
                  <Link href="/reservas">Pedí un paseo o una mesa</Link>.
                </p>
              ) : (
                <ul className="perfil-lista">
                  {proximas.map((reserva) => {
                    const permiso = sePuedeCancelar(reserva, ahora);
                    return (
                      <li key={reserva.id} className="perfil-item">
                        <div className="perfil-item-cuando">
                          <strong>{fechaLarga(reserva.fecha)}</strong>
                          <span>{reserva.hora} hs</span>
                        </div>
                        <div className="perfil-item-que">
                          <span className="perfil-item-tipo">{REGLAS[reserva.tipo].etiqueta}</span>
                          <span className="perfil-item-detalle">
                            {reserva.personas}{" "}
                            {reserva.personas === 1 ? "persona" : "personas"} · código{" "}
                            <span className="perfil-codigo">{reserva.codigo}</span>
                          </span>
                          {reserva.comentarios ? (
                            <span className="perfil-item-nota">{reserva.comentarios}</span>
                          ) : null}
                        </div>
                        <div className="perfil-item-estado">
                          <span className={`perfil-estado ${reserva.estado}`}>
                            {ESTADOS[reserva.estado]}
                          </span>
                          {permiso.ok ? (
                            <CancelarReserva id={reserva.id} codigo={reserva.codigo} />
                          ) : (
                            <a
                              className="perfil-btn"
                              href={WHATSAPP}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Escribinos
                            </a>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {pasadas.length > 0 ? (
              <section className="perfil-bloque">
                <h2>Historial</h2>
                <ul className="perfil-lista apagada">
                  {pasadas.map((reserva) => (
                    <li key={reserva.id} className="perfil-item">
                      <div className="perfil-item-cuando">
                        <strong>{fechaLarga(reserva.fecha)}</strong>
                        <span>{reserva.hora} hs</span>
                      </div>
                      <div className="perfil-item-que">
                        <span className="perfil-item-tipo">{REGLAS[reserva.tipo].etiqueta}</span>
                        <span className="perfil-item-detalle">
                          {reserva.personas} {reserva.personas === 1 ? "persona" : "personas"} ·
                          código <span className="perfil-codigo">{reserva.codigo}</span>
                        </span>
                      </div>
                      <div className="perfil-item-estado">
                        <span className={`perfil-estado ${reserva.estado}`}>
                          {ESTADOS[reserva.estado]}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="perfil-bloque">
              <h2>Tus pedidos</h2>
              {compras.length === 0 ? (
                <p className="perfil-vacio">
                  Todavía no compraste nada. <Link href="/tienda">Mirá la proveeduría</Link>.
                </p>
              ) : (
                <ul className="perfil-lista">
                  {compras.map((compra) => (
                    <li key={compra.id} className="perfil-item">
                      <div className="perfil-item-cuando">
                        <strong>{fechaHora(compra.creada)}</strong>
                        <span className="perfil-codigo">{compra.codigo}</span>
                      </div>
                      <div className="perfil-item-que">
                        <span className="perfil-item-tipo">{precio(compra.total)}</span>
                        <span className="perfil-item-detalle">
                          {compra.items
                            .map((item) => `${item.cantidad} × ${item.nombre}`)
                            .join(" · ")}
                        </span>
                      </div>
                      <div className="perfil-item-estado">
                        <span className={`perfil-estado ${compra.estado}`}>
                          {ESTADOS_COMPRA[compra.estado]}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="perfil-bloque">
              <h2>Tus datos</h2>
              <PerfilDatos
                nombre={usuario.nombre}
                telefono={usuario.telefono}
                email={usuario.email}
              />
            </section>

            <section className="perfil-bloque">
              <h2>{tieneContrasena(usuario) ? "Tu contraseña" : "Poner una contraseña"}</h2>
              <PerfilContrasena puesta={usuario.password_puesta} />
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
