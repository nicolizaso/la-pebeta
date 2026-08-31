import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Asistente } from "@/components/chat/Asistente";
import { Header } from "@/components/Header";
import { Proximamente } from "@/components/Proximamente";
import { SiteAnimations } from "@/components/SiteAnimations";
import { NotaCard } from "@/components/blog/NotaCard";
import { bloquesDelCuerpo, minutosDeLectura, resumenDe, slugDeEtiqueta } from "@/lib/blog";
import { buscarNotaPublicada, listarNotas, type Nota } from "@/lib/db";
import { fechaDelDia } from "@/lib/fechas";
import { fotoDeNota } from "@/lib/photos";
import { seccionActiva } from "@/lib/secciones";

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
  if (!(await seccionActiva("blog"))) {
    return { title: "Blog — Próximamente — La Pebeta", robots: { index: false, follow: true } };
  }

  const { slug } = await params;
  const nota = await laNota(slug);
  if (!nota) return { title: "Nota — La Pebeta" };

  return {
    title: `${nota.titulo} — La Pebeta`,
    description: resumenDe(nota) || undefined,
  };
}

export default async function NotaPage({ params }: { params: Promise<{ slug: string }> }) {
  // con el blog apagado ni siquiera una nota publicada se lee por su link:
  // la sección entera está cerrada, no la nota
  if (!(await seccionActiva("blog"))) {
    return (
      <Proximamente eyebrow="Blog" titulo="Estamos escribiendo la primera nota.">
        <p>
          El blog está por abrir. Acá vamos a contar lo que pasa en el campo: la huerta, los
          animales, la cocina y lo que cada estación trae.
        </p>
        <p>Mientras tanto, escribinos: te contamos lo que quieras saber de la granja.</p>
      </Proximamente>
    );
  }

  const { slug } = await params;
  const nota = await laNota(slug);
  if (!nota) notFound();

  const imagen = fotoDeNota(nota.foto);
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
                {nota.etiquetas[0] ? (
                  <Link href={`/blog?etiqueta=${slugDeEtiqueta(nota.etiquetas[0])}`}>
                    {nota.etiquetas[0]}
                  </Link>
                ) : null}
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
                    placeholder={imagen.blurDataURL ? "blur" : "empty"}
                    blurDataURL={imagen.blurDataURL}
                    priority
                  />
                </span>
              </figure>
            </div>
          ) : null}

          <div className="wrap">
            <div className="nota-cuerpo">
              {bloques.map((bloque, indice) => {
                if (bloque.tipo === "subtitulo") {
                  return (
                    <h2 key={indice} className="reveal">
                      {bloque.texto}
                    </h2>
                  );
                }
                if (bloque.tipo === "cita") {
                  return (
                    <blockquote key={indice} className="reveal">
                      {bloque.texto}
                    </blockquote>
                  );
                }
                if (bloque.tipo === "lista") {
                  const Lista = bloque.ordenada ? "ol" : "ul";
                  return (
                    <Lista key={indice} className="reveal">
                      {bloque.items.map((item, cual) => (
                        <li key={cual}>{item}</li>
                      ))}
                    </Lista>
                  );
                }
                return (
                  <p key={indice} className="reveal">
                    {bloque.texto}
                  </p>
                );
              })}
            </div>

            <div className="nota-pie">
              {nota.etiquetas.length > 0 ? (
                <p className="nota-etiquetas">
                  {nota.etiquetas.map((etiqueta) => (
                    <Link key={etiqueta} href={`/blog?etiqueta=${slugDeEtiqueta(etiqueta)}`}>
                      {etiqueta}
                    </Link>
                  ))}
                </p>
              ) : null}
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
      <Asistente />
    </>
  );
}
