import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SiteAnimations } from "@/components/SiteAnimations";
import { NotaCard } from "@/components/blog/NotaCard";
import { bloquesDelCuerpo, minutosDeLectura, resumenDe } from "@/lib/blog";
import { buscarNotaPublicada, listarNotas, type Nota } from "@/lib/db";
import { fechaDelDia } from "@/lib/fechas";
import { buscarFoto } from "@/lib/photos";

/**
 * Una nota del blog.
 *
 * Como el listado, se arma en cada visita: una nota programada no existe para
 * afuera —ni siquiera por su URL— hasta que llega su fecha, y el que decide eso
 * es el reloj del momento en que alguien entra.
 */
export const dynamic = "force-dynamic";

/**
 * La nota, leída una sola vez por visita: `generateMetadata` y la página piden
 * la misma, y `cache` hace que la consulta salga una vez.
 */
const laNota = cache(async (slug: string): Promise<Nota | null> => {
  try {
    return await buscarNotaPublicada(slug);
  } catch (error) {
    console.error("No se pudo leer la nota", error);
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const nota = await laNota(slug);
  if (!nota) return { title: "Nota — La Pebeta" };

  return {
    title: `${nota.titulo} — La Pebeta`,
    description: resumenDe(nota) || undefined,
  };
}

export default async function NotaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const nota = await laNota(slug);
  if (!nota) notFound();

  const imagen = buscarFoto(nota.foto);
  const bloques = bloquesDelCuerpo(nota.cuerpo);

  let otras: Nota[] = [];
  try {
    otras = (await listarNotas(4)).filter((otra) => otra.id !== nota.id).slice(0, 3);
  } catch (error) {
    // que no haya con qué seguir leyendo no es razón para no mostrar la nota
    console.error("No se pudieron leer las otras notas", error);
  }

  return (
    <>
      <SiteAnimations />
      <Header />
      <main>
        <article className="nota">
          <header className="nota-portada">
            <div className="wrap">
              <div className="eyebrow reveal">
                <Link href="/blog">Blog</Link>
              </div>
              <h1 className="reveal">{nota.titulo}</h1>
              {nota.bajada ? <p className="nota-bajada reveal">{nota.bajada}</p> : null}
              <p className="nota-firma reveal">
                <time dateTime={nota.fecha}>{fechaDelDia(nota.fecha)}</time>
                {nota.autor ? <span>{nota.autor}</span> : null}
                <span>{minutosDeLectura(nota.cuerpo)} min de lectura</span>
              </p>
            </div>
          </header>

          {imagen ? (
            <div className="wrap">
              <figure className="photo has-img has-parallax nota-foto" data-reveal-img>
                <span className="photo-media" data-parallax>
                  <Image
                    src={imagen.src}
                    alt={nota.titulo}
                    fill
                    sizes="(max-width: 1000px) 92vw, 1000px"
                    placeholder="blur"
                    blurDataURL={imagen.blurDataURL}
                    priority
                  />
                </span>
              </figure>
            </div>
          ) : null}

          <div className="wrap">
            <div className="nota-cuerpo">
              {bloques.map((bloque, indice) =>
                bloque.tipo === "subtitulo" ? (
                  <h2 key={indice} className="reveal">
                    {bloque.texto}
                  </h2>
                ) : bloque.tipo === "cita" ? (
                  <blockquote key={indice} className="reveal">
                    {bloque.texto}
                  </blockquote>
                ) : (
                  <p key={indice} className="reveal">
                    {bloque.texto}
                  </p>
                )
              )}
            </div>

            <div className="nota-pie">
              <Link href="/blog" className="btn ghost">
                Volver al blog
              </Link>
            </div>
          </div>
        </article>

        {otras.length > 0 ? (
          <section className="blog-cuerpo blog-otras">
            <div className="wrap">
              <h2 className="section-title reveal" data-split>
                Seguí leyendo.
              </h2>
              <div className="blog-grilla" data-stagger>
                {otras.map((otra) => (
                  <NotaCard key={otra.id} nota={otra} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
