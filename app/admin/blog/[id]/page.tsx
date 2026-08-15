import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminAviso, FaltaSecretKey } from "@/components/admin/AdminAviso";
import { BorrarNota } from "@/components/admin/BorrarNota";
import { NotaForm } from "@/components/admin/NotaForm";
import { estadoDeNota, etiquetasDe } from "@/lib/blog";
import { buscarNota, listarNotasDelPanel, type Nota } from "@/lib/db";
import { fechaHora, paraElReloj } from "@/lib/fechas";
import { fotosDisponibles } from "@/lib/photos";
import { hayClaveDeAdmin } from "@/lib/supabase";

/** Una nota que ya está: el mismo formulario, más la baja definitiva. */
export default async function NotaPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hayClaveDeAdmin()) return <FaltaSecretKey />;

  const { id } = await params;

  let nota: Nota | null;
  let usadas: string[] = [];
  try {
    const [suya, todas] = await Promise.all([buscarNota(id), listarNotasDelPanel()]);
    nota = suya;
    usadas = etiquetasDe(todas);
  } catch (error) {
    console.error("No se pudo leer la nota", error);
    return (
      <AdminAviso titulo="No pudimos leer la nota" tono="alerta">
        <p>La base no contestó. Recargá la página; si sigue igual, revisá las claves de Supabase.</p>
      </AdminAviso>
    );
  }

  if (!nota) notFound();

  const estado = estadoDeNota(nota);

  return (
    <>
      <header className="admin-head">
        <div className="eyebrow">
          <Link href="/admin/blog">Blog</Link>
        </div>
        <h1>{nota.titulo}</h1>
        <p>
          {estado === "publicada" ? (
            <>
              En el blog desde el {fechaHora(nota.fecha)} hs, en{" "}
              <Link href={`/blog/${nota.slug}`}>/blog/{nota.slug}</Link>.
            </>
          ) : estado === "programada" ? (
            `Programada para el ${fechaHora(nota.fecha)} hs: ese día sale sola.`
          ) : (
            `Borrador, guardado el ${fechaHora(nota.actualizada)} hs.`
          )}
        </p>
      </header>

      <NotaForm
        nota={nota}
        fotos={fotosDisponibles()}
        usadas={usadas}
        fecha={paraElReloj(nota.fecha)}
      />

      <section className="admin-bloque admin-baja">
        <div className="admin-bloque-head">
          <h2>Dar de baja</h2>
        </div>
        <p>
          Sacarla del blog la deja de borrador: no se ve, pero queda escrita y se vuelve a publicar
          con un click. Borrarla se lleva el texto y libera la dirección, y no se puede deshacer.
        </p>
        <BorrarNota id={nota.id} slug={nota.slug} titulo={nota.titulo} />
      </section>
    </>
  );
}
