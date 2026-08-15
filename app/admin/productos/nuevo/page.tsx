import Link from "next/link";
import { AdminAviso, FaltaSecretKey } from "@/components/admin/AdminAviso";
import { ProductoForm } from "@/components/admin/ProductoForm";
import { listarCategoriasDelPanel, type Categoria } from "@/lib/db";
import { fotosDisponibles } from "@/lib/photos";
import { hayClaveDeAdmin } from "@/lib/supabase";

/**
 * Un producto nuevo. Si va en una categoría que todavía no existe, se inventa
 * desde el mismo select: no hace falta salir de acá.
 */
export default async function NuevoProductoPage() {
  if (!hayClaveDeAdmin()) return <FaltaSecretKey />;

  let categorias: Categoria[];
  try {
    categorias = await listarCategoriasDelPanel();
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
        <h1>Cargar un producto</h1>
        <p>
          Lo que se escriba acá es lo que se lee en la ficha de la tienda. Se puede dejar sin
          publicar y terminarlo después.
        </p>
      </header>

      <ProductoForm producto={null} categorias={categorias} fotos={fotosDisponibles()} />
    </>
  );
}
