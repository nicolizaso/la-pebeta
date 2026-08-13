"use client";

import { useActionState, useState } from "react";
import { guardarSemana } from "@/app/admin/acciones";
import type { Horario, HorarioArea } from "@/lib/db";
import { nombreDia } from "@/lib/horarios";

/**
 * La semana de un área, los siete días juntos.
 *
 * Se guarda entera de una sola vez: un horario se piensa mirando la semana
 * completa, no día por día, y así "abrimos los miércoles" es un solo guardado.
 */
export function HorariosForm({
  area,
  etiqueta,
  bajada,
  semana,
}: {
  area: HorarioArea;
  etiqueta: string;
  bajada: string;
  semana: Horario[];
}) {
  const [estado, accion, guardando] = useActionState(guardarSemana, null);
  // el único estado del cliente: qué días están abiertos, para apagar sus horas
  const [abiertos, setAbiertos] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(semana.map((dia) => [dia.dia, dia.abierto]))
  );

  return (
    <form className="admin-horarios" action={accion}>
      <input type="hidden" name="area" value={area} />

      <div className="admin-horarios-head">
        <h2>{etiqueta}</h2>
        <p>{bajada}</p>
      </div>

      <ul className="admin-dias">
        {semana.map((dia) => {
          const abierto = abiertos[dia.dia] ?? dia.abierto;
          return (
            <li key={dia.dia} className={`admin-dia${abierto ? "" : " cerrado"}`}>
              <label className="admin-dia-switch">
                <input
                  type="checkbox"
                  name={`abierto-${dia.dia}`}
                  defaultChecked={dia.abierto}
                  onChange={(evento) =>
                    setAbiertos((previo) => ({ ...previo, [dia.dia]: evento.target.checked }))
                  }
                />
                <span>{nombreDia(dia.dia)}</span>
              </label>

              <div className="admin-dia-horas">
                <input
                  type="time"
                  name={`desde-${dia.dia}`}
                  defaultValue={dia.desde}
                  disabled={!abierto}
                  aria-label={`${nombreDia(dia.dia)}: desde`}
                />
                <span aria-hidden="true">a</span>
                <input
                  type="time"
                  name={`hasta-${dia.dia}`}
                  defaultValue={dia.hasta}
                  disabled={!abierto}
                  aria-label={`${nombreDia(dia.dia)}: hasta`}
                />
                {abierto ? null : <span className="admin-dia-cerrado">Cerrado</span>}
              </div>

              {/* la nota queda viva aunque el día esté cerrado: "cerrado por
                  vacaciones" también es información que se carga acá */}
              <input
                type="text"
                className="admin-dia-nota"
                name={`nota-${dia.dia}`}
                defaultValue={dia.nota}
                maxLength={120}
                placeholder="Nota: última mesa 15 hs, feriados…"
                aria-label={`${nombreDia(dia.dia)}: nota`}
              />
            </li>
          );
        })}
      </ul>

      <div className="admin-horarios-pie">
        <button type="submit" className="btn primary" disabled={guardando}>
          {guardando ? "Guardando…" : `Guardar ${etiqueta.toLowerCase()}`}
        </button>
        <p className={`admin-horarios-msg${estado && !estado.ok ? " error" : ""}`} role="status">
          {estado ? estado.mensaje : ""}
        </p>
      </div>
    </form>
  );
}
