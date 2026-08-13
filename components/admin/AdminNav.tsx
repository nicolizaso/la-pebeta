"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * El índice del panel. Vive en el aside y marca en cuál sección estás, que es
 * lo único para lo que necesita ser un componente de cliente.
 */

const SECCIONES = [
  { href: "/admin", etiqueta: "Resumen", detalle: "Lo que viene" },
  { href: "/admin/reservas", etiqueta: "Reservas", detalle: "Paseos y mesas" },
  { href: "/admin/horarios", etiqueta: "Horarios", detalle: "Proveeduría y restaurant" },
];

export function AdminNav() {
  const ruta = usePathname();

  return (
    <nav className="admin-nav">
      {SECCIONES.map((seccion) => {
        // "/admin" es el resumen, no el prefijo de todo el panel
        const activa =
          seccion.href === "/admin" ? ruta === "/admin" : ruta.startsWith(seccion.href);

        return (
          <Link
            key={seccion.href}
            href={seccion.href}
            className={`admin-nav-btn${activa ? " activa" : ""}`}
            aria-current={activa ? "page" : undefined}
          >
            <span className="admin-nav-etiqueta">{seccion.etiqueta}</span>
            <span className="admin-nav-detalle">{seccion.detalle}</span>
          </Link>
        );
      })}
    </nav>
  );
}
