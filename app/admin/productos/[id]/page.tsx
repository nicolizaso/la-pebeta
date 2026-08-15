import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminAviso, FaltaSecretKey } from "@/components/admin/AdminAviso";
import { BorrarProducto } from "@/components/admin/BorrarProducto";
import { ProductoForm } from "@/components/admin/ProductoForm";
import { buscarProducto, listarCategoriasDelPanel, type Categoria, type Producto } from "@/lib/db";
import { fechaHora } from "@/lib/fechas";
import { fotosDisponibles } from "@/lib/photos";
import { hayClaveDeAdmin } from "@/lib/supabase";

/** Un producto que ya está: el mismo formulario, más la baja definitiva. */
export default async function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hayClaveDeAdmin()) return <FaltaSecretKey />;

  const { id } = await params;

  let producto: Producto | null;
  let categorias: Categoria[];
  try {
    [producto, categorias] = await Promise.all([buscarProducto(id), listarCategoriasDelPanel()]);
  } catch (error) {
    console.error("No se pudo leer el producto", error);
    return (
      <AdminAviso titulo="No pudimos leer el producto" tono="alerta">
        <p>La base no contestó. Recargá la página; si sigue igual, revisá las claves de Supabase.</p>
      </AdminAviso>
    );
  }

  if (!producto) notFound();

  return (
    <>
      <header className="admin-head">
        <div className="eyebrow">
          <Link href="/admin/productos">Productos</Link>
        </div>
        <h1>{producto.nombre}</h1>
        <p>
          Cargado el {fechaHora(producto.creado)} hs.{" "}
          {producto.activo ? "Está publicado en la tienda." : "Todavía no está publicado."}
        </p>
      </header>

      <ProductoForm producto={producto} categorias={categorias} fotos={fotosDisponibles()} />

      <section className="admin-bloque admin-baja">
        <div className="admin-bloque-head">
          <h2>Dar de baja</h2>
        </div>
        <p>
          Si es algo de temporada que va a volver, conviene esconderlo en vez de borrarlo: queda
          cargado y se publica de nuevo con un click. Borrarlo no toca las compras que ya se lo
          llevaron —cada una guarda el nombre y el precio de ese día—, pero no se puede deshacer.
        </p>
        <BorrarProducto id={producto.id} nombre={producto.nombre} />
      </section>
    </>
  );
}
