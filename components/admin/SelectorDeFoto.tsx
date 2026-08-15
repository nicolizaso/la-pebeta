"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { subirFotoDeNota } from "@/app/admin/acciones";
import type { FotoDisponible } from "@/lib/photos";

/**
 * La foto que abre una nota. Hay dos maneras de conseguirla y el panel las
 * ofrece a la par:
 *
 * - subir una del dispositivo, que es lo que pasa cuando la foto se sacó esa
 *   misma mañana y está en el teléfono de quien escribe;
 * - elegir una de la galería del sitio, que son las de `public/imgs/`.
 *
 * La galería se abre como galería: miniaturas grandes con el nombre abajo, que
 * es como se elige una foto. Una lista de nombres serviría para encontrar
 * `huerta/17` si alguien se acordara de que la 17 es la de la acelga.
 *
 * El valor que viaja en el formulario es uno solo —el input escondido de acá
 * abajo—: la clave del manifiesto o la URL de la que se subió.
 */
export function SelectorDeFoto({
  fotos,
  inicial,
  letra,
  invalida,
}: {
  fotos: FotoDisponible[];
  /** La foto que ya tenía la nota: clave del manifiesto o URL. */
  inicial: string;
  /** La inicial del título, que es lo que se ve mientras no hay foto. */
  letra: string;
  invalida?: boolean;
}) {
  const [foto, setFoto] = useState(inicial);
  const [abierta, setAbierta] = useState(false);
  const [area, setArea] = useState("");
  const [error, setError] = useState("");
  const [subiendo, empezarSubida] = useTransition();
  const archivo = useRef<HTMLInputElement>(null);

  const areas = useMemo(() => {
    const cuenta = new Map<string, number>();
    for (const disponible of fotos) {
      const suya = disponible.clave.split("/")[0];
      cuenta.set(suya, (cuenta.get(suya) ?? 0) + 1);
    }
    return [...cuenta];
  }, [fotos]);

  const visibles = area ? fotos.filter((f) => f.clave.startsWith(`${area}/`)) : fotos;
  const delManifiesto = fotos.find((f) => f.clave === foto);
  // lo que se muestra: la del manifiesto, o la que se subió, que llega como URL
  const muestra = delManifiesto ? delManifiesto.src : /^https?:\/\//.test(foto) ? foto : "";

  function subir(archivoElegido: File | undefined) {
    if (!archivoElegido) return;
    setError("");

    empezarSubida(async () => {
      const datos = new FormData();
      datos.set("archivo", archivoElegido);

      const respuesta = await subirFotoDeNota(datos);
      if (respuesta.ok) {
        setFoto(respuesta.url);
        setAbierta(false);
      } else {
        setError(respuesta.error);
      }
      // así la misma foto se puede volver a elegir si algo salió mal
      if (archivo.current) archivo.current.value = "";
    });
  }

  return (
    <div className="admin-campo ancho">
      <span className="admin-campo-titulo">Foto</span>
      <input type="hidden" name="foto" value={foto} />

      <div className="admin-foto-fila">
        <span className={`admin-foto-muestra${invalida ? " mal" : ""}`}>
          {/* La muestra va con <img> pelado a propósito: es una miniatura de 96
              píxeles de una foto que muchas veces se acaba de subir, y pasarla
              por el optimizador sería mandar a buscar de nuevo lo que el panel
              ya tiene. La galería de abajo, que sí son fotos del sitio, usa
              next/image como el resto. */}
          {muestra ? <img src={muestra} alt="" /> : <em>{letra || "—"}</em>}
        </span>

        <span className="admin-foto-acciones">
          <span className="admin-foto-botones">
            <button
              type="button"
              className="admin-btn"
              onClick={() => archivo.current?.click()}
              disabled={subiendo}
            >
              {subiendo ? "Subiendo…" : "Subir una foto"}
            </button>
            <button
              type="button"
              className="admin-btn suave"
              onClick={() => setAbierta((estaba) => !estaba)}
            >
              {abierta ? "Cerrar la galería" : "Elegir de la galería"}
            </button>
            {foto ? (
              <button type="button" className="admin-btn suave" onClick={() => setFoto("")}>
                Quitar
              </button>
            ) : null}
          </span>

          <input
            ref={archivo}
            type="file"
            className="admin-archivo"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(evento) => subir(evento.target.files?.[0])}
          />

          <small>
            {error ? (
              <strong className="admin-foto-error">{error}</strong>
            ) : foto ? (
              delManifiesto ? (
                <>De la galería del sitio: <code>{foto}</code>.</>
              ) : (
                "Subida desde el panel."
              )
            ) : (
              "Del dispositivo (hasta 5 MB) o de las fotos del sitio. Sin foto queda la inicial sobre el fondo de papel."
            )}
          </small>
        </span>
      </div>

      {abierta ? (
        <div className="admin-galeria">
          <div className="admin-galeria-filtro">
            <button
              type="button"
              className={`admin-chip${area === "" ? " activo" : ""}`}
              onClick={() => setArea("")}
            >
              Todas · {fotos.length}
            </button>
            {areas.map(([suya, cuantas]) => (
              <button
                key={suya}
                type="button"
                className={`admin-chip${area === suya ? " activo" : ""}`}
                onClick={() => setArea(suya)}
              >
                {suya} · {cuantas}
              </button>
            ))}
          </div>

          <div className="admin-galeria-grilla">
            {visibles.map((disponible) => (
              <button
                key={disponible.clave}
                type="button"
                className={`admin-galeria-foto${foto === disponible.clave ? " elegida" : ""}`}
                onClick={() => {
                  setFoto(disponible.clave);
                  setAbierta(false);
                }}
                aria-pressed={foto === disponible.clave}
              >
                <span className="admin-galeria-imagen">
                  <Image src={disponible.src} alt="" fill sizes="160px" />
                </span>
                <span className="admin-galeria-nombre">{disponible.clave}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
