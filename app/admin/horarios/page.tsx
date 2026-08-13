import { AdminAviso, FaltaSecretKey } from "@/components/admin/AdminAviso";
import { HorariosForm } from "@/components/admin/HorariosForm";
import { listarHorarios, type Horario } from "@/lib/db";
import { AREAS, semanaDe } from "@/lib/horarios";
import { hayClaveDeAdmin } from "@/lib/supabase";

/**
 * Los horarios de atención: la semana de la proveeduría y la del restaurant,
 * cada una con su formulario y su guardado.
 */
export default async function HorariosPage() {
  if (!hayClaveDeAdmin()) return <FaltaSecretKey />;

  let horarios: Horario[];
  try {
    horarios = await listarHorarios();
  } catch (error) {
    console.error("No se pudieron leer los horarios", error);
    return (
      <AdminAviso titulo="No pudimos leer los horarios" tono="alerta">
        <p>La base no contestó. Recargá la página; si sigue igual, revisá las claves de Supabase.</p>
      </AdminAviso>
    );
  }

  return (
    <>
      <header className="admin-head">
        <div className="eyebrow">Horarios</div>
        <h1>Cuándo abrimos</h1>
        <p>
          Un renglón por día. Destildá el día para cerrarlo y usá la nota para lo que no entra en un
          rango, como la última mesa o un feriado.
        </p>
      </header>

      {AREAS.map((area) => (
        <HorariosForm
          key={area.id}
          area={area.id}
          etiqueta={area.etiqueta}
          bajada={area.bajada}
          semana={semanaDe(area.id, horarios)}
        />
      ))}
    </>
  );
}
