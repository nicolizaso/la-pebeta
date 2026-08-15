"use client";

import { useActionState, useId, useMemo, useState } from "react";
import Link from "next/link";
import { guardarNota } from "@/app/admin/acciones";
import {
  MAX_AUTOR,
  MAX_BAJADA,
  MAX_CUERPO,
  MAX_ETIQUETAS,
  MAX_TITULO,
  estadoDeNota,
  etiquetasComoTexto,
  etiquetasDesdeTexto,
  minutosDeLectura,
  slugDeTitulo,
} from "@/lib/blog";
import type { Nota } from "@/lib/db";
import type { FotoDisponible } from "@/lib/photos";
import { SelectorDeFoto } from "./SelectorDeFoto";

/**
 * El formulario de una nota, el mismo para una nueva y para una que ya está.
 *
 * Todo es estado del cliente —no `defaultValue`— por las mismas dos razones que
 * en el formulario de un producto: hay campos que dependen de lo escrito (la
 * dirección sale del título, el pie cambia según la fecha) y si el guardado
 * falla no se pierde nada de lo redactado, que acá puede ser media hora de
 * trabajo.
 *
 * La fecha es la pieza que hace todo: es la que se lee al pie del título y es
 * cuándo sale. Puesta más adelante, con la nota publicada, queda programada y
 * aparece sola cuando llega el día.
 *
 * La dirección no se escribe. Sale del título —acá se muestra cómo va a
 * quedar— y la resuelve la action, que es la única que sabe si esa URL ya está
 * tomada por otra nota.
 */
