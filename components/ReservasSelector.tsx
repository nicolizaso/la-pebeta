"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Photo } from "./Photo";
import { ReservaForm } from "./ReservaForm";
import type { ReservaTipo } from "@/lib/db";
import type { PhotoKey } from "@/lib/photos";
import { DIAS_TEXTO, HORA_SALIDA, PRECIO_GRANJA } from "@/lib/paseos";
import { precio } from "@/lib/tienda";
import { scrollToElement } from "@/lib/smooth-scroll";

type Opcion = {
  id: ReservaTipo;
  eyebrow: string;
  titulo: string;
  bajada: string;
  cuando: string;
  photo: PhotoKey;
  alt: string;
  position?: string;
  /** Headline of the detail card, once the option is picked. */
  detalleTitulo: string;
  info: { k: string; v: React.ReactNode }[];
  nota: React.ReactNode;
  /** Texto del botón que confirma el pedido de reserva. */
  enviar: string;
};

const DIRECCION = (
  <>
    Camino S.A. de Areco, Km 184
    <br />
    Los Cardales, Bs. As.
  </>
);

const OPCIONES: Opcion[] = [
  {
    id: "paseos",
    eyebrow: "Al aire libre",
    titulo: "Paseo por el campo",
    bajada:
      "La visita a la huerta, sin cargo, o el paseo por la granja: un recorrido productivo de 2 km entre los cultivos y los animales.",
    cuando: `${DIAS_TEXTO} · ${HORA_SALIDA} hs`,
    photo: "paseos/16",
    alt: "Rodeo de vacas Hereford descansando a la sombra de los árboles",
    position: "center 55%",
    detalleTitulo: "Un paseo guiado, antes del almuerzo.",
    info: [
      { k: "Días", v: DIAS_TEXTO },
      { k: "Salida", v: `${HORA_SALIDA} hs, desde la tranquera` },
      { k: "Visita a la huerta", v: "40 minutos · sin cargo" },
      { k: "Paseo por la granja", v: `1:30 hs · ${precio(PRECIO_GRANJA)} por persona` },
      { k: "Grupos", v: "Hasta 15 personas por recorrido" },
      { k: "Dirección", v: DIRECCION },
    ],
    nota: (
      <>
        <strong>Elegí abajo cuál de los dos querés.</strong> Si vas al recorrido por la granja,
        contanos con qué edades venís: está recomendado para mayores de diez años. Al terminar, tu
        mesa te espera lista para almorzar, así que eso ya va incluido y no hace falta reservarla
        aparte. <Link href="/paseos">Ver los dos paseos</Link>.
      </>
    ),
    enviar: "Reservar el paseo",
  },
  {
    id: "restaurant",
    eyebrow: "En la mesa",
    titulo: "Mesa en el restaurant",
    bajada:
      "Carta que cambia cada semana con lo que da la huerta, de nariz a cola, con platos gluten free y opciones veganas.",
    cuando: "Jueves a domingo · 12 a 16 hs",
    photo: "restaurant/9",
    alt: "Puertas abiertas del restaurant entre la vegetación del parque",
    position: "center 48%",
    detalleTitulo: "Una mesa al ritmo de la huerta.",
    info: [
      { k: "Días", v: "Jueves a domingo" },
      { k: "Horario", v: "12 a 16 hs, última mesa 15 hs" },
      { k: "Mesas", v: "Hasta 10 personas" },
      {
        k: "Grupos grandes",
        v: <Link href="/#eventos">Los organizamos como evento privado</Link>,
      },
      { k: "Dirección", v: DIRECCION },
    ],
    nota: (
      <>
        Contanos si hay restricciones alimentarias en la mesa: la carta cambia todas las semanas y
        con el aviso <strong>la cocina te arma las opciones</strong> antes de que llegues.
      </>
    ),
    enviar: "Reservar la mesa",
  },
];

/**
 * The whole reservations page: two full photo panels working as one selector,
 * and the detail card below that fills in with the hours and the next step of
 * whichever option is picked.
 *
 * The detail card is inserted after mount, so it can't use the `.reveal` hook
 * (SiteAnimations only sweeps the DOM once) — it comes in on its own CSS
 * animation instead.
 */
export function ReservasSelector({
  inicial,
  hoy,
}: {
  inicial?: ReservaTipo;
  /** Fecha de hoy en Los Cardales; la calcula el server para el mínimo del calendario. */
  hoy: string;
}) {
  const [elegida, setElegida] = useState<ReservaTipo | null>(inicial ?? null);
  const detalleRef = useRef<HTMLDivElement>(null);

  const opcion = OPCIONES.find((o) => o.id === elegida);

  const elegir = (id: ReservaTipo) => {
    setElegida(id);
    // after the panel has been painted with the new copy
    requestAnimationFrame(() => {
      if (detalleRef.current) scrollToElement(detalleRef.current);
    });
  };

  return (
    <>
      <section className="reservas" id="reservas">
        <div className="wrap">
          <div className="reservas-head">
            <div>
              <div className="eyebrow reveal">Reservas</div>
              <h1 className="reveal">¿Qué querés reservar?</h1>
            </div>
            <p className="reveal">
              Se puede venir sólo a comer, sólo a caminar el campo, o las dos cosas en la misma
              visita: los dos paseos terminan con la mesa lista. Elegí por dónde empezar.
            </p>
          </div>

          <div className="reserva-cards">
            {OPCIONES.map((o) => (
              <div
                key={o.id}
                className={`reserva-card reveal${elegida === o.id ? " activa" : ""}`}
              >
                <Photo
                  photo={o.photo}
                  alt={o.alt}
                  className="reserva-card-bg"
                  sizes="(max-width: 860px) 92vw, 46vw"
                  scrim
                  position={o.position}
                />
                <div className="reserva-card-body">
                  <div className="eyebrow">{o.eyebrow}</div>
                  <h2>{o.titulo}</h2>
                  <p>{o.bajada}</p>
                  <div className="reserva-card-foot">
                    <span className="reserva-pick" aria-hidden="true">
                      {elegida === o.id ? "Elegido" : "Elegir"}
                      <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                        <path d="M1 5H15M15 5L11 1M15 5L11 9" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                    </span>
                    <span className="reserva-when">{o.cuando}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="reserva-hit"
                  aria-pressed={elegida === o.id}
                  onClick={() => elegir(o.id)}
                >
                  <span className="sr-only">{o.titulo}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="reserva-detalle" id="reserva-detalle" ref={detalleRef}>
        <div className="wrap">
          {opcion ? (
            <div className="reserva-detalle-inner" key={opcion.id}>
              <div>
                <div className="eyebrow">{opcion.titulo}</div>
                <h2 className="section-title">{opcion.detalleTitulo}</h2>
                <p className="reserva-nota">{opcion.nota}</p>
                <ul className="info-list">
                  {opcion.info.map((item) => (
                    <li key={item.k}>
                      <span className="k">{item.k}</span>
                      <span className="v">{item.v}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <ReservaForm tipo={opcion.id} hoy={hoy} enviar={opcion.enviar} />
            </div>
          ) : (
            <p className="reserva-vacio">
              Elegí una de las dos opciones y acá aparecen los horarios y el próximo paso.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
