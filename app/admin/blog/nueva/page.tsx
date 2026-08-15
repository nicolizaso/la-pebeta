import Link from "next/link";
import { FaltaSecretKey } from "@/components/admin/AdminAviso";
import { NotaForm } from "@/components/admin/NotaForm";
import { etiquetasDe } from "@/lib/blog";
import { listarNotasDelPanel } from "@/lib/db";
import { paraElReloj } from "@/lib/fechas";
import { fotosDisponibles } from "@/lib/photos";
import { hayClaveDeAdmin } from "@/lib/supabase";

/**
 * Una nota nueva. Abre con la fecha de hoy y sin publicar: lo normal es
 * escribirla en varias sentadas y recién después decidir cuándo sale.
 */
export default async function NuevaNotaPage() {
  if (!hayClaveDeAdmin()) return <FaltaSecretKey />;

  // las etiquetas que ya están, para que la sección se elija en vez de
  // escribirse de nuevo (y que no queden "Recetas" y "recetas" por separado)
  let usadas: string[] = [];
  try {
    usadas = etiquetasDe(await listarNotasDelPanel());
  } catch (error) {
    console.error("No se pudieron leer las etiquetas", error);
  }

  return (
    <>
      <header className="admin-head">
        <div className="eyebrow">
          <Link href="/admin/blog">Blog</Link>
        </div>
        <h1>Escribir una nota</h1>
        <p>
          Se guarda de borrador hasta que se la publique, y con una fecha de más adelante queda
          programada: ese día sale sola.
        </p>
      </header>

      <NotaForm
        nota={null}
        fotos={fotosDisponibles()}
        usadas={usadas}
        fecha={paraElReloj(new Date().toISOString())}
      />
    </>
  );
}
