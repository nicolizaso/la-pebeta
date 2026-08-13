import Link from "next/link";
import { AdminAviso, FaltaSecretKey } from "@/components/admin/AdminAviso";
import { listarReservas, type Reserva } from "@/lib/db";
import { fechaCorta } from "@/lib/fechas";
import { hoyISO, REGLAS } from "@/lib/reservas";
import { hayClaveDeAdmin } from "@/lib/supabase";

/**
 * El resumen: lo que hay que mirar antes de abrir, sin filtros ni tablas.
 *
 * Cuenta sobre las reservas de hoy en adelante, que son pocas: la granja no
 * toma más de un puñado por día, así que traerlas y contarlas acá es más
 * simple que pedirle tres counts a la base.
 */
export default async function ResumenPage() {
  if (!hayClaveDeAdmin()) return <FaltaSecretKey />;

  const hoy = hoyISO();
  let proximas: Reserva[];
  try {
    proximas = await listarReservas({ desde: hoy });
  } catch (error) {
    console.error("No se pudo leer el resumen", error);
    return (
      <AdminAviso titulo="No pudimos leer las reservas" tono="alerta">
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

  const fichas = [
    { valor: pendientes.length, etiqueta: "Pendientes de confirmar" },
    { valor: deHoy.length, etiqueta: "Reservas para hoy" },
    { valor: cubiertos("paseos"), etiqueta: "Personas anotadas a paseos" },
    { valor: cubiertos("restaurant"), etiqueta: "Cubiertos reservados" },
  ];

  return (
    <>
      <header className="admin-head">
        <div className="eyebrow">Resumen</div>
        <h1>Lo que viene</h1>
        <p>
          Todo lo que está tomado de hoy en adelante. El detalle, con teléfonos y comentarios, está
          en <Link href="/admin/reservas">Reservas</Link>.
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
    </>
  );
}
