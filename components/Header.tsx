import { HeaderNav, type NavLink } from "./HeaderNav";
import type { Seccion } from "@/lib/db";
import { seccionesActivas } from "@/lib/secciones";

/** El menú entero; los dos últimos cuelgan de una sección que se puede apagar. */
const LINKS: (NavLink & { seccion?: Seccion })[] = [
  { href: "/", label: "Inicio" },
  { href: "/restaurant", label: "Restaurant" },
  { href: "/tienda", label: "Tienda", seccion: "tienda" },
  { href: "/blog", label: "Blog", seccion: "blog" },
];

/**
 * El menú del sitio.
 *
 * Tienda y Blog entran sólo si esa sección está prendida en el panel: mientras
 * está apagada no hay puerta al "Próximamente" desde el menú. Se pregunta acá,
 * del lado del server, así el navegador nunca recibe la lista completa ni
 * parpadea al hidratar.
 *
 * Por esta lectura las páginas que muestran el menú se arman en cada visita
 * (`dynamic = "force-dynamic"`): prender la tienda tiene que verse en el menú
 * enseguida, sin esperar un deploy.
 */
export async function Header() {
  const activas = await seccionesActivas();
  const links = LINKS.filter((link) => !link.seccion || activas[link.seccion]).map(
    ({ href, label }) => ({ href, label })
  );

  return <HeaderNav links={links} />;
}
