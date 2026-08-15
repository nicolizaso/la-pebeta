import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SiteAnimations } from "@/components/SiteAnimations";
import { NotaCard } from "@/components/blog/NotaCard";
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

export default async function BlogPage() {
  let notas: Nota[] = [];
  let fallo = false;

  try {
    notas = await listarNotas();
  } catch (error) {
    console.error("No se pudo leer el blog", error);
    fallo = true;
  }

  const [ultima, ...resto] = notas;

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

        {fallo || notas.length === 0 ? (
          <div className="wrap blog-caido">
            <h2>{fallo ? "No pudimos abrir el blog." : "Todavía no hay ninguna nota."}</h2>
            <p>
              {fallo
                ? "La base no contestó. Recargá la página en un rato; si seguimos así, escribinos y te contamos lo que quieras saber."
                : "Estamos escribiendo la primera. Mientras tanto, escribinos y te contamos qué se está cosechando."}
            </p>
            <a className="btn primary" href={WHATSAPP} target="_blank" rel="noreferrer">
              Escribinos por WhatsApp
            </a>
          </div>
        ) : (
          <section className="blog-cuerpo">
            <div className="wrap">
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
