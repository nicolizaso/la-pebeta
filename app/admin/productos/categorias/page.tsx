import Link from "next/link";
import { AdminAviso, FaltaSecretKey } from "@/components/admin/AdminAviso";
import { CategoriasForm } from "@/components/admin/CategoriasForm";
import {
  listarCategoriasDelPanel,
  listarProductosDelPanel,
  type Categoria,
  type Producto,
} from "@/lib/db";
import { contarPorCategoria } from "@/lib/productos";
import { hayClaveDeAdmin } from "@/lib/supabase";

/**
 * Los cajones del catálogo. No hay una lista fija en el código: son filas de
 * `pebeta_categorias`, y lo que se guarde acá es lo que se ve en el aside de la
 * tienda y en los filtros del panel.
 */
export default async function CategoriasPage() {
  if (!hayClaveDeAdmin()) return <FaltaSecretKey />;

  let categorias: Categoria[];
  let productos: Producto[];
  try {
    [categorias, productos] = await Promise.all([
      listarCategoriasDelPanel(),
      listarProductosDelPanel(),
    ]);
  } catch (error) {
    console.error("No se pudieron leer las categorías", error);
    return (
      <AdminAviso titulo="No pudimos leer las categorías" tono="alerta">
        <p>La base no contestó. Recargá la página; si sigue igual, revisá las claves de Supabase.</p>
      </AdminAviso>
    );
  }

  return (
    <>
      <header className="admin-head">
        <div className="eyebrow">
          <Link href="/admin/productos">Productos</Link>
        </div>
        <h1>Categorías</h1>
        <p>
          Los cajones en los que se ordena <Link href="/tienda">la tienda</Link>: el aside los lista
          en este orden, del más chico al más grande. Una categoría destildada sale del catálogo
          junto con sus productos, que quedan cargados y vuelven enteros cuando se la muestra de
          nuevo. También se puede crear una sin pasar por acá, desde el select de{" "}
          <Link href="/admin/productos/nuevo">un producto nuevo</Link>.
        </p>
      </header>

      {categorias.length === 0 ? (
        <AdminAviso titulo="Todavía no hay categorías">
          <p>Escribí la primera abajo, o creála mientras cargás un producto.</p>
        </AdminAviso>
      ) : null}

      <CategoriasForm categorias={categorias} conteos={contarPorCategoria(productos)} />
    </>
  );
}
