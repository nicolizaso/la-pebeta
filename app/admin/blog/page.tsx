import Image from "next/image";
import Link from "next/link";
import { AdminAviso, FaltaSecretKey } from "@/components/admin/AdminAviso";
import { SeccionSwitch } from "@/components/admin/SeccionSwitch";
import { estadoDeNota, resumenDe, type EstadoNota } from "@/lib/blog";
import { listarNotasDelPanel, type Nota } from "@/lib/db";
import { fechaHora } from "@/lib/fechas";
import { fotoDeNota } from "@/lib/photos";
import { SECCIONES, seccionesActivas } from "@/lib/secciones";
import { hayClaveDeAdmin } from "@/lib/supabase";
import { normalizar } from "@/lib/tienda";
import { cambiarPublicacionNota } from "../acciones";

/**
 * El blog desde adentro: lo publicado, lo que está esperando su fecha y lo que
 * todavía es un borrador, todo en la misma tabla.
 *
 * Los filtros son links, igual que en reservas, compras y productos.
 */

type Params = { estado?: string; q?: string; guardada?: string };

const ESTADOS: { valor: string; texto: string }[] = [
  { valor: "", texto: "Todas" },
  { valor: "publicada", texto: "En el blog" },
  { valor: "programada", texto: "Programadas" },
  { valor: "borrador", texto: "Borradores" },
];

const COMO_SE_LLAMA: Record<EstadoNota, string> = {
  publicada: "en el blog",
  programada: "programada",
  borrador: "borrador",
};

/** El link de un filtro, conservando los otros. */
function link(actual: Params, cambio: Partial<Params>): string {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries({ ...actual, ...cambio, guardada: "" })) {
    if (valor) params.set(clave, valor);
  }
  const query = params.toString();
  return query ? `/admin/blog?${query}` : "/admin/blog";
}

