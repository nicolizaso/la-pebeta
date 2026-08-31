import { Photo } from "./Photo";
import { DIAS_TEXTO, HORA_SALIDA } from "@/lib/experiencias";

export function PaseosHero() {
  return (
    <section className="hero">
      <Photo
        photo="paseos/16"
        alt="Rodeo de vacas Hereford descansando a la sombra de los árboles"
        tag={`${DIAS_TEXTO} — ${HORA_SALIDA} hs`}
        sizes="100vw"
        priority
        scrim
        position="center 55%"
      />
      <div className="hero-inner">
        <div className="stamp">
          <span className="dot"></span> Experiencias · La Pebeta
        </div>
        <h1 className="hero-title">
          <span className="hero-line">
            <span>Caminá el campo</span>
          </span>
          <span className="hero-line">
            <span>
              <em>antes de comer.</em>
            </span>
          </span>
        </h1>
        <p className="hero-sub">
          Dos maneras de recorrer La Pebeta antes del almuerzo: una visita a la huerta, sin cargo, y
          un recorrido productivo por la granja. Las dos con reserva previa, y las dos terminan con
          tu mesa lista.
        </p>
      </div>
      <div className="scroll-cue">
        <div className="bar"></div> Desplazar
      </div>
    </section>
  );
}
