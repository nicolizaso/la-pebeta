import Link from "next/link";
import { AdminAviso, FaltaSecretKey } from "@/components/admin/AdminAviso";
import { ESTADOS, asuntoDe, esEstadoConsulta, textoDeEstado } from "@/lib/consultas";
import { listarConsultas, type Consulta } from "@/lib/db";
import { fechaHora } from "@/lib/fechas";
import { hayClaveDeAdmin } from "@/lib/supabase";
import { cambiarEstadoDeConsulta, eliminarConsulta } from "../acciones";

/**
 * Las consultas del chat, para leerlas como lo que son: conversaciones.
 *
 * No es una tabla. Lo que importa de una consulta es qué preguntaron y qué se
 * contestó, y eso no entra en una celda, así que cada una se abre entera con un
 * `<details>` y adentro está el hilo completo.
 *
 * El filtro que se usa todos los días es "Para contestar": ahí caen las que el
 * asistente derivó porque no supo, que son las que esperan a una persona.
 */

type Params = { estado?: string };

const FILTROS = [{ valor: "", texto: "Todas" }, ...ESTADOS];

/** Los datos que la persona dejó escritos en la charla, si dejó alguno. */
function contactoDe(consulta: Consulta): string {
  const { nombre, telefono, email } = consulta.contacto;
  return [nombre, telefono, email].filter(Boolean).join(" · ");
}

export default async function ConsultasAdminPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  if (!hayClaveDeAdmin()) return <FaltaSecretKey />;

  const { estado: crudo } = await searchParams;
  const estado = esEstadoConsulta(crudo) ? crudo : undefined;

  let consultas: Consulta[];
  try {
    consultas = await listarConsultas({ estado });
  } catch (error) {
    console.error("No se pudieron leer las consultas", error);
    return (
      <AdminAviso titulo="No pudimos leer las consultas" tono="alerta">
        <p>
          La base no contestó. Recargá la página; si sigue igual, revisá las claves de Supabase y
          que haya corrido la migración de <code>consultas</code>.
        </p>
      </AdminAviso>
    );
  }

  const pendientes = consultas.filter((consulta) => consulta.estado === "derivada").length;

  return (
    <>
      <header className="admin-head">
        <div className="eyebrow">Consultas</div>
        <h1>El chat del sitio</h1>
        <p>
          Lo que preguntan por la burbuja del sitio y lo que el asistente contestó. Las que dicen
          “Para contestar” son las que no supo: esas las contesta alguien de la casa.
        </p>
      </header>

      <div className="admin-filtros">
        <div className="admin-filtro">
          {FILTROS.map((filtro) => (
            <Link
              key={filtro.valor}
              href={filtro.valor ? `/admin/consultas?estado=${filtro.valor}` : "/admin/consultas"}
              className={`admin-chip${(estado ?? "") === filtro.valor ? " activo" : ""}`}
            >
              {filtro.texto}
            </Link>
          ))}
        </div>
      </div>

      {consultas.length === 0 ? (
        <AdminAviso titulo="No hay consultas con ese recorte">
          <p>Probá con otro filtro, o mirá todas.</p>
        </AdminAviso>
      ) : (
        <>
          <p className="admin-conteo">
            {consultas.length} {consultas.length === 1 ? "conversación" : "conversaciones"}
            {pendientes > 0 ? ` · ${pendientes} esperando respuesta` : ""}
          </p>

          <div className="admin-consultas">
            {consultas.map((consulta) => (
              <details key={consulta.id} className="admin-consulta" open={consulta.estado === "derivada"}>
                <summary>
                  <span className="admin-consulta-asunto">{asuntoDe(consulta.hilo)}</span>
                  <span className={`admin-estado ${consulta.estado}`}>
                    {textoDeEstado(consulta.estado)}
                  </span>
                  <span className="admin-sub">
                    {fechaHora(consulta.creada)} · {consulta.codigo}
                    {consulta.pagina ? ` · desde ${consulta.pagina}` : ""}
                  </span>
                </summary>

                {contactoDe(consulta) ? (
                  <p className="admin-consulta-contacto">{contactoDe(consulta)}</p>
                ) : null}

                <div className="admin-consulta-hilo">
                  {consulta.hilo.map((mensaje, indice) => (
                    <p key={indice} className={`admin-consulta-msg ${mensaje.rol}`}>
                      {mensaje.texto}
                    </p>
                  ))}
                </div>

                {consulta.reserva ? (
                  <p className="admin-consulta-reserva">
                    De esta conversación salió una reserva.{" "}
                    <Link href="/admin/reservas">Verla en reservas</Link>.
                  </p>
                ) : null}

                <div className="admin-acciones">
                  {consulta.estado === "resuelta" ? (
                    <form action={cambiarEstadoDeConsulta}>
                      <input type="hidden" name="id" value={consulta.id} />
                      <input type="hidden" name="estado" value="derivada" />
                      <button type="submit" className="admin-btn suave">
                        Volver a abrir
                      </button>
                    </form>
                  ) : (
                    <form action={cambiarEstadoDeConsulta}>
                      <input type="hidden" name="id" value={consulta.id} />
                      <input type="hidden" name="estado" value="resuelta" />
                      <button type="submit" className="admin-btn">
                        Marcar resuelta
                      </button>
                    </form>
                  )}

                  <form action={eliminarConsulta}>
                    <input type="hidden" name="id" value={consulta.id} />
                    <button type="submit" className="admin-btn suave">
                      Borrar
                    </button>
                  </form>
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </>
  );
}
