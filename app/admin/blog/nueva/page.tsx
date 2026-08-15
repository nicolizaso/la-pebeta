import Link from "next/link";
import { FaltaSecretKey } from "@/components/admin/AdminAviso";
import { NotaForm } from "@/components/admin/NotaForm";
import { paraElReloj } from "@/lib/fechas";
import { fotosDisponibles } from "@/lib/photos";
import { hayClaveDeAdmin } from "@/lib/supabase";

/**
 * Una nota nueva. Abre con la fecha de hoy y sin publicar: lo normal es
 * escribirla en varias sentadas y recién después decidir cuándo sale.
 */
export default async function NuevaNotaPage() {
  if (!hayClaveDeAdmin()) return <FaltaSecretKey />;

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

      <NotaForm nota={null} fotos={fotosDisponibles()} fecha={paraElReloj(new Date().toISOString())} />
    </>
  );
}
