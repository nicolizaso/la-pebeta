import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SiteAnimations } from "@/components/SiteAnimations";
import { Tienda } from "@/components/tienda/Tienda";
import { WHATSAPP } from "@/lib/contacto";
import { listarCatalogo, type Categoria, type Producto } from "@/lib/db";
import { buscarFoto } from "@/lib/photos";
import type { ProductoVista } from "@/lib/tienda";

export const metadata: Metadata = {
  title: "Tienda — La Pebeta",
  description:
    "El catálogo de la proveeduría de La Pebeta: verduras, frutas, huevos, conservas y plantines de la granja, para encargar y retirar en Los Cardales.",
};

/**
 * La tienda de la proveeduría.
 *
 * Se arma en cada visita en vez de cachearse: lo que se muestra incluye el
 * stock, y un cajón de verdura que ya no está es peor que una página que tarda
 * un pestañeo más.
 */
export const dynamic = "force-dynamic";

/** El catálogo, ordenado como se lee el aside y con la foto ya resuelta. */
function paraLaVista(productos: Producto[], categorias: Categoria[]): ProductoVista[] {
  const orden = new Map(categorias.map((categoria, indice) => [categoria.id, indice]));

  return [...productos]
    .sort((uno, otro) => {
      const lugar = (orden.get(uno.categoria) ?? 99) - (orden.get(otro.categoria) ?? 99);
      return lugar !== 0 ? lugar : uno.nombre.localeCompare(otro.nombre, "es");
    })
    .map((producto) => ({ ...producto, imagen: buscarFoto(producto.foto) }));
}

export default async function TiendaPage() {
  let productos: Producto[] = [];
  let categorias: Categoria[] = [];
  let fallo = false;

  try {
    ({ productos, categorias } = await listarCatalogo());
  } catch (error) {
    console.error("No se pudo leer el catálogo", error);
    fallo = true;
  }

  return (
    <>
      <SiteAnimations />
      <Header />
      <main>
        <section className="tienda-portada">
          <div className="wrap">
            <div className="eyebrow reveal">Proveeduría</div>
            <h1 className="reveal">Llevate el campo a tu cocina.</h1>
            <p className="reveal">
              Lo que se cosecha, se junta y se conserva en la granja, a la venta acá. Se paga
              online y se retira por la proveeduría: te avisamos cuando el pedido está armado.{" "}
              <Link href="/#visita">Cómo llegar</Link>.
            </p>
          </div>
        </section>

        {fallo || productos.length === 0 ? (
          <div className="wrap tienda-caido">
            <h2>{fallo ? "No pudimos abrir el catálogo." : "Todavía no hay nada publicado."}</h2>
            <p>
              {fallo
                ? "La base no contestó. Recargá la página en un rato y, si seguimos así, escribinos y te tomamos el pedido a mano."
                : "Estamos cargando los productos de la semana. Mientras tanto, escribinos y te contamos qué hay."}
            </p>
            <a className="btn primary" href={WHATSAPP} target="_blank" rel="noreferrer">
              Escribinos por WhatsApp
            </a>
          </div>
        ) : (
          <Tienda productos={paraLaVista(productos, categorias)} categorias={categorias} />
        )}
      </main>
      <Footer />
    </>
  );
}
