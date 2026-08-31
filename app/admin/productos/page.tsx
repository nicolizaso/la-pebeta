import Image from "next/image";
import Link from "next/link";
import { AdminAviso, FaltaSecretKey } from "@/components/admin/AdminAviso";
import { SeccionSwitch } from "@/components/admin/SeccionSwitch";
import {
  listarCategoriasDelPanel,
  listarProductosDelPanel,
  type Categoria,
  type Producto,
} from "@/lib/db";
import { buscarFoto } from "@/lib/photos";
import { contarPorCategoria } from "@/lib/productos";
import { SECCIONES, seccionesActivas } from "@/lib/secciones";
import { hayClaveDeAdmin } from "@/lib/supabase";
import { normalizar, precio } from "@/lib/tienda";
import { cambiarPublicacion } from "../acciones";

/**
 * El catálogo de la proveeduría desde adentro: todo lo cargado, publicado o no.
 *
 * Los filtros son links, igual que en reservas y compras, y el de categorías se
 * arma con lo que haya en la base: una categoría nueva aparece acá sola, sin
 * tocar este archivo.
 */

type Params = { categoria?: string; estado?: string; q?: string; guardado?: string };

const ESTADOS = [
  { valor: "", texto: "Todos" },
  { valor: "publicados", texto: "Publicados" },
  { valor: "escondidos", texto: "Sin publicar" },
  { valor: "agotados", texto: "Sin stock" },
];

/** El link de un filtro, conservando los otros. */
function link(actual: Params, cambio: Partial<Params>): string {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries({ ...actual, ...cambio, guardado: "" })) {
    if (valor) params.set(clave, valor);
  }
  const query = params.toString();
  return query ? `/admin/productos?${query}` : "/admin/productos";
}

function recortar(productos: Producto[], { estado, q }: Params): Producto[] {
  const buscado = normalizar(q ?? "");

  return productos.filter((producto) => {
    if (estado === "publicados" && !producto.activo) return false;
    if (estado === "escondidos" && producto.activo) return false;
    if (estado === "agotados" && producto.stock > 0) return false;
    if (!buscado) return true;

    const donde = normalizar(`${producto.nombre} ${producto.descripcion} ${producto.unidad}`);
    return buscado.split(/\s+/).every((palabra) => donde.includes(palabra));
  });
}

