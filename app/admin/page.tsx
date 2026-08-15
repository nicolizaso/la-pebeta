import Link from "next/link";
import { AdminAviso, FaltaSecretKey } from "@/components/admin/AdminAviso";
import { listarCompras, listarReservas, type Compra, type Reserva } from "@/lib/db";
import { fechaCorta, fechaHora } from "@/lib/fechas";
import { hoyISO, REGLAS } from "@/lib/reservas";
import { precio } from "@/lib/tienda";
import { hayClaveDeAdmin } from "@/lib/supabase";

/** Lo que se mira de la tienda en el resumen: el último mes. */
const DIAS_DE_TIENDA = 30;

/**
 * El resumen: lo que hay que mirar antes de abrir, sin filtros ni tablas.
 *
 * Cuenta sobre las reservas de hoy en adelante y las compras del último mes,
 * que son pocas: la granja no toma más de un puñado por día, así que traerlas y
 * contarlas acá es más simple que pedirle un count por ficha a la base.
 */
export default async function ResumenPage() {
  if (!hayClaveDeAdmin()) return <FaltaSecretKey />;

  const hoy = hoyISO();
  let proximas: Reserva[];
  let compras: Compra[];
  try {
    [proximas, compras] = await Promise.all([
      listarReservas({ desde: hoy }),
      listarCompras({ desde: new Date(Date.now() - DIAS_DE_TIENDA * 86400000).toISOString() }),
    ]);
  } catch (error) {
    console.error("No se pudo leer el resumen", error);
    return (
      <AdminAviso titulo="No pudimos leer el resumen" tono="alerta">
        <p>La base no contestó. Recargá la página; si sigue igual, revisá las claves de Supabase.</p>
      </AdminAviso>
    );
  }

  const pendientes = proximas.filter((r) => r.estado === "pendiente");
  const deHoy = proximas.filter((r) => r.fecha === hoy && r.estado !== "cancelada");
  const cubiertos = (tipo: Reserva["tipo"]) =>
    proximas
      .filter((r) => r.tipo === tipo && r.estado !== "cancelada")
      .reduce((total, r) => total + r.personas, 0);

  const porEntregar = compras.filter((compra) => compra.estado === "pagada");
  const vendido = compras
    .filter((compra) => compra.estado !== "cancelada")
    .reduce((total, compra) => total + compra.total, 0);

  const fichas = [
    { valor: pendientes.length, etiqueta: "Pendientes de confirmar" },
    { valor: deHoy.length, etiqueta: "Reservas para hoy" },
    { valor: cubiertos("paseos"), etiqueta: "Personas anotadas a paseos" },
    { valor: cubiertos("restaurant"), etiqueta: "Cubiertos reservados" },
    { valor: porEntregar.length, etiqueta: "Compras por entregar" },
    { valor: precio(vendido), etiqueta: `Vendido en ${DIAS_DE_TIENDA} días` },
  ];

  return (
    <>
      <header className="admin-head">
        <div className="eyebrow">Resumen</div>
        <h1>Lo que viene</h1>
        <p>
          Lo que está tomado de hoy en adelante y lo que se vendió en la tienda este último mes. El
          detalle, con teléfonos y comentarios, está en <Link href="/admin/reservas">Reservas</Link>{" "}
          y en <Link href="/admin/compras">Compras</Link>.
        </p>
      </header>

      <div className="admin-fichas">
        {fichas.map((ficha) => (
          <div key={ficha.etiqueta} className="admin-ficha">
            <strong>{ficha.valor}</strong>
            <span>{ficha.etiqueta}</span>
          </div>
        ))}
      </div>

      <section className="admin-bloque">
        <div className="admin-bloque-head">
          <h2>Próximas reservas</h2>
          <Link href="/admin/reservas?estado=pendiente">Ver las pendientes</Link>
        </div>

        {proximas.length === 0 ? (
          <AdminAviso titulo="No hay nada tomado todavía">
            <p>Cuando entre una reserva por el sitio, aparece acá.</p>
          </AdminAviso>
        ) : (
          <ul className="admin-proximas">
            {proximas.slice(0, 8).map((reserva) => (
              <li key={reserva.id}>
                <span className="admin-proximas-fecha">
                  {fechaCorta(reserva.fecha)} · {reserva.hora} hs
                </span>
                <span className="admin-proximas-quien">
                  {reserva.nombre}
                  <em>
                    {REGLAS[reserva.tipo].etiqueta} · {reserva.personas}{" "}
                    {reserva.personas === 1 ? "persona" : "personas"}
                  </em>
                </span>
                <span className={`admin-estado ${reserva.estado}`}>{reserva.estado}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-bloque">
        <div className="admin-bloque-head">
          <h2>Compras por entregar</h2>
          <Link href="/admin/compras?estado=pagada">Ver la tienda</Link>
        </div>

        {porEntregar.length === 0 ? (
          <AdminAviso titulo="No hay pedidos esperando">
            <p>Cuando alguien compre por la tienda, el pedido aparece acá hasta que lo retire.</p>
          </AdminAviso>
        ) : (
          <ul className="admin-proximas">
            {porEntregar.slice(0, 8).map((compra) => (
              <li key={compra.id}>
                <span className="admin-proximas-fecha">{fechaHora(compra.creada)} hs</span>
                <span className="admin-proximas-quien">
                  {compra.cliente.nombre}
                  <em>
                    {compra.codigo} · {compra.items.length}{" "}
                    {compra.items.length === 1 ? "renglón" : "renglones"} · {precio(compra.total)}
                  </em>
                </span>
                <span className={`admin-estado ${compra.estado}`}>{compra.estado}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
