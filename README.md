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

- `app/` — layout, páginas (home, `/restaurant`, `/reservas`, `/tienda` y
  `/blog`), el panel (`app/admin/`), la API (`app/api/`) y estilos globales.
- `components/` — una pieza por sección, más `Photo` (la primitiva de imagen), `Lightbox` (visor a pantalla completa) y `SiteAnimations`, que centraliza Lenis + GSAP ScrollTrigger. En `components/admin/` van las del panel, en `components/tienda/` las del catálogo y el carrito y en `components/blog/` las de las notas.
- `lib/` — `photos.ts` y el manifiesto generado de imágenes, `db.ts` (los tipos
  y el acceso a la base), `supabase.ts` (la conexión), `reservas.ts`,
  `horarios.ts`, `tienda.ts`, `productos.ts` y `blog.ts` (las reglas de cada
  uno), `admin.ts` (la puerta del panel), `fechas.ts`, `contacto.ts` y
  `smooth-scroll.ts` (el puente para mover la página a través de Lenis).
- `assets/imgs/` — originales de cámara, ordenados por área. No se sirven: son el archivo del que sale `public/imgs/`.
- `public/imgs/` — versiones web (WebP redimensionado) generadas por el script.
- `reference/` — prototipo HTML original usado como base del diseño.

## Datos

Los datos viven en Postgres, en Supabase. Son seis tablas:

| Tabla | Qué guarda |
| --- | --- |
| `pebeta_reservas` | Pedidos de paseo y de mesa, con `estado` (`pendiente` / `confirmada` / `cancelada`) y un `codigo` corto para dictar por teléfono. |
| `pebeta_productos` | El catálogo de la proveeduría: precio, unidad, stock, su categoría y la clave de su foto en el manifiesto. |
| `pebeta_categorias` | Los cajones del catálogo, con el orden en que se listan. No hay una lista fija en el código: se cargan desde el panel y el `id` sale del nombre (`quesos-de-tambo`). |
| `pebeta_compras` | Las compras de la tienda, con sus ítems, el total y el `estado` (`pagada` / `entregada` / `cancelada`). |
| `pebeta_horarios` | Los horarios de atención: una fila por área (`proveeduria` / `restaurant`) y día de la semana. |
| `pebeta_notas` | Las notas del blog: título, `slug` (la URL), bajada, cuerpo, firma, foto, `publicada` y `fecha`, que es cuándo sale y la que lleva la nota. |

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
`pendiente`—, dejar una compra —que entra siempre como `pagada` y con al menos
un ítem—, leer el catálogo publicado con sus categorías, leer los horarios y
leer las notas del blog que ya salieron. Listar reservas y compras,
confirmarlas, cancelarlas, marcarlas entregadas, cargar horarios y ver un
borrador o una nota programada necesita la secret key, que sólo se usa del lado
del server y sólo desde el panel.

Las reglas del negocio están dos veces a propósito: en `lib/reservas.ts` y
`lib/tienda.ts`, que es lo que valida la API, y como constraints de la tabla
(jueves a domingo, hasta 15 personas por paseo y 10 por mesa, entre 1 y 40
renglones por compra), para que no entre nada raro ni siquiera escribiendo
contra la base de forma directa.

### Reservas

`POST /api/reservas` valida, agrega la fila y devuelve la reserva con su
código. El formulario de `/reservas` es el que lo llama, tanto para paseos como
para mesas. No hay GET: el listado tiene teléfonos y mails, así que sale por el
panel, que lee del lado del server con la secret key.

## Tienda

`/tienda` es el catálogo de la proveeduría: un aside con buscador, categorías,
precio máximo y un filtro de stock, y al lado la grilla. El catálogo entero
—unas decenas de productos— viaja una vez y el recorte se hace en el navegador,
así que buscar y filtrar no vuelve al server. La página no se cachea: lo que
muestra incluye el stock.

Las categorías del aside son las filas de `pebeta_categorias` que tienen algo
adentro: una que se crea en el panel aparece en cuanto se le publica el primer
producto, y una vacía no ocupa un renglón que siempre saldría en cero. Como los
productos cuelgan de su categoría, esconder una en el panel saca del catálogo
todo lo que tiene adentro —también de `POST /api/compras`, que valida contra el
mismo catálogo—, y volver a mostrarla lo trae entero, sin haber tocado producto
por producto.