export default async function ProductosPage({ searchParams }: { searchParams: Promise<Params> }) {
  if (!hayClaveDeAdmin()) return <FaltaSecretKey />;

  const params = await searchParams;
  const estado = ESTADOS.some((e) => e.valor === params.estado) ? params.estado! : "";
  const q = (params.q ?? "").slice(0, 80);

  const activas = await seccionesActivas();

  let productos: Producto[];
  let categorias: Categoria[];
  try {
    [productos, categorias] = await Promise.all([
      listarProductosDelPanel(),
      listarCategoriasDelPanel(),
    ]);
  } catch (error) {
    console.error("No se pudo leer el catálogo", error);
    return (
      <AdminAviso titulo="No pudimos leer el catálogo" tono="alerta">
        <p>La base no contestó. Recargá la página; si sigue igual, revisá las claves de Supabase.</p>
      </AdminAviso>
    );
  }

  const categoria = categorias.some((c) => c.id === params.categoria) ? params.categoria! : "";
  const actual: Params = { categoria, estado, q };

  const recorte = recortar(productos, actual);
  const visibles = categoria ? recorte.filter((p) => p.categoria === categoria) : recorte;
  const conteos = contarPorCategoria(recorte);
  const nombreDe = (id: string) => categorias.find((c) => c.id === id)?.nombre ?? id;

  const publicados = visibles.filter((p) => p.activo).length;
  const guardado = productos.find((p) => p.id === params.guardado);

  return (
    <>
      <header className="admin-head">
        <div className="admin-head-fila">
          <div>
            <div className="eyebrow">Productos</div>
            <h1>El catálogo</h1>
          </div>
          <Link href="/admin/productos/nuevo" className="admin-btn">
            Nuevo producto
          </Link>
        </div>
        <p>
          Lo que se vende en <Link href="/tienda">la tienda</Link>. Un producto sin publicar queda
          cargado pero no se ve. Los cajones donde va cada uno se arman en{" "}
          <Link href="/admin/productos/categorias">Categorías</Link>.
        </p>
      </header>

      <SeccionSwitch
        seccion="tienda"
        interruptor={SECCIONES.tienda.interruptor}
        activa={activas.tienda}
        confirmacion={SECCIONES.tienda.confirmacion}
        advertencia={SECCIONES.tienda.advertencia}
        detalle="Con la tienda activada, Tienda vuelve al menú del sitio y se puede comprar. Apagada, el catálogo se sigue cargando acá pero /tienda muestra “Próximamente”."
      />

      {guardado ? (
        <AdminAviso titulo={`Guardado: ${guardado.nombre}`}>
          <p>
            {guardado.activo
              ? `Ya está en la tienda, en ${nombreDe(guardado.categoria)}.`
              : `Quedó sin publicar en ${nombreDe(guardado.categoria)}: tildá "publicado" cuando esté para salir.`}
          </p>
        </AdminAviso>
      ) : null}

      <div className="admin-filtros">
        <div className="admin-filtro">
          <Link
            href={link(actual, { categoria: "" })}
            className={`admin-chip${categoria === "" ? " activo" : ""}`}
          >
            Todas · {recorte.length}
          </Link>
          {categorias.map((opcion) => (
            <Link
              key={opcion.id}
              href={link(actual, { categoria: opcion.id })}
              className={`admin-chip${categoria === opcion.id ? " activo" : ""}`}
            >
              {opcion.nombre} · {conteos[opcion.id] ?? 0}
            </Link>
          ))}
        </div>

        <div className="admin-filtro">
          {ESTADOS.map((opcion) => (
            <Link
              key={opcion.valor}
              href={link(actual, { estado: opcion.valor })}
              className={`admin-chip${estado === opcion.valor ? " activo" : ""}`}
            >
              {opcion.texto}
            </Link>
          ))}
        </div>

        <form className="admin-buscador" action="/admin/productos">
          {categoria ? <input type="hidden" name="categoria" value={categoria} /> : null}
          {estado ? <input type="hidden" name="estado" value={estado} /> : null}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar en el catálogo"
            aria-label="Buscar en el catálogo"
          />
          <button type="submit" className="admin-btn suave">
            Buscar
          </button>
        </form>
      </div>

      {visibles.length === 0 ? (
        <AdminAviso titulo="No hay productos con ese recorte">
          <p>
            Probá con otro filtro, mirá <Link href="/admin/productos">todo el catálogo</Link> o{" "}
            <Link href="/admin/productos/nuevo">cargá uno nuevo</Link>.
          </p>
        </AdminAviso>
      ) : (
        <>
          <p className="admin-conteo">
            {visibles.length} {visibles.length === 1 ? "producto" : "productos"} · {publicados} en la
            tienda
          </p>

          <div className="admin-tabla-scroll">
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {visibles.map((producto) => {
                  const imagen = buscarFoto(producto.foto);
                  return (
                    <tr key={producto.id} className={producto.activo ? "" : "apagada"}>
                      <td>
                        <div className="admin-producto">
                          <span className="admin-producto-foto">
                            {imagen ? (
                              <Image
                                src={imagen.src}
                                alt=""
                                fill
                                sizes="56px"
                                placeholder="blur"
                                blurDataURL={imagen.blurDataURL}
                              />
                            ) : (
                              <em>{producto.nombre.charAt(0)}</em>
                            )}
                          </span>
                          <span>
                            <Link href={`/admin/productos/${producto.id}`}>{producto.nombre}</Link>
                            <span className="admin-sub">{producto.descripcion || "Sin bajada"}</span>
                          </span>
                        </div>
                      </td>
                      <td>{nombreDe(producto.categoria)}</td>
                      <td>
                        <strong>{precio(producto.precio)}</strong>
                        <span className="admin-sub">por {producto.unidad}</span>
                      </td>
                      <td>{producto.stock}</td>
                      <td>
                        <span className={`admin-estado ${producto.activo ? "publicado" : "escondido"}`}>
                          {producto.activo ? "publicado" : "sin publicar"}
                        </span>
                        {producto.activo && producto.stock === 0 ? (
                          <span className="admin-sub">agotado</span>
                        ) : null}
                      </td>
                      <td>
                        <div className="admin-acciones">
                          <Link href={`/admin/productos/${producto.id}`} className="admin-btn">
                            Editar
                          </Link>
                          <form action={cambiarPublicacion}>
                            <input type="hidden" name="id" value={producto.id} />
                            <input
                              type="hidden"
                              name="activo"
                              value={producto.activo ? "no" : "si"}
                            />
                            <button type="submit" className="admin-btn suave">
                              {producto.activo ? "Esconder" : "Publicar"}
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
