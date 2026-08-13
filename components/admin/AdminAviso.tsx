/**
 * El cartel del panel para todo lo que no es dato: falta una variable de
 * entorno, la base contestó mal, la lista salió vacía.
 */
export function AdminAviso({
  titulo,
  tono = "neutro",
  children,
}: {
  titulo: string;
  /** `alerta` para lo que hay que ir a arreglar afuera del panel. */
  tono?: "neutro" | "alerta";
  children?: React.ReactNode;
}) {
  return (
    <div className={`admin-aviso admin-aviso-${tono}`} role="status">
      <h3>{titulo}</h3>
      {children ? <div className="admin-aviso-cuerpo">{children}</div> : null}
    </div>
  );
}

/** Lo que se ve cuando el panel no tiene con qué hablarle a la base. */
export function FaltaSecretKey() {
  return (
    <AdminAviso titulo="Falta la secret key de Supabase" tono="alerta">
      <p>
        El panel lee las reservas con <code>SUPABASE_SECRET_KEY</code>, que es la única clave que
        puede ver teléfonos y mails. En local va en <code>.env.local</code>; en Vercel, en las
        environment variables del proyecto.
      </p>
    </AdminAviso>
  );
}