El carrito vive en `localStorage` (no hay cuentas), y al releerlo se contrasta
contra el catálogo del día: si un producto ya no está o bajó el stock, la
cantidad se recorta en vez de romper el pedido.

`POST /api/compras` cierra la compra. Lo que viaja son ids y cantidades: los
nombres, los precios y el total se recalculan en el server contra
`pebeta_productos` y quedan copiados en la fila, para que el ticket no cambie
si después se toca el catálogo.

**El pago es ficticio y lo dice en pantalla.** No hay pasarela ni cobro: con
los cuatro campos de la tarjeta vacíos la compra se cierra igual, que es la
idea para poder probar el circuito de punta a punta. Lo que sí se revisa es lo
que se haya escrito —Luhn sobre el número, `MM/AA` sin vencer, código de 3 o 4
dígitos—, así el formulario se comporta como uno de verdad cuando alguien carga
datos. Nada de la tarjeta se guarda ni sale del request: `pebeta_compras` tiene
quién compró, qué se lleva y cuánto, y nada más.

## Blog

`/blog` es lo que se cuenta de la casa: un listado con la última nota abierta
arriba y las anteriores en grilla, y `/blog/<slug>` la nota entera. El texto se
escribe en un textarea, no en un editor: un renglón en blanco separa párrafos,
`##` al principio hace un subtítulo y `>` una cita. Es todo lo que hay, y es
suficiente para el tipo de nota que se publica acá.

**Una nota se puede dejar cargada con fecha de más adelante y sale sola ese
día.** No hay cron, ni cola, ni un deploy que la traiga: `pebeta_notas` guarda
`publicada` y `fecha`, y "está a la vista" es `publicada and fecha <= now()`.
Esa condición está dos veces, como las reglas de las reservas y las de la
tienda: en la consulta de `lib/db.ts` y como policy de la tabla, así una nota
programada no se puede leer ni escribiendo contra la base de forma directa. Del
cruce salen los tres estados que muestra el panel: borrador (sin publicar),
programada (publicada, con la fecha por venir) y publicada.

Por eso ni el listado ni la nota se cachean, igual que la tienda: lo que se
muestra depende de la hora en que alguien entra. La `fecha` hace las dos cosas
—cuándo sale y qué fecha lleva la nota—, y se carga en hora de Los Cardales:
el `datetime-local` del formulario no manda zona, así que la resuelve
`lib/fechas.ts` y no el reloj del server, que en Vercel está en UTC.

## Panel

`/admin` —se entra por el botón del pie del sitio— es la parte de adentro. Un
aside con las secciones y, al lado, la que esté abierta:

| Sección | Qué hace |
| --- | --- |
| Resumen | Lo que hay tomado de hoy en adelante —pendientes, reservas del día, personas anotadas— más lo vendido en la tienda en los últimos 30 días y los pedidos que faltan entregar. |
| Reservas | Paseos y mesas en la misma tabla, con filtros por qué, cuándo y estado, y los botones para confirmar, cancelar o reabrir. |
| Compras | Los pedidos de la tienda, lo último primero, con el detalle de cada uno y su total. Entran `pagada`: se marcan entregadas cuando la persona pasó a retirar, o canceladas si no pasó. |
| Productos | El catálogo entero, publicado o no, con filtros por categoría, estado y buscador. Se carga, se edita, se publica, se esconde y se borra. |
| Categorías | Los cajones de la tienda: nombre, bajada, orden y si están a la vista. Se puede crear una sin pasar por acá, desde el select del formulario de un producto. |
| Blog | Las notas: se escriben, se guardan de borrador, se publican, se sacan y se borran, con filtros por estado y buscador. Una nota con fecha de más adelante queda programada y sale sola ese día. |
| Horarios | La semana de la proveeduría y la del restaurant, siete renglones cada una, con su nota por día. |

Cargar un producto en una categoría que todavía no existe no obliga a ir a
crearla antes: la última opción del select es inventarla, el nombre se escribe
ahí mismo y la categoría la da de alta la misma action que guarda el producto,
con el `id` que sale de ese nombre. Desde ese momento está en el aside de la
tienda, en los filtros del panel y en el select del próximo producto. Si ya
había una que se guardaba con el mismo `id`, se usa esa en vez de duplicarla.

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
