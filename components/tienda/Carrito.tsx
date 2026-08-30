"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { WHATSAPP } from "@/lib/contacto";
import {
  autorizarPago,
  MAX_UNIDADES,
  precio,
  TARJETA_DEMO,
  TARJETA_VACIA,
  type DatosTarjeta,
  type ProductoVista,
} from "@/lib/tienda";

export type LineaCarrito = { producto: ProductoVista; cantidad: number };

type Comprobante = {
  codigo: string;
  total: number;
  nombre: string;
  /** ¿Quedó la sesión abierta? Pasa cuando la cuenta no tiene contraseña. */
  entro: boolean;
  /** Ya había cuenta con ese mail y tiene contraseña: hay que entrar. */
  conContrasena: boolean;
};

/**
 * El carrito y el cierre de la compra, en un panel al costado.
 *
 * Son tres pasos en el mismo lugar —lo que llevás, los datos con la tarjeta y
 * el comprobante— para no perder de vista el pedido en ningún momento. El
 * pedido que viaja son ids y cantidades: los precios los pone la API contra el
 * catálogo.
 */
export function Carrito({
  lineas,
  total,
  abierto,
  onCerrar,
  onCantidad,
  onVaciar,
}: {
  lineas: LineaCarrito[];
  total: number;
  abierto: boolean;
  onCerrar: () => void;
  onCantidad: (producto: ProductoVista, cantidad: number) => void;
  onVaciar: () => void;
}) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const [paso, setPaso] = useState<"carrito" | "datos">("carrito");
  const [cliente, setCliente] = useState({ nombre: "", telefono: "", email: "" });
  const [tarjeta, setTarjeta] = useState<DatosTarjeta>(TARJETA_VACIA);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [comprobante, setComprobante] = useState<Comprobante | null>(null);

  // Escape cierra y el fondo no scrollea, igual que en el visor de fotos.
  useEffect(() => {
    if (!abierto) return;

    const onKey = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", onKey);

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierto, onCerrar]);

  // si se vació el carrito desde la grilla, el paso de datos ya no tiene sentido
  useEffect(() => {
    if (lineas.length === 0 && !comprobante) setPaso("carrito");
  }, [lineas.length, comprobante]);

  if (!abierto) return null;

  const pagar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    const revision = autorizarPago(tarjeta);
    if (!revision.ok) {
      setError(revision.error);
      return;
    }

    setEnviando(true);
    setError("");

    try {
      const respuesta = await fetch("/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente,
          items: lineas.map((linea) => ({
            productoId: linea.producto.id,
            cantidad: linea.cantidad,
          })),
          pago: tarjeta,
        }),
      });
      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.ok) {
        setError(datos.error ?? "No pudimos cerrar la compra.");
        setEnviando(false);
        return;
      }

      setComprobante({
        codigo: datos.compra.codigo,
        total: datos.compra.total,
        nombre: datos.compra.cliente.nombre,
        entro: Boolean(datos.cuenta?.entro),
        conContrasena: Boolean(datos.cuenta?.conContrasena),
      });
      setTarjeta(TARJETA_VACIA);
      onVaciar();
    } catch {
      setError("Se cortó la conexión. Probá de nuevo o escribinos por WhatsApp.");
    } finally {
      setEnviando(false);
    }
  };

  const volverALaTienda = () => {
    setComprobante(null);
    setPaso("carrito");
    setCliente({ nombre: "", telefono: "", email: "" });
    onCerrar();
  };

  return (
    <div className="carrito-fondo" onClick={onCerrar}>
      <div
        className="carrito"
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
        tabIndex={-1}
        ref={panel}
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="carrito-head">
          <span className="carrito-paso">
            {comprobante ? "Compra hecha" : paso === "datos" ? "Datos y pago" : "Tu pedido"}
          </span>
          <button type="button" className="carrito-cerrar" onClick={onCerrar} aria-label="Cerrar el carrito">
            ×
          </button>
        </header>

        {comprobante ? (
          <div className="carrito-cuerpo" role="status">
            <h2 className="carrito-titulo">Listo, {comprobante.nombre.split(" ")[0]}.</h2>
            <p className="carrito-nota">
              Tu compra quedó registrada con el código <strong>{comprobante.codigo}</strong> por{" "}
              {precio(comprobante.total)}. Preparamos el pedido y te avisamos cuando puedas pasar a
              retirarlo por la proveeduría.
            </p>
            {comprobante.entro ? (
              <p className="carrito-nota">
                Te dejamos la cuenta abierta: en tu perfil vas a ver este pedido y tus reservas.
              </p>
            ) : comprobante.conContrasena ? (
              <p className="carrito-nota">
                Ya tenías una cuenta con ese mail. Entrá a tu perfil con tu contraseña y ahí lo vas
                a ver.
              </p>
            ) : null}
            <p className="carrito-fino">
              El cobro es de mentira: esto es una pasarela de demostración y no se cobró nada.
            </p>
            <div className="carrito-acciones">
              <button type="button" className="btn primary" onClick={volverALaTienda}>
                Seguir comprando
              </button>
              {comprobante.entro || comprobante.conContrasena ? (
                <Link className="btn ghost" href="/perfil">
                  Ver mi perfil
                </Link>
              ) : (
                <a className="btn ghost" href={WHATSAPP} target="_blank" rel="noreferrer">
                  Escribinos por WhatsApp
                </a>
              )}
            </div>
          </div>
        ) : lineas.length === 0 ? (
          <div className="carrito-cuerpo">
            <h2 className="carrito-titulo">El carrito está vacío.</h2>
            <p className="carrito-nota">
              Elegí lo que quieras de la lista y aparece acá. Se guarda en este navegador, así que
              podés cerrar la página y seguir después.
            </p>
            <div className="carrito-acciones">
              <button type="button" className="btn primary" onClick={onCerrar}>
                Ver el catálogo
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="carrito-cuerpo">
              <ul className="carrito-lista">
                {lineas.map(({ producto, cantidad }) => {
                  const tope = Math.min(MAX_UNIDADES, producto.stock);
                  return (
                    <li key={producto.id}>
                      <div className="carrito-item">
                        <strong>{producto.nombre}</strong>
                        <span className="carrito-unidad">
                          {precio(producto.precio)} por {producto.unidad}
                        </span>
                      </div>

                      <div className="carrito-cantidad">
                        <button
                          type="button"
                          onClick={() => onCantidad(producto, cantidad - 1)}
                          aria-label={`Sacar uno de ${producto.nombre}`}
                        >
                          −
                        </button>
                        <span aria-label={`${cantidad} en el carrito`}>{cantidad}</span>
                        <button
                          type="button"
                          onClick={() => onCantidad(producto, cantidad + 1)}
                          disabled={cantidad >= tope}
                          aria-label={`Sumar uno de ${producto.nombre}`}
                        >
                          +
                        </button>
                      </div>

                      <span className="carrito-subtotal">{precio(producto.precio * cantidad)}</span>

                      <button
                        type="button"
                        className="carrito-quitar"
                        onClick={() => onCantidad(producto, 0)}
                      >
                        Quitar
                      </button>
                    </li>
                  );
                })}
              </ul>

              {paso === "datos" ? (
                <form className="carrito-form" id={`${id}-form`} onSubmit={pagar} noValidate>
                  <h3 className="carrito-titulo">¿Quién lo retira?</h3>
                  <div className="campos">
                    <p className="campo ancho">
                      <label htmlFor={`${id}-nombre`}>Nombre y apellido</label>
                      <input
                        id={`${id}-nombre`}
                        value={cliente.nombre}
                        onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                        maxLength={80}
                        autoComplete="name"
                        required
                      />
                    </p>
                    <p className="campo">
                      <label htmlFor={`${id}-telefono`}>Teléfono</label>
                      <input
                        id={`${id}-telefono`}
                        type="tel"
                        value={cliente.telefono}
                        onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                        autoComplete="tel"
                        required
                      />
                    </p>
                    <p className="campo">
                      <label htmlFor={`${id}-email`}>Mail</label>
                      <input
                        id={`${id}-email`}
                        type="email"
                        value={cliente.email}
                        onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                        autoComplete="email"
                        required
                      />
                      <span className="pista">Con esto ves tu pedido</span>
                    </p>
                  </div>

                  <div className="carrito-tarjeta">
                    <div className="carrito-tarjeta-head">
                      <h3 className="carrito-titulo">Pago con tarjeta</h3>
                      <button
                        type="button"
                        className="carrito-demo"
                        onClick={() => setTarjeta(TARJETA_DEMO)}
                      >
                        Usar tarjeta de prueba
                      </button>
                    </div>
                    <p className="carrito-fino">
                      Es una pasarela de demostración: no hay cobro, no se guarda nada de la tarjeta
                      y podés dejar los campos vacíos y terminar igual.
                    </p>

                    <div className="campos">
                      <p className="campo ancho">
                        <label htmlFor={`${id}-numero`}>Número</label>
                        <input
                          id={`${id}-numero`}
                          inputMode="numeric"
                          placeholder="4111 1111 1111 1111"
                          value={tarjeta.numero}
                          onChange={(e) => setTarjeta({ ...tarjeta, numero: e.target.value })}
                        />
                      </p>
                      <p className="campo">
                        <label htmlFor={`${id}-vencimiento`}>Vencimiento</label>
                        <input
                          id={`${id}-vencimiento`}
                          placeholder="MM/AA"
                          value={tarjeta.vencimiento}
                          onChange={(e) => setTarjeta({ ...tarjeta, vencimiento: e.target.value })}
                        />
                      </p>
                      <p className="campo">
                        <label htmlFor={`${id}-cvv`}>Código</label>
                        <input
                          id={`${id}-cvv`}
                          inputMode="numeric"
                          placeholder="123"
                          value={tarjeta.cvv}
                          onChange={(e) => setTarjeta({ ...tarjeta, cvv: e.target.value })}
                        />
                      </p>
                      <p className="campo ancho">
                        <label htmlFor={`${id}-titular`}>Titular</label>
                        <input
                          id={`${id}-titular`}
                          value={tarjeta.titular}
                          onChange={(e) => setTarjeta({ ...tarjeta, titular: e.target.value })}
                        />
                      </p>
                    </div>
                  </div>

                  <p className="carrito-error" role="alert">
                    {error}
                  </p>
                </form>
              ) : null}
            </div>

            <footer className="carrito-pie">
              <div className="carrito-total">
                <span>Total</span>
                <strong>{precio(total)}</strong>
              </div>

              {/* Los dos pasos llevan key propia a propósito: sin eso React reusa
                  el mismo <button> para "Finalizar compra" y para "Pagar", y el
                  navegador termina corriendo la acción por defecto del botón ya
                  convertido en submit, mandando el formulario vacío de una. */}
              {paso === "datos" ? (
                <div className="carrito-acciones" key="pagar">
                  <button
                    type="submit"
                    form={`${id}-form`}
                    className="btn primary"
                    disabled={enviando}
                  >
                    {enviando ? "Cobrando…" : `Pagar ${precio(total)}`}
                  </button>
                  <button type="button" className="btn ghost" onClick={() => setPaso("carrito")}>
                    Volver al carrito
                  </button>
                </div>
              ) : (
                <div className="carrito-acciones" key="revisar">
                  <button type="button" className="btn primary" onClick={() => setPaso("datos")}>
                    Finalizar compra
                  </button>
                  <button type="button" className="btn ghost" onClick={onVaciar}>
                    Vaciar
                  </button>
                </div>
              )}
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
