import Image from "next/image";
import Link from "next/link";
import { minutosDeLectura, resumenDe } from "@/lib/blog";
import type { Nota } from "@/lib/db";
import { fechaDelDia } from "@/lib/fechas";
import { fotoDeNota } from "@/lib/photos";

/**
 * Una nota en el listado del blog. Es un componente de server, así que resuelve
 * su foto contra el manifiesto acá mismo: al navegador no viaja nada de esto.
 *
 * `destacada` es la última nota, que va arriba de todo y ocupa el ancho entero.
 */
export function NotaCard({ nota, destacada = false }: { nota: Nota; destacada?: boolean }) {
  const imagen = fotoDeNota(nota.foto);

  return (
    <article className={`nota-card${destacada ? " destacada" : ""} reveal`}>
      <Link href={`/blog/${nota.slug}`} className="nota-card-link">
        <div className="nota-card-foto">
          {imagen ? (
            <figure className="photo has-img">
              <span className="photo-media">
                <Image
                  src={imagen.src}
                  alt={nota.titulo}
                  fill
                  sizes={
                    destacada
                      ? "(max-width: 860px) 92vw, 58vw"
                      : "(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 30vw"
                  }
                  placeholder={imagen.blurDataURL ? "blur" : "empty"}
                  blurDataURL={imagen.blurDataURL}
                />
              </span>
            </figure>
          ) : (
            <figure className="photo nota-sinfoto" aria-hidden="true">
              <span>{nota.titulo.charAt(0)}</span>
            </figure>
          )}
        </div>

        <div className="nota-card-cuerpo">
          <p className="nota-fecha">
            {nota.etiquetas[0] ? <strong>{nota.etiquetas[0]}</strong> : null}
            <time dateTime={nota.fecha}>{fechaDelDia(nota.fecha)}</time>
            <span>{minutosDeLectura(nota.cuerpo)} min</span>
          </p>
          <h3>{nota.titulo}</h3>
          <p className="nota-card-bajada">{resumenDe(nota)}</p>
          <span className="nota-card-mas">Leer la nota</span>
        </div>
      </Link>
    </article>
  );
}
