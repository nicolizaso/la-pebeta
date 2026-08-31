import { AdminAviso, FaltaSecretKey } from "@/components/admin/AdminAviso";
import { listarUsuarios, type Usuario } from "@/lib/db";
import { fechaHora } from "@/lib/fechas";
import { hayClaveDeAdmin } from "@/lib/supabase";
import { olvidarContrasenaDeCuenta } from "../acciones";

/**
 * Las cuentas del sitio.
 *
 * Nadie se registra: cada una nació con una reserva o con una compra, así que
 * esto es más una guía telefónica que un ABM. Lo único que se hace desde acá es
 * sacarle la contraseña a quien se la olvidó —el sitio no manda mails, así que
 * esa persona llama y la casa la desbloquea— y ahí su cuenta vuelve a entrar
 * con sólo el mail.
 */

type Params = { q?: string };

/** El buscador filtra acá y no en la base: son pocas cuentas y entran todas. */
function buscar(usuarios: Usuario[], texto: string): Usuario[] {
  const buscado = texto.trim().toLowerCase();
  if (!buscado) return usuarios;

  return usuarios.filter((usuario) =>
    `${usuario.email} ${usuario.nombre} ${usuario.telefono}`.toLowerCase().includes(buscado)
  );
}

export default async function UsuariosAdminPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  if (!hayClaveDeAdmin()) return <FaltaSecretKey />;

  const q = (await searchParams).q ?? "";

  let usuarios: Usuario[];
  try {
    usuarios = await listarUsuarios();
  } catch (error) {
    console.error("No se pudieron leer las cuentas", error);
    return (
      <AdminAviso titulo="No pudimos leer las cuentas" tono="alerta">
        <p>La base no contestó. Recargá la página; si sigue igual, revisá las claves de Supabase.</p>
      </AdminAviso>
    );
  }

  const recorte = buscar(usuarios, q);
  const conClave = usuarios.filter((usuario) => usuario.password_hash !== "").length;

  return (
    <>
      <header className="admin-head">
        <div className="eyebrow">Cuentas</div>
        <h1>Quiénes reservan</h1>
        <p>
          Cada cuenta se abrió sola con una reserva o una compra. Desde su perfil, esa persona ve lo
          que pidió y puede ponerse una contraseña; si se la olvida, se la sacás desde acá y vuelve
          a entrar con el mail.
        </p>
      </header>

      <form className="admin-buscador" action="/admin/usuarios">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por mail, nombre o teléfono"
          aria-label="Buscar una cuenta"
        />
      </form>

      {recorte.length === 0 ? (
        <AdminAviso titulo={q ? "Ninguna cuenta coincide" : "Todavía no hay cuentas"}>
          <p>
            {q
              ? "Probá con otra parte del mail o del nombre."
              : "La primera va a aparecer sola cuando alguien reserve desde el sitio."}
          </p>
        </AdminAviso>
      ) : (
        <>
          <p className="admin-conteo">
            {recorte.length} {recorte.length === 1 ? "cuenta" : "cuentas"}
            {q ? ` de ${usuarios.length}` : ""} · {conClave} con contraseña
          </p>

          <div className="admin-tabla-scroll">
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th>Quién</th>
                  <th>Contacto</th>
                  <th>Desde</th>
                  <th>Última visita</th>
                  <th>Contraseña</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {recorte.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.nombre || "—"}</td>
                    <td>
                      <a href={`mailto:${usuario.email}`}>{usuario.email}</a>
                      {usuario.telefono ? (
                        <a
                          className="admin-sub"
                          href={`tel:${usuario.telefono.replace(/\s/g, "")}`}
                        >
                          {usuario.telefono}
                        </a>
                      ) : null}
                    </td>
                    <td>{fechaHora(usuario.creado)}</td>
                    <td>{fechaHora(usuario.ultimo_acceso)}</td>
                    <td>
                      {usuario.password_puesta ? (
                        <>
                          <span className="admin-estado confirmada">puesta</span>
                          <span className="admin-sub">{fechaHora(usuario.password_puesta)}</span>
                        </>
                      ) : (
                        <span className="admin-estado pendiente">entra con el mail</span>
                      )}
                    </td>
                    <td>
                      {usuario.password_puesta ? (
                        <div className="admin-acciones">
                          <form action={olvidarContrasenaDeCuenta}>
                            <input type="hidden" name="id" value={usuario.id} />
                            <button type="submit" className="admin-btn suave">
                              Borrar contraseña
                            </button>
                          </form>
                        </div>
                      ) : null}
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
