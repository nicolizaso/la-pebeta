import { Photo } from "./Photo";
import { CARTA } from "@/lib/casa";

export function CartaFeatures() {
  return (
    <section className="process" id="carta">
      <div className="wrap">
        <div className="eyebrow">Nuestra carta</div>
        <div className="process-track">
          <div className="process-line"></div>
          {CARTA.map((f) => (
            <div className="stage reveal" key={f.num}>
              <div className="num">{f.num}</div>
              <Photo
                photo={f.photo}
                alt={f.alt}
                className="stage-photo"
                sizes="(max-width: 860px) 44vw, 22vw"
                reveal
              />
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
