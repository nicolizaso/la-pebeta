import Link from "next/link";
import { AdminAviso, FaltaSecretKey } from "@/components/admin/AdminAviso";
import { esReservaTipo, hoyISO, nombreDeReserva } from "@/lib/reservas";
import { fechaCorta } from "@/lib/fechas";
import { listarReservas, type Reserva, type ReservaEstado } from "@/lib/db";
import { hayClaveDeAdmin } from "@/lib/supabase";
import { cambiarEstado } from "../acciones";

/**
 * El listado de reservas: paseos y mesas en la misma tabla, con los filtros
 * como links para que cada recorte tenga su URL y se pueda dejar abierto.
 */

type Params = { tipo?: string; estado?: string; cuando?: string };

const CUANDO = [
  { valor: "proximas", texto: "Próximas" },
  { valor: "pasadas", texto: "Pasadas" },
  { valor: "todas", texto: "Todas" },
];

const TIPOS = [
  { valor: "", texto: "Paseos y mesas" },
  { valor: "paseos", texto: "Sólo paseos" },
  { valor: "restaurant", texto: "Sólo mesas" },
];

const ESTADOS: { valor: string; texto: string }[] = [
  { valor: "", texto: "Todos" },
  { valor: "pendiente", texto: "Pendientes" },
  { valor: "confirmada", texto: "Confirmadas" },
  { valor: "cancelada", texto: "Canceladas" },
];

const esEstado = (valor?: string): valor is ReservaEstado =>
  valor === "pendiente" || valor === "confirmada" || valor === "cancelada";

/** El link de un filtro, conservando los otros dos. */
function link(actual: Params, cambio: Partial<Params>): string {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries({ ...actual, ...cambio })) {
    if (valor) params.set(clave, valor);
  }
  const query = params.toString();
  return query ? `/admin/reservas?${query}` : "/admin/reservas";
}

export default async function ReservasAdminPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  if (!hayClaveDeAdmin()) return <FaltaSecretKey />;

  const params = await searchParams;
  const cuando = CUANDO.some((c) => c.valor === params.cuando) ? params.cuando! : "proximas";
  const tipo = esReservaTipo(params.tipo) ? params.tipo : undefined;
  const estado = esEstado(params.estado) ? params.estado : undefined;
  const actual: Params = { cuando, tipo, estado };

  const hoy = hoyISO();
  let reservas: Reserva[];
  try {
    reservas = await listarReservas({
      tipo,
      estado,
      desde: cuando === "proximas" ? hoy : undefined,
      antesDe: cuando === "pasadas" ? hoy : undefined,
      // las que vienen, en orden; el historial, lo último primero
      orden: cuando === "proximas" ? "asc" : "desc",
    });
  } catch (error) {
    console.error("No se pudieron leer las reservas", error);
    return (
      <AdminAviso titulo="No pudimos leer las reservas" tono="alerta">
        <p>La base no contestó. Recargá la página; si sigue igual, revisá las claves de Supabase.</p>
      </AdminAviso>
    );
  }

  const personas = reservas
    .filter((r) => r.estado !== "cancelada")
    .reduce((total, r) => total + r.personas, 0);

  return (
    <>
      <header className="admin-head">
        <div className="eyebrow">Reservas</div>
        <h1>Paseos y mesas</h1>
        <p>
          Todo lo que entró por el sitio. Una reserva nace pendiente: confirmala cuando le avisaste
          a la persona que tiene el lugar.
        </p>
      </header>

      <div className="admin-filtros">
        {[
          { clave: "cuando" as const, opciones: CUANDO, activo: cuando },
          { clave: "tipo" as const, opciones: TIPOS, activo: tipo ?? "" },
          { clave: "estado" as const, opciones: ESTADOS, activo: estado ?? "" },
        ].map((grupo) => (
          <div key={grupo.clave} className="admin-filtro">
            {grupo.opciones.map((opcion) => (
              <Link
                key={opcion.valor}
                href={link(actual, { [grupo.clave]: opcion.valor })}
                className={`admin-chip${grupo.activo === opcion.valor ? " activo" : ""}`}
              >
                {opcion.texto}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {reservas.length === 0 ? (
        <AdminAviso titulo="No hay reservas con ese recorte">
          <p>Probá con otro filtro, o mirá todas.</p>
        </AdminAviso>
      ) : (
        <>
          <p className="admin-conteo">
            {reservas.length} {reservas.length === 1 ? "reserva" : "reservas"} · {personas}{" "}
            {personas === 1 ? "persona" : "personas"} sin contar las canceladas
          </p>

          <div className="admin-tabla-scroll">
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th>Cuándo</th>
                  <th>Qué</th>
                  <th>Quién</th>
                  <th>Contacto</th>
                  <th>Comentarios</th>
                  <th>Estado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {reservas.map((reserva) => (
                  <tr key={reserva.id} className={reserva.estado === "cancelada" ? "apagada" : ""}>
                    <td>
                      <strong>{fechaCorta(reserva.fecha)}</strong>
                      <span className="admin-sub">{reserva.hora} hs</span>
                    </td>
                    <td>
                      {nombreDeReserva(reserva)}
                      <span className="admin-sub">
                        {reserva.personas} {reserva.personas === 1 ? "persona" : "personas"}
                      </span>
                    </td>
                    <td>
                      {reserva.nombre}
                      <span className="admin-sub">{reserva.codigo}</span>
                    </td>
                    <td>
                      <a href={`tel:${reserva.telefono.replace(/\s/g, "")}`}>{reserva.telefono}</a>
                      {reserva.email ? (
                        <a className="admin-sub" href={`mailto:${reserva.email}`}>
                          {reserva.email}
                        </a>
                      ) : null}
                    </td>
                    <td className="admin-comentarios">{reserva.comentarios || "—"}</td>
                    <td>
                      <span className={`admin-estado ${reserva.estado}`}>{reserva.estado}</span>
                    </td>
                    <td>
                      <div className="admin-acciones">
                        {reserva.estado !== "confirmada" ? (
                          <form action={cambiarEstado}>
                            <input type="hidden" name="id" value={reserva.id} />
                            <input type="hidden" name="estado" value="confirmada" />
                            <button type="submit" className="admin-btn">
                              Confirmar
                            </button>
                          </form>
                        ) : null}
                        {reserva.estado !== "cancelada" ? (
                          <form action={cambiarEstado}>
                            <input type="hidden" name="id" value={reserva.id} />
                            <input type="hidden" name="estado" value="cancelada" />
                            <button type="submit" className="admin-btn suave">
                              Cancelar
                            </button>
                          </form>
                        ) : (
                          <form action={cambiarEstado}>
                            <input type="hidden" name="id" value={reserva.id} />
                            <input type="hidden" name="estado" value="pendiente" />
                            <button type="submit" className="admin-btn suave">
                              Reabrir
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
