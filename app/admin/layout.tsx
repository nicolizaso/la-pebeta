import type { Metadata } from "next";
import Link from "next/link";
import { AdminAviso } from "@/components/admin/AdminAviso";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminNav } from "@/components/admin/AdminNav";
import { haySesion, panelAbierto } from "@/lib/admin";
import { salir } from "./acciones";

/**
 * El panel: un aside con las secciones y, al lado, la que esté abierta.
 *
 * No comparte chrome con el sitio —ni Header, ni Footer, ni las animaciones—
 * porque no es una página para visitar sino una herramienta para trabajar.
 */

export const metadata: Metadata = {
  title: "Panel — La Pebeta",
  robots: { index: false, follow: false },
};

// siempre en vivo: acá no se muestra nada cacheado
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await haySesion())) return <AdminLogin />;

  return (
    <div className="admin">
      <aside className="admin-aside">
        <div className="admin-marca">
          <span className="logo">La Pebeta</span>
          <span className="admin-marca-pie">Panel</span>
        </div>

        <AdminNav />

        <div className="admin-aside-pie">
          <Link href="/">Volver al sitio</Link>
          {panelAbierto() ? null : (
            <form action={salir}>
              <button type="submit">Salir</button>
            </form>
          )}
        </div>
      </aside>

      <main className="admin-main">
        {panelAbierto() ? (
          <AdminAviso titulo="El panel está abierto" tono="alerta">
            <p>
              No hay <code>ADMIN_PASSWORD</code> configurada, así que cualquiera que entre a{" "}
              <code>/admin</code> ve las reservas con sus teléfonos y mails. Poné una variable de
              entorno con ese nombre y el panel empieza a pedir clave.
            </p>
          </AdminAviso>
        ) : null}
        {children}
      </main>
    </div>
  );
}
