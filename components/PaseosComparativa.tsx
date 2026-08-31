import { WHATSAPP } from "@/lib/contacto";
import { COMPARATIVA, PASEOS, RECOMENDACIONES } from "@/lib/paseos";

const [HUERTA, GRANJA] = PASEOS;

/**
 * Los dos paseos enfrentados, renglón por renglón, para elegir de una
 * sola lectura. En pantallas chicas la tabla no se achica: cada renglón pasa a
 * ser una tarjeta con los dos valores uno debajo del otro, que es lo único que
 * se lee bien en un teléfono.
 */
export function PaseosComparativa() {
  return (
    <section className="comparativa" id="comparar">
      <div className="wrap">
        <div className="eyebrow reveal">Para elegir</div>
        <h2 className="section-title reveal" data-split>
          Los dos, uno al lado del otro.
        </h2>

        <table className="comparativa-tabla reveal">
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">Qué</span>
              </th>
              <th scope="col">
                {HUERTA.nombre}
                <em>{HUERTA.modalidad}</em>
              </th>
              <th scope="col">
                {GRANJA.nombre}
                <em>{GRANJA.modalidad}</em>
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARATIVA.map((fila) => (
              <tr key={fila.k}>
                <th scope="row">{fila.k}</th>
                <td data-de={HUERTA.nombre}>{fila.huerta}</td>
                <td data-de={GRANJA.nombre}>{fila.granja}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="comparativa-pie">
          <div className="recos reveal">
            <h3>Qué traer</h3>
            <ul>
              {RECOMENDACIONES.map((reco) => (
                <li key={reco.titulo}>
                  <strong>{reco.titulo}</strong>
                  <span>{reco.texto}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="comparativa-nota reveal">
            Si el día que querés venir no figura, o van más personas de las que entran en un
            recorrido,{" "}
            <a href={WHATSAPP} target="_blank" rel="noreferrer">
              escribinos por WhatsApp
            </a>{" "}
            y lo vemos.
          </p>
        </div>
      </div>
    </section>
  );
}
