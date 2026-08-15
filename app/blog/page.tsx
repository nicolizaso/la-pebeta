import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SiteAnimations } from "@/components/SiteAnimations";
import { NotaCard } from "@/components/blog/NotaCard";
import { etiquetasDe, slugDeEtiqueta } from "@/lib/blog";
import { WHATSAPP } from "@/lib/contacto";
import { listarNotas, type Nota } from "@/lib/db";

export const metadata: Metadata = {
  title: "Blog — La Pebeta",
  description:
    "Lo que pasa en La Pebeta contado por quienes lo hacen: la huerta, los animales, la cocina y las estaciones en Los Cardales.",
};

/**
 * El blog.
 *
 * Se arma en cada visita en vez de cachearse, y por la misma razón que la
 * tienda: lo que se muestra depende de la hora. Una nota programada para el
 * jueves a las nueve aparece el jueves a las nueve, sin cron que la despierte ni
 * deploy que la traiga —la condición está en la consulta y en la policy de la
 * tabla—, y eso sólo funciona si la página se vuelve a armar cuando alguien
 * entra.
 */
export const dynamic = "force-dynamic";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ etiqueta?: string }>;
}) {
  let notas: Nota[] = [];
  let fallo = false;

  try {
    notas = await listarNotas();
  } catch (error) {
    console.error("No se pudo leer el blog", error);
    fallo = true;
  }

  const etiquetas = etiquetasDe(notas);
  const pedida = (await searchParams).etiqueta ?? "";
  // el filtro viaja como slug: la etiqueta se escribe "Huerta en tu casa" y en
  // la URL es `huerta-en-tu-casa`
  const elegida = etiquetas.find((etiqueta) => slugDeEtiqueta(etiqueta) === pedida) ?? "";

  const recorte = elegida ? notas.filter((nota) => nota.etiquetas.includes(elegida)) : notas;
  const [ultima, ...resto] = recorte;

  return (
    <>
      <SiteAnimations />
      <Header />
      <main>
        <section className="blog-portada">
          <div className="wrap">
            <div className="eyebrow reveal">Blog</div>
            <h1 className="reveal">Lo que pasa en el campo, contado acá.</h1>
            <p className="reveal">
              La huerta, los animales, la cocina y las estaciones: lo que aprendemos haciendo y lo
              que vale la pena contar de una semana en Los Cardales.
            </p>
          </div>
        </section>

        {recorte.length === 0 ? (
          <div className="wrap blog-caido">
            <h2>
              {fallo
                ? "No pudimos abrir el blog."
                : elegida
                  ? `Todavía no hay nada en ${elegida}.`
                  : "Todavía no hay ninguna nota."}
            </h2>
            <p>
              {fallo
                ? "La base no contestó. Recargá la página en un rato; si seguimos así, escribinos y te contamos lo que quieras saber."
                : elegida
                  ? "Va a haber. Mientras tanto, mirá el resto de las notas."
                  : "Estamos escribiendo la primera. Mientras tanto, escribinos y te contamos qué se está cosechando."}
            </p>
            {elegida && !fallo ? (
              <Link className="btn ghost" href="/blog">
                Ver todas las notas
              </Link>
            ) : (
              <a className="btn primary" href={WHATSAPP} target="_blank" rel="noreferrer">
                Escribinos por WhatsApp
              </a>
            )}
          </div>
        ) : (
          <section className="blog-cuerpo">
            <div className="wrap">
              {etiquetas.length > 0 ? (
                <nav className="blog-etiquetas reveal" aria-label="Secciones del blog">
                  <Link href="/blog" className={`blog-etiqueta${elegida ? "" : " activa"}`}>
                    Todas
                  </Link>
                  {etiquetas.map((etiqueta) => (
                    <Link
                      key={etiqueta}
                      href={`/blog?etiqueta=${slugDeEtiqueta(etiqueta)}`}
                      className={`blog-etiqueta${elegida === etiqueta ? " activa" : ""}`}
                    >
                      {etiqueta}
                    </Link>
                  ))}
                </nav>
              ) : null}

              <NotaCard nota={ultima} destacada />

              {resto.length > 0 ? (
                <div className="blog-grilla" data-stagger>
                  {resto.map((nota) => (
                    <NotaCard key={nota.id} nota={nota} />
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
