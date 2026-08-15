import Link from "next/link";
import { AdminAviso, FaltaSecretKey } from "@/components/admin/AdminAviso";
import { listarCompras, type Compra, type CompraEstado } from "@/lib/db";
import { fechaHora } from "@/lib/fechas";
import { precio } from "@/lib/tienda";
import { hayClaveDeAdmin } from "@/lib/supabase";
import { cambiarEstadoDeCompra } from "../acciones";

/**
 * Los pedidos que entraron por la tienda, lo último primero: es el orden en el
 * que hay que prepararlos. Los filtros son links, igual que en reservas, así
 * cada recorte tiene su URL.
 *
 * Una compra entra `pagada` —la pasarela es ficticia y aprueba en el momento—,
 * se marca `entregada` cuando la persona la retiró, y `cancelada` si no pasó a
 * buscarla o si algo del pedido no estaba.
 */

type Params = { estado?: string; cuando?: string };

const CUANDO = [
  { valor: "semana", texto: "Última semana" },
  { valor: "mes", texto: "Último mes" },
  { valor: "todas", texto: "Todas" },
];

const ESTADOS: { valor: string; texto: string }[] = [
  { valor: "", texto: "Todos" },
  { valor: "pagada", texto: "Por entregar" },
  { valor: "entregada", texto: "Entregadas" },
  { valor: "cancelada", texto: "Canceladas" },
];

const esEstado = (valor?: string): valor is CompraEstado =>
  valor === "pendiente" || valor === "pagada" || valor === "entregada" || valor === "cancelada";

/** El link de un filtro, conservando el otro. */
function link(actual: Params, cambio: Partial<Params>): string {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries({ ...actual, ...cambio })) {
    if (valor) params.set(clave, valor);
  }
  const query = params.toString();
  return query ? `/admin/compras?${query}` : "/admin/compras";
}

/** El corte de fecha en ISO, que es como se guarda `creada`. */
function desdeDe(cuando: string): string | undefined {
  const dias = cuando === "semana" ? 7 : cuando === "mes" ? 30 : 0;
  if (dias === 0) return undefined;
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();
}

export default async function ComprasAdminPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  if (!hayClaveDeAdmin()) return <FaltaSecretKey />;

  const params = await searchParams;
  const cuando = CUANDO.some((c) => c.valor === params.cuando) ? params.cuando! : "mes";
  const estado = esEstado(params.estado) ? params.estado : undefined;
  const actual: Params = { cuando, estado };

  let compras: Compra[];
  try {
    compras = await listarCompras({ estado, desde: desdeDe(cuando) });
  } catch (error) {
    console.error("No se pudieron leer las compras", error);
    return (
      <AdminAviso titulo="No pudimos leer las compras" tono="alerta">
        <p>La base no contestó. Recargá la página; si sigue igual, revisá las claves de Supabase.</p>
      </AdminAviso>
    );
  }

  const vivas = compras.filter((compra) => compra.estado !== "cancelada");
  const facturado = vivas.reduce((total, compra) => total + compra.total, 0);
  const porEntregar = compras.filter((compra) => compra.estado === "pagada").length;

  return (
    <>
      <header className="admin-head">
        <div className="eyebrow">Compras</div>
        <h1>Pedidos de la tienda</h1>
        <p>
          Lo que se compró en <Link href="/tienda">la tienda</Link>. Entra pagado: marcalo entregado
          cuando la persona pasó a retirarlo por la proveeduría.
        </p>
      </header>

      <div className="admin-filtros">
        {[
          { clave: "cuando" as const, opciones: CUANDO, activo: cuando },
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

      {compras.length === 0 ? (
        <AdminAviso titulo="No hay compras con ese recorte">
          <p>Probá con otro filtro, o mirá todas.</p>
        </AdminAviso>
      ) : (
        <>
          <p className="admin-conteo">
            {compras.length} {compras.length === 1 ? "compra" : "compras"} · {precio(facturado)} sin
            contar las canceladas · {porEntregar} por entregar
          </p>

          <div className="admin-tabla-scroll">
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th>Cuándo</th>
                  <th>Pedido</th>
                  <th>Qué</th>
                  <th>Quién</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {compras.map((compra) => (
                  <tr key={compra.id} className={compra.estado === "cancelada" ? "apagada" : ""}>
                    <td>
                      <strong>{fechaHora(compra.creada)} hs</strong>
                    </td>
                    <td>
                      <span className="admin-codigo">{compra.codigo}</span>
                      <span className="admin-sub">
                        {compra.items.length} {compra.items.length === 1 ? "renglón" : "renglones"}
                      </span>
                    </td>
                    <td>
                      <ul className="admin-items">
                        {compra.items.map((item) => (
                          <li key={item.productoId}>
                            <span>
                              {item.cantidad} × {item.nombre}
                            </span>
                            <em>{precio(item.precio * item.cantidad)}</em>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      {compra.cliente.nombre}
                      <a
                        className="admin-sub"
                        href={`tel:${compra.cliente.telefono.replace(/\s/g, "")}`}
                      >
                        {compra.cliente.telefono}
                      </a>
                      {compra.cliente.email ? (
                        <a className="admin-sub" href={`mailto:${compra.cliente.email}`}>
                          {compra.cliente.email}
                        </a>
                      ) : null}
                    </td>
                    <td>
                      <strong>{precio(compra.total)}</strong>
                    </td>
                    <td>
                      <span className={`admin-estado ${compra.estado}`}>{compra.estado}</span>
                    </td>
                    <td>
                      <div className="admin-acciones">
                        {compra.estado !== "entregada" && compra.estado !== "cancelada" ? (
                          <form action={cambiarEstadoDeCompra}>
                            <input type="hidden" name="id" value={compra.id} />
                            <input type="hidden" name="estado" value="entregada" />
                            <button type="submit" className="admin-btn">
                              Entregada
                            </button>
                          </form>
                        ) : null}
                        {compra.estado !== "cancelada" ? (
                          <form action={cambiarEstadoDeCompra}>
                            <input type="hidden" name="id" value={compra.id} />
                            <input type="hidden" name="estado" value="cancelada" />
                            <button type="submit" className="admin-btn suave">
                              Cancelar
                            </button>
                          </form>
                        ) : (
                          <form action={cambiarEstadoDeCompra}>
                            <input type="hidden" name="id" value={compra.id} />
                            <input type="hidden" name="estado" value="pagada" />
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
