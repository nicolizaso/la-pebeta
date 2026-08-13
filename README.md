# La Pebeta

Home de La Pebeta — restaurant, granja agroecológica y proveeduría en Los Cardales, Buenos Aires.

## Stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [GSAP](https://gsap.com/) + ScrollTrigger
- [Lenis](https://lenis.darkroom.engineering/) para smooth scroll

## Desarrollo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Estructura

- `app/` — layout, páginas (home, `/restaurant` y `/reservas`), la API (`app/api/`) y estilos globales.
- `components/` — una pieza por sección, más `Photo` (la primitiva de imagen), `Lightbox` (visor a pantalla completa) y `SiteAnimations`, que centraliza Lenis + GSAP ScrollTrigger.
- `lib/` — `photos.ts` y el manifiesto generado de imágenes, `db.ts` (la base de
  datos JSON), `reservas.ts` (las reglas de una reserva), `contacto.ts` y
  `smooth-scroll.ts` (el puente para mover la página a través de Lenis).
- `data/` — `db.json`, la base de datos de prueba.
- `assets/imgs/` — originales de cámara, ordenados por área. No se sirven: son el archivo del que sale `public/imgs/`.
- `public/imgs/` — versiones web (WebP redimensionado) generadas por el script.
- `reference/` — prototipo HTML original usado como base del diseño.

## Datos

Mientras esto es una versión de prueba, todo vive en un solo archivo,
`data/db.json`, con tres colecciones:

| Colección | Qué guarda |
| --- | --- |
| `reservas` | Pedidos de paseo y de mesa, con `estado` (`pendiente` / `confirmada` / `cancelada`) y un `codigo` corto para dictar por teléfono. |
| `productos` | El catálogo de la proveeduría. |
| `compras` | Las compras de la tienda, con sus ítems y el total. |

`lib/db.ts` es el único que toca el archivo: expone los tipos, `leerDB()` y
`actualizarDB()`, que lee, deja modificar las colecciones y vuelve a escribir.
Las escrituras se encadenan en una cola y se guardan a un temporal que después
se renombra, así dos reservas simultáneas no se pisan ni dejan el JSON a medio
escribir. Es también el archivo al que apunta el ABM de admin, y el único que
hay que reescribir el día que esto pase a una base de verdad.

Dos límites de esta versión, a tener presentes:

- **Necesita disco propio.** En un deploy serverless (Vercel) el filesystem es
  de sólo lectura, y aunque no lo fuera cada instancia tendría su copia.
- **No hay auth.** Por eso `POST /api/reservas` sólo escribe: no existe un GET
  público de las colecciones, que expondría teléfonos y mails. El listado sale
  por el ABM cuando tenga login.

### Reservas

`POST /api/reservas` valida contra las reglas de `lib/reservas.ts` (jueves a
domingo, horarios de cada tipo, hasta 15 personas por paseo y 10 por mesa) y
agrega un objeto nuevo a `reservas`. El formulario de `/reservas` es el que lo
llama, tanto para paseos como para mesas.

## Imágenes

Los originales pesan entre 2 y 30 MB cada uno, así que no se publican tal cual.
`scripts/optimize-images.py` los redimensiona a WebP, los escribe en
`public/imgs/<área>/` y genera `lib/photo-manifest.generated.ts` con las
dimensiones y un placeholder borroso inline de cada foto.

```bash
pip install pillow
python3 scripts/optimize-images.py
```

Hay que correrlo cada vez que cambie `assets/imgs/`, y commitear tanto
`public/imgs/` como el manifiesto generado.

En el código las fotos se referencian por clave (`"huerta/17"`,
`"restaurant/9"`), que TypeScript valida contra el manifiesto:

```tsx
<Photo photo="granja/7" alt="…" tag="Huerta" reveal parallax lightbox />
```

## Animaciones

`SiteAnimations` lee atributos del markup, así que las secciones no manejan
GSAP por su cuenta:

| Hook | Efecto |
| --- | --- |
| `.reveal` | aparece con fade + subida |
| `[data-split]` | título que se revela palabra por palabra detrás de una máscara |
| `[data-reveal-img]` | foto descubierta por un telón, con la imagen saliendo de un zoom |
| `[data-parallax]` | deriva lenta de la foto contra el scroll |
| `[data-count]` | número que cuenta hasta su valor |
| `[data-marquee]` | banda de fotos en loop continuo, acelerada por la velocidad del scroll |
| `[data-hscroll]` | sección fija mientras su filmstrip se desplaza en horizontal |
| `[data-stagger]` | grilla cuyos hijos entran en cascada |

Con `prefers-reduced-motion` no se anima nada: todo queda visible y las bandas
horizontales pasan a ser filas con scroll normal.

## Build

```bash
npm run build
npm run start
```