function recortar(notas: Nota[], { q }: Params): Nota[] {
  const buscado = normalizar(q ?? "");
  if (!buscado) return notas;

  return notas.filter((nota) => {
    const donde = normalizar(
      `${nota.titulo} ${nota.bajada} ${nota.autor} ${nota.etiquetas.join(" ")} ${nota.cuerpo}`
    );
    return buscado.split(/\s+/).every((palabra) => donde.includes(palabra));
  });
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<Params> }) {
  if (!hayClaveDeAdmin()) return <FaltaSecretKey />;

  const params = await searchParams;
  const estado = ESTADOS.some((e) => e.valor === params.estado) ? params.estado! : "";
  const q = (params.q ?? "").slice(0, 80);

  const activas = await seccionesActivas();

  let notas: Nota[];
  try {
    notas = await listarNotasDelPanel();
  } catch (error) {
    console.error("No se pudo leer el blog", error);
    return (
      <AdminAviso titulo="No pudimos leer el blog" tono="alerta">
        <p>La base no contestó. Recargá la página; si sigue igual, revisá las claves de Supabase.</p>
      </AdminAviso>
    );
  }

  // el estado se calcula una vez, con el mismo reloj para toda la tabla
  const ahora = Date.now();
  const conEstado = recortar(notas, { q }).map((nota) => ({
    nota,
    estado: estadoDeNota(nota, ahora),
  }));

  const actual: Params = { estado, q };
  const visibles = estado ? conEstado.filter((fila) => fila.estado === estado) : conEstado;
  const cuenta = (cual: EstadoNota) => conEstado.filter((fila) => fila.estado === cual).length;

  const guardada = notas.find((nota) => nota.id === params.guardada);
  const estadoGuardada = guardada ? estadoDeNota(guardada, ahora) : null;

  return (
    <>
      <header className="admin-head">
        <div className="admin-head-fila">
          <div>
            <div className="eyebrow">Blog</div>
            <h1>Las notas de la casa</h1>
          </div>
          <Link href="/admin/blog/nueva" className="admin-btn">
            Escribir una nota
          </Link>
        </div>
        <p>
          Lo que se lee en <Link href="/blog">el blog</Link>. Una nota se guarda de borrador, se
          publica cuando está lista, o se deja lista con fecha de más adelante: ese día sale sola,
          sin que nadie tenga que volver acá.
        </p>
      </header>

      <SeccionSwitch
        seccion="blog"
        interruptor={SECCIONES.blog.interruptor}
        activa={activas.blog}
        confirmacion={SECCIONES.blog.confirmacion}
        advertencia={SECCIONES.blog.advertencia}
        detalle="Con el blog activado, Blog vuelve al menú del sitio y las notas publicadas quedan a la vista. Apagado, las notas se siguen escribiendo acá pero /blog muestra “Próximamente”."
      />

      {guardada && estadoGuardada ? (
        <AdminAviso titulo={`Guardada: ${guardada.titulo}`}>
          <p>
            {estadoGuardada === "publicada" ? (
              <>
                Ya está en el blog, en <Link href={`/blog/${guardada.slug}`}>/blog/{guardada.slug}</Link>.
              </>
            ) : estadoGuardada === "programada" ? (
              `Queda programada para el ${fechaHora(guardada.fecha)} hs: ese día sale sola.`
            ) : (
              "Quedó de borrador: tildá “publicar la nota” cuando esté para salir."
            )}
          </p>
        </AdminAviso>
      ) : null}

      <div className="admin-filtros">
        <div className="admin-filtro">
          {ESTADOS.map((opcion) => (
            <Link
              key={opcion.valor}
              href={link(actual, { estado: opcion.valor })}
              className={`admin-chip${estado === opcion.valor ? " activo" : ""}`}
            >
              {opcion.texto} ·{" "}
              {opcion.valor ? cuenta(opcion.valor as EstadoNota) : conEstado.length}
            </Link>
          ))}
        </div>

        <form className="admin-buscador" action="/admin/blog">
          {estado ? <input type="hidden" name="estado" value={estado} /> : null}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar en las notas"
            aria-label="Buscar en las notas"
          />
          <button type="submit" className="admin-btn suave">
            Buscar
          </button>
        </form>
      </div>

      {visibles.length === 0 ? (
        <AdminAviso titulo={notas.length === 0 ? "Todavía no hay ninguna nota" : "No hay notas con ese recorte"}>
          <p>
            {notas.length === 0 ? (
              <>
                El blog está vacío. <Link href="/admin/blog/nueva">Escribí la primera</Link>: puede
                quedar de borrador hasta que esté.
              </>
            ) : (
              <>
                Probá con otro filtro, mirá <Link href="/admin/blog">todas las notas</Link> o{" "}
                <Link href="/admin/blog/nueva">escribí una nueva</Link>.
              </>
            )}
          </p>
        </AdminAviso>
      ) : (
        <>
          <p className="admin-conteo">
            {visibles.length} {visibles.length === 1 ? "nota" : "notas"} · {cuenta("publicada")} en
            el blog · {cuenta("programada")} esperando su fecha
          </p>

          <div className="admin-tabla-scroll">
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th>Nota</th>
                  <th>Sale</th>
                  <th>Firma</th>
                  <th>Estado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {visibles.map(({ nota, estado: suEstado }) => {
                  const imagen = fotoDeNota(nota.foto);
                  return (
                    <tr key={nota.id} className={suEstado === "borrador" ? "apagada" : ""}>
                      <td>
                        <div className="admin-producto">
                          <span className="admin-producto-foto">
                            {imagen ? (
                              <Image
                                src={imagen.src}
                                alt=""
                                fill
                                sizes="56px"
                                placeholder={imagen.blurDataURL ? "blur" : "empty"}
                                blurDataURL={imagen.blurDataURL}
                              />
                            ) : (
                              <em>{nota.titulo.charAt(0)}</em>
                            )}
                          </span>
                          <span>
                            <Link href={`/admin/blog/${nota.id}`}>{nota.titulo}</Link>
                            <span className="admin-sub admin-blog-sub">
                              {resumenDe(nota) || "Sin bajada"}
                            </span>
                            {nota.etiquetas.length > 0 ? (
                              <span className="admin-etiquetas">
                                {nota.etiquetas.map((etiqueta) => (
                                  <em key={etiqueta}>{etiqueta}</em>
                                ))}
                              </span>
                            ) : null}
                          </span>
                        </div>
                      </td>
                      <td>
                        {fechaHora(nota.fecha)} hs
                        <span className="admin-sub">/blog/{nota.slug}</span>
                      </td>
                      <td>{nota.autor || "—"}</td>
                      <td>
                        <span className={`admin-estado nota-${suEstado}`}>
                          {COMO_SE_LLAMA[suEstado]}
                        </span>
                      </td>
                      <td>
                        <div className="admin-acciones">
                          <Link href={`/admin/blog/${nota.id}`} className="admin-btn">
                            Editar
                          </Link>
                          {suEstado === "publicada" ? (
                            <Link href={`/blog/${nota.slug}`} className="admin-btn suave">
                              Ver
                            </Link>
                          ) : null}
                          <form action={cambiarPublicacionNota}>
                            <input type="hidden" name="id" value={nota.id} />
                            <input type="hidden" name="slug" value={nota.slug} />
                            <input
                              type="hidden"
                              name="publicada"
                              value={nota.publicada ? "no" : "si"}
                            />
                            <button type="submit" className="admin-btn suave">
                              {nota.publicada ? "Sacar" : "Publicar"}
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
