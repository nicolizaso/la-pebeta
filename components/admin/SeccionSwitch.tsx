"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { cambiarSeccion } from "@/app/admin/acciones";
import type { Seccion } from "@/lib/db";

/**
 * El interruptor de una sección del sitio: "Activar tienda", "Activar blog".
 *
 * La tilde no se mueve sola. Al tocarla salta un recuadro que dice qué va a
 * pasar y hay que confirmarlo: prender la tienda la pone a la venta para
 * cualquiera que entre, y apagarla la saca del sitio, así que no es algo que
 * pueda ocurrir por un click de más. El estado que se ve es siempre el que está
 * guardado —la casilla la manda el server—, y recién cambia cuando la acción
 * volvió bien.
 */
export function SeccionSwitch({
  seccion,
  interruptor,
  activa,
  confirmacion,
  advertencia,
  detalle,
}: {
  seccion: Seccion;
  /** Lo que dice la casilla: "Activar tienda". */
  interruptor: string;
  activa: boolean;
  /** El texto del recuadro al prenderla. */
  confirmacion: string;
  /** El texto del recuadro al apagarla. */
  advertencia: string;
  /** La línea que explica qué se está prendiendo, debajo de la casilla. */
  detalle: string;
}) {
  const [estado, accion, guardando] = useActionState(cambiarSeccion, null);
  // el cambio que está esperando confirmación: true = prender, false = apagar
  const [pedido, setPedido] = useState<boolean | null>(null);
  const confirmar = useRef<HTMLButtonElement>(null);

  // cuando la acción vuelve bien el recuadro se cierra solo; si falló se queda
  // abierto con el error, que es donde estaba mirando quien lo apretó
  useEffect(() => {
    if (estado?.ok) setPedido(null);
  }, [estado]);

  useEffect(() => {
    if (pedido === null) return;

    confirmar.current?.focus();
    const alTeclado = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setPedido(null);
    };
    window.addEventListener("keydown", alTeclado);
    return () => window.removeEventListener("keydown", alTeclado);
  }, [pedido]);

  const titulo = `${pedido ? "Activar" : "Desactivar"} ${interruptor.replace(/^Activar /, "")}`;

  return (
    <form
      className={`admin-seccion${activa ? " activa" : ""}`}
      action={accion}
      // el único camino al guardado es el botón del recuadro: sin nada que
      // confirmar no hay nada que mandar
      onSubmit={(evento) => {
        if (pedido === null) evento.preventDefault();
      }}
    >
      <input type="hidden" name="seccion" value={seccion} />
      <input type="hidden" name="activa" value={pedido ? "si" : "no"} />

      <div className="admin-seccion-fila">
        <label className="admin-seccion-switch">
          <input
            type="checkbox"
            checked={activa}
            disabled={guardando}
            onChange={(evento) => setPedido(evento.target.checked)}
          />
          <span>{interruptor}</span>
        </label>
        <span className="admin-seccion-estado">{activa ? "En el sitio" : "Próximamente"}</span>
      </div>

      <p className="admin-seccion-detalle">{detalle}</p>

      {estado && !pedido ? (
        <p className={`admin-seccion-msg${estado.ok ? "" : " error"}`} role="status">
          {estado.mensaje}
        </p>
      ) : null}

      {pedido !== null ? (
        <div className="admin-modal">
          {/* el fondo cierra el recuadro, igual que Escape */}
          <button
            type="button"
            className="admin-modal-fondo"
            aria-label="Cancelar"
            tabIndex={-1}
            onClick={() => setPedido(null)}
          />
          <div
            className="admin-modal-caja"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`seccion-${seccion}-titulo`}
          >
            <h3 id={`seccion-${seccion}-titulo`}>{titulo}</h3>
            <p>{pedido ? confirmacion : advertencia}</p>

            {estado && !estado.ok ? (
              <p className="admin-seccion-msg error" role="status">
                {estado.mensaje}
              </p>
            ) : null}

            <div className="admin-modal-pie">
              <button
                type="button"
                className="admin-btn suave"
                onClick={() => setPedido(null)}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button ref={confirmar} type="submit" className="admin-btn" disabled={guardando}>
                {guardando
                  ? "Guardando…"
                  : pedido
                    ? "Sí, activar la sección"
                    : "Sí, desactivar la sección"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