export function NotaForm({
  nota,
  fotos,
  usadas,
  fecha: fechaInicial,
}: {
  /** La nota que se está editando, o null si es nueva. */
  nota: Nota | null;
  fotos: FotoDisponible[];
  /** Las etiquetas que ya se usaron en el blog, para no reinventarlas. */
  usadas: string[];
  /**
   * Con qué fecha abre el campo, ya en hora de Los Cardales
   * ("2026-08-21T14:35"): la de la nota, o ahora si es nueva. La pasa la página
   * porque la zona la resuelve el server, no el reloj de quien esté cargando.
   */
  fecha: string;
}) {
  const [estado, accion, guardando] = useActionState(guardarNota, null);
  const id = useId();

  const [titulo, setTitulo] = useState(nota?.titulo ?? "");
  const [bajada, setBajada] = useState(nota?.bajada ?? "");
  const [cuerpo, setCuerpo] = useState(nota?.cuerpo ?? "");
  const [autor, setAutor] = useState(nota?.autor ?? "");
  const [etiquetas, setEtiquetas] = useState(etiquetasComoTexto(nota?.etiquetas ?? []));
  const [fecha, setFecha] = useState(fechaInicial);
  const [publicada, setPublicada] = useState(nota ? nota.publicada : false);

  // una nota que ya salió se queda con la dirección que tiene, le cambien el
  // título o no: es el link que puede haber guardado alguien
  const salida = nota ? estadoDeNota(nota) === "publicada" : false;
  const direccion = salida ? nota!.slug : slugDeTitulo(titulo);
  const puestas = useMemo(() => etiquetasDesdeTexto(etiquetas), [etiquetas]);

  // el reloj del navegador alcanza para el aviso: la cuenta fina la hace el
  // server, que es el que compara contra la fecha guardada
  const porVenir = useMemo(() => {
    const cuando = new Date(fecha).getTime();
    return !Number.isNaN(cuando) && cuando > Date.now();
  }, [fecha]);

  const falla = estado && !estado.ok ? estado : null;
  const mal = (campo: string) => (falla?.campo === campo ? true : undefined);

  return (
    <form className="admin-form" action={accion}>
      {nota ? <input type="hidden" name="id" value={nota.id} /> : null}

      <div className="admin-form-grilla">
        <p className="admin-campo ancho">
          <label htmlFor={`${id}-titulo`}>Título</label>
          <input
            id={`${id}-titulo`}
            name="titulo"
            className="admin-titulo-nota"
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
            maxLength={MAX_TITULO}
            placeholder="La primera cosecha de la huerta nueva"
            aria-invalid={mal("titulo")}
            autoFocus={!nota}
          />
          <small>
            La nota va a vivir en <code>/blog/{direccion || "…"}</code>
            {salida
              ? ", y ahí se queda: ya salió, y esa dirección puede estar guardada en cualquier lado."
              : ". La dirección sale del título, no hay que escribirla."}
          </small>
        </p>

        <p className="admin-campo ancho">
          <label htmlFor={`${id}-bajada`}>Bajada</label>
          <textarea
            id={`${id}-bajada`}
            name="bajada"
            value={bajada}
            onChange={(evento) => setBajada(evento.target.value)}
            maxLength={MAX_BAJADA}
            rows={2}
            placeholder="Un par de líneas contando de qué va la nota."
            aria-invalid={mal("bajada")}
          />
          <small>
            Es lo que se lee en el listado del blog y debajo del título. Sin bajada se usa el
            principio del texto.
          </small>
        </p>

        <p className="admin-campo ancho">
          <label htmlFor={`${id}-cuerpo`}>La nota</label>
          <textarea
            id={`${id}-cuerpo`}
            name="cuerpo"
            className="admin-cuerpo"
            value={cuerpo}
            onChange={(evento) => setCuerpo(evento.target.value)}
            maxLength={MAX_CUERPO}
            rows={18}
            placeholder={
              "Un renglón en blanco separa los párrafos.\n\n## Un subtítulo se escribe así\n\n- una lista\n- se escribe así\n\n> Y una cita, así."
            }
            aria-invalid={mal("cuerpo")}
          />
          <small>
            Un renglón en blanco separa párrafos, <code>##</code> al principio hace un subtítulo,{" "}
            <code>-</code> una lista, <code>1.</code> una lista numerada y <code>&gt;</code> una
            cita. {cuerpo.trim() ? `${minutosDeLectura(cuerpo)} min de lectura · ` : ""}
            {cuerpo.length} de {MAX_CUERPO} caracteres.
          </small>
        </p>

        <p className="admin-campo">
          <label htmlFor={`${id}-autor`}>Firma</label>
          <input
            id={`${id}-autor`}
            name="autor"
            value={autor}
            onChange={(evento) => setAutor(evento.target.value)}
            maxLength={MAX_AUTOR}
            placeholder="La Pebeta"
            aria-invalid={mal("autor")}
          />
          <small>Quién la escribe. Vacío, la nota no lleva firma.</small>
        </p>

        <p className="admin-campo">
          <label htmlFor={`${id}-fecha`}>Cuándo sale</label>
          <input
            id={`${id}-fecha`}
            name="fecha"
            type="datetime-local"
            value={fecha}
            onChange={(evento) => setFecha(evento.target.value)}
            aria-invalid={mal("fecha")}
          />
          <small>
            En hora de Los Cardales. Es también la fecha que lleva la nota.
          </small>
        </p>

        <p className="admin-campo ancho">
          <label htmlFor={`${id}-etiquetas`}>Etiquetas</label>
          <input
            id={`${id}-etiquetas`}
            name="etiquetas"
            value={etiquetas}
            onChange={(evento) => setEtiquetas(evento.target.value)}
            placeholder="La Pebeta en tu casa, Recetas"
            aria-invalid={mal("etiquetas")}
            list={`${id}-etiquetas-usadas`}
          />
          {usadas.length > 0 ? (
            <datalist id={`${id}-etiquetas-usadas`}>
              {usadas.map((usada) => (
                <option key={usada} value={usada} />
              ))}
            </datalist>
          ) : null}
          <small>
            Separadas por coma, hasta {MAX_ETIQUETAS}. La primera es la sección en la que va la
            nota —“La Pebeta en tu casa”, “Huerta en tu casa”, “En La Pebeta”—; las que sigan, sus
            temas. En el blog se puede filtrar por cualquiera de ellas.
          </small>
          {puestas.length > 0 ? (
            <span className="admin-etiquetas-muestra">
              {puestas.map((puesta) => (
                <em key={puesta}>{puesta}</em>
              ))}
            </span>
          ) : null}
        </p>

        <SelectorDeFoto
          fotos={fotos}
          inicial={nota?.foto ?? ""}
          letra={titulo.charAt(0)}
          invalida={mal("foto")}
        />

        <label className="admin-check ancho">
          <input
            type="checkbox"
            name="publicada"
            checked={publicada}
            onChange={(evento) => setPublicada(evento.target.checked)}
          />
          <span>
            Publicar la nota
            <small>
              {!publicada
                ? "Sin tildar queda de borrador: guardada acá y en ningún otro lado."
                : porVenir
                  ? "Queda programada: no se ve hasta que llegue esa fecha, y ese día sale sola."
                  : "Sale al blog en cuanto se guarde."}
            </small>
          </span>
        </label>
      </div>

      <div className="admin-form-pie">
        <button type="submit" className="btn primary" disabled={guardando}>
          {guardando ? "Guardando…" : nota ? "Guardar cambios" : "Crear la nota"}
        </button>
        <Link href="/admin/blog" className="admin-btn suave">
          Cancelar
        </Link>
        <p className="admin-form-msg" role="status">
          {falla ? falla.mensaje : ""}
        </p>
      </div>
    </form>
  );
}
