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

- `app/` — layout, páginas (home, `/restaurant` y `/reservas`), el panel
  (`app/admin/`), la API (`app/api/`) y estilos globales.
- `components/` — una pieza por sección, más `Photo` (la primitiva de imagen), `Lightbox` (visor a pantalla completa) y `SiteAnimations`, que centraliza Lenis + GSAP ScrollTrigger. En `components/admin/` van las del panel.
- `lib/` — `photos.ts` y el manifiesto generado de imágenes, `db.ts` (los tipos
  y el acceso a la base), `supabase.ts` (la conexión), `reservas.ts` y
  `horarios.ts` (las reglas de cada uno), `admin.ts` (la puerta del panel),
  `fechas.ts`, `contacto.ts` y `smooth-scroll.ts` (el puente para mover la
  página a través de Lenis).
- `assets/imgs/` — originales de cámara, ordenados por área. No se sirven: son el archivo del que sale `public/imgs/`.
- `public/imgs/` — versiones web (WebP redimensionado) generadas por el script.
- `reference/` — prototipo HTML original usado como base del diseño.

## Datos

Los datos viven en Postgres, en Supabase. Son cuatro tablas:

| Tabla | Qué guarda |
| --- | --- |
| `pebeta_reservas` | Pedidos de paseo y de mesa, con `estado` (`pendiente` / `confirmada` / `cancelada`) y un `codigo` corto para dictar por teléfono. |
| `pebeta_productos` | El catálogo de la proveeduría. |
| `pebeta_compras` | Las compras de la tienda, con sus ítems y el total. |
| `pebeta_horarios` | Los horarios de atención: una fila por área (`proveeduria` / `restaurant`) y día de la semana. |

Van con prefijo porque, por ahora, comparten proyecto de Supabase con otra app.
Cuando La Pebeta tenga el suyo, se cambian el prefijo y las variables de
entorno y no hay nada más que tocar: `lib/db.ts` es el único módulo que habla
con la base, y de ahí salen los tipos y las funciones que usan la API, el
formulario y el panel.

### Configuración

```bash
SUPABASE_URL=https://<proyecto>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
SUPABASE_SECRET_KEY=sb_secret_…        # sólo la usa /admin
ADMIN_PASSWORD=…                       # la clave del panel
```

En local van en `.env.local`; en Vercel, en las environment variables del
proyecto. La publishable key es pública a propósito: lo que se puede hacer con
ella lo decide RLS, y es dejar una reserva —que entra siempre como
`pendiente`—, leer el catálogo publicado y leer los horarios. Listar reservas,
confirmarlas, cancelarlas y cargar horarios necesita la secret key, que sólo se
usa del lado del server y sólo desde el panel.

Las reglas del negocio están dos veces a propósito: en `lib/reservas.ts`, que
es lo que valida la API, y como constraints de la tabla (jueves a domingo,
hasta 15 personas por paseo y 10 por mesa), para que no entre nada raro ni
siquiera escribiendo contra la base de forma directa.

### Reservas

`POST /api/reservas` valida, agrega la fila y devuelve la reserva con su
código. El formulario de `/reservas` es el que lo llama, tanto para paseos como
para mesas. No hay GET: el listado tiene teléfonos y mails, así que sale por el
panel, que lee del lado del server con la secret key.

## Panel

`/admin` —se entra por el botón del pie del sitio— es la parte de adentro. Un
aside con las secciones y, al lado, la que esté abierta:

| Sección | Qué hace |
| --- | --- |
| Resumen | Lo que hay tomado de hoy en adelante: pendientes, reservas del día, personas anotadas. |
| Reservas | Paseos y mesas en la misma tabla, con filtros por qué, cuándo y estado, y los botones para confirmar, cancelar o reabrir. |
| Horarios | La semana de la proveeduría y la del restaurant, siete renglones cada una, con su nota por día. |

La puerta es una clave en `ADMIN_PASSWORD` y una cookie httpOnly con su hash:
alcanza para que las reservas no queden a la vista en una URL adivinable, y el
día que entren varias personas se cambia por auth de verdad sin tocar las
páginas, que preguntan todas por `haySesion()` de `lib/admin.ts`. Sin esa
variable el panel queda abierto y lo avisa en pantalla.

Las escrituras son server actions (`app/admin/acciones.ts`), y cada una vuelve
a preguntar por la sesión: una action es un endpoint más, y que la página se
haya renderizado no alcanza como permiso.

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
