# La Pebeta

Home de La Pebeta — restaurant, granja agroecológica y proveeduría en Los Cardales, Buenos Aires.

## Stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [GSAP](https://gsap.com/) + ScrollTrigger
- [Lenis](https://lenis.darkroom.engineering/) para smooth scroll
- [Supabase](https://supabase.com/) (Postgres + Storage)
- [SDK de Anthropic](https://github.com/anthropics/anthropic-sdk-typescript) para el chat

## Desarrollo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Estructura

- `app/` — layout, páginas (home, `/restaurant`, `/reservas`, `/tienda`,
  `/blog` y `/perfil`), el panel (`app/admin/`), la API (`app/api/`) y estilos
  globales.
- `components/` — una pieza por sección, más `Photo` (la primitiva de imagen), `Lightbox` (visor a pantalla completa) y `SiteAnimations`, que centraliza Lenis + GSAP ScrollTrigger. En `components/admin/` van las del panel, en `components/tienda/` las del catálogo y el carrito, en `components/blog/` las de las notas y en `components/chat/` la burbuja del asistente.
- `lib/` — `photos.ts` y el manifiesto generado de imágenes, `db.ts` (los tipos
  y el acceso a la base), `supabase.ts` (la conexión), `subidas.ts` (las fotos
  que se suben desde el panel), `reservas.ts`, `paseos.ts` (los dos paseos,
  con sus días, su duración y su costo), `horarios.ts`, `tienda.ts`,
  `productos.ts` y `blog.ts` (las reglas de cada uno), `secciones.ts` (qué
  secciones del sitio están abiertas), `casa.ts` (dónde queda y qué es, para
  las secciones que lo muestran y para el asistente), `consultas.ts` y
  `asistente.ts` (las reglas del chat y el prompt del modelo), `admin.ts` (la
  puerta del panel),
  `sesion.ts` y `usuarios.ts` (las cuentas de quienes reservan: la cookie
  firmada y las contraseñas), `fechas.ts`, `contacto.ts` y `smooth-scroll.ts`
  (el puente para mover la página a través de Lenis).
- `assets/imgs/` — originales de cámara, ordenados por área. No se sirven: son el archivo del que sale `public/imgs/`.
- `public/imgs/` — versiones web (WebP redimensionado) generadas por el script.
- `supabase/migrations/` — el esquema de la base, en SQL y en orden.
- `reference/` — prototipo HTML original usado como base del diseño.

## Datos

Los datos viven en Postgres, en Supabase. Son nueve tablas:

| Tabla | Qué guarda |
| --- | --- |
| `reservas` | Pedidos de paseo y de mesa, con `estado` (`pendiente` / `confirmada` / `cancelada`), un `codigo` corto para dictar por teléfono, el `usuario_id` de quien la tomó y, en los paseos, `paseo`: cuál de los dos. |
| `usuarios` | Las cuentas. Nadie se registra: nacen solas con la primera reserva o compra, y el mail es la llave. `password_hash` está vacío hasta que esa persona se pone una contraseña desde su perfil. |
| `productos` | El catálogo de la proveeduría: precio, unidad, stock, su categoría y la clave de su foto en el manifiesto. |
| `categorias` | Los cajones del catálogo, con el orden en que se listan. No hay una lista fija en el código: se cargan desde el panel y el `id` sale del nombre (`quesos-de-tambo`). |
| `compras` | Las compras de la tienda, con sus ítems, el total, el `estado` (`pagada` / `entregada` / `cancelada`) y el `usuario_id` de quien compró. |
| `horarios` | Los horarios de atención: una fila por área (`proveeduria` / `restaurant`) y día de la semana. |
| `notas` | Las notas del blog: título, `slug` (la URL), bajada, cuerpo, firma, `etiquetas`, foto, `publicada` y `fecha`, que es cuándo sale y la que lleva la nota. |
| `secciones` | Una fila por sección que se puede apagar (`tienda`, `blog`) con su `activa`. Es lo que mira el menú antes de mostrar un link y cada página antes de mostrarse. |
| `consultas` | Una fila por conversación del chat: el `hilo` entero, desde qué página se abrió, el `estado` (`abierta` / `derivada` / `resuelta`), la `propuesta` de reserva que todavía nadie confirmó y el hash de la IP con el que se cuenta el límite por hora. No tiene ninguna policy: se lee y se escribe sólo con la secret key. |

Hay además un bucket de Storage, `blog`, con las fotos que se suben desde el
panel para una nota. Es público —lo que guarda se ve en el blog— y acepta hasta
5 MB por imagen, en JPG, PNG, WebP o AVIF. Escribir en él necesita
la secret key, así que sólo puede hacerlo el panel.

El esquema está en `supabase/migrations/`, y es la fuente de verdad: las tablas
no se crean a mano desde el dashboard. `lib/db.ts` es el único módulo que habla
con la base, y de ahí salen los tipos y las funciones que usan la API, el
formulario y el panel.

### Configuración

```bash
SUPABASE_URL=https://<proyecto>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
SUPABASE_SECRET_KEY=sb_secret_…        # el panel, el alta de reservas y el perfil
ADMIN_PASSWORD=…                       # la clave del panel
SESION_SECRET=…                        # firma las sesiones de /perfil
ANTHROPIC_API_KEY=sk-ant-…             # el asistente del chat
```

En local van en `.env.local`; en Vercel, en las environment variables del
proyecto. La publishable key es pública a propósito: lo que se puede hacer con
ella lo decide RLS, y es leer el catálogo publicado con sus categorías, leer
los horarios, leer las notas del blog que ya salieron y leer qué secciones del
sitio están abiertas. Todo lo demás va con la secret key, siempre del lado del
server: listar reservas y compras,
confirmarlas, cancelarlas, marcarlas entregadas, cargar horarios, subir una
foto, ver un borrador o una nota programada, y —desde que las reservas tienen
dueño— darlas de alta, porque la reserva y la cuenta de quien reserva se
guardan en el mismo movimiento. Las policies de alta pública de `reservas` y
`compras` siguen en la base, pero el sitio ya no las usa.

`ANTHROPIC_API_KEY` es la del chat. Sin ella el widget no se monta y `/api/chat`
contesta 503: el sitio funciona entero, sin burbuja. Es lo que corresponde para
una clave que se paga por uso —ver [El chat](#el-chat)—.

`SESION_SECRET` firma la cookie del perfil. Sin ella el server firma con un
secreto al azar que dura lo que dura el proceso: en local se entra igual y lo
único que pasa es que un `next dev` que se reinicia pide volver a entrar, pero
en producción hay que ponerla —si no, cada instancia firma distinto y las
sesiones se caen solas—. El perfil lo avisa en pantalla cuando falta.

Las reglas del negocio están dos veces a propósito: en `lib/reservas.ts` y
`lib/tienda.ts`, que es lo que valida la API, y como constraints de la tabla
(los paseos del campo viernes, sábados y domingos y el restaurant de
jueves a domingo, hasta 15 personas por paseo y 10 por mesa, entre 1 y 40
renglones por compra), para que no entre nada raro ni siquiera escribiendo
contra la base de forma directa.

### Reservas

`POST /api/reservas` valida, agrega la fila y devuelve la reserva con su
código. El formulario de `/reservas` es el que lo llama, tanto para paseos como
para mesas. No hay GET: el listado tiene teléfonos y mails, así que sale por el
panel, que lee del lado del server con la secret key.

Un paseo lleva además cuál de los dos es —`huerta` o `granja`—, que el
formulario pregunta en su primer campo y muestra ahí mismo cuánto dura y cuánto
sale el elegido. Los dos paseos y sus datos están en `lib/paseos.ts`, que es de
donde salen también la página de `/paseos` y la banda de la home, para que no se
contradigan entre pantallas. Una mesa no lleva ninguno, y los paseos anteriores
a que se pudiera elegir tampoco: esos se listan con la etiqueta genérica y lo
que se quería está en el comentario.

El mail dejó de ser opcional: es con lo que se arma la cuenta. En el mismo POST
se busca o se crea el usuario de ese mail y la reserva nace con su `usuario_id`
—ver [Cuentas y perfil](#cuentas-y-perfil)—. Si el alta de la cuenta falla, la
reserva se guarda igual, sin dueño: primero está atender a quien reserva.

## Tienda

`/tienda` es el catálogo de la proveeduría: un aside con buscador, categorías,
precio máximo y un filtro de stock, y al lado la grilla. El catálogo entero
—unas decenas de productos— viaja una vez y el recorte se hace en el navegador,
así que buscar y filtrar no vuelve al server. La página no se cachea: lo que
muestra incluye el stock.

Las categorías del aside son las filas de `categorias` que tienen algo adentro:
una que se crea en el panel aparece en cuanto se le publica el primer producto,
y una vacía no ocupa un renglón que siempre saldría en cero. Como los
productos cuelgan de su categoría, esconder una en el panel saca del catálogo
todo lo que tiene adentro —también de `POST /api/compras`, que valida contra el
mismo catálogo—, y volver a mostrarla lo trae entero, sin haber tocado producto
por producto.

El carrito vive en `localStorage` (no hay cuentas), y al releerlo se contrasta
contra el catálogo del día: si un producto ya no está o bajó el stock, la
cantidad se recorta en vez de romper el pedido.

`POST /api/compras` cierra la compra. Lo que viaja son ids y cantidades: los
nombres, los precios y el total se recalculan en el server contra `productos` y
quedan copiados en la fila, para que el ticket no cambie si después se toca el
catálogo.

**El pago es ficticio y lo dice en pantalla.** No hay pasarela ni cobro: con
los cuatro campos de la tarjeta vacíos la compra se cierra igual, que es la
idea para poder probar el circuito de punta a punta. Lo que sí se revisa es lo
que se haya escrito —Luhn sobre el número, `MM/AA` sin vencer, código de 3 o 4
dígitos—, así el formulario se comporta como uno de verdad cuando alguien carga
datos. Nada de la tarjeta se guarda ni sale del request: `compras` tiene quién
compró, qué se lleva y cuánto, y nada más.

## Blog

`/blog` es lo que se cuenta de la casa: un listado con la última nota abierta
arriba y las anteriores en grilla, y `/blog/<slug>` la nota entera. El texto se
escribe en un textarea, no en un editor: un renglón en blanco separa párrafos,
`##` al principio hace un subtítulo, `-` una lista, `1.` una lista numerada y
`>` una cita. Es todo lo que hay, y alcanza para una receta con sus
ingredientes o para una nota de la huerta.

Cada nota lleva etiquetas. La primera es la sección en la que va —"La Pebeta en
tu casa", "Huerta en tu casa", "En La Pebeta"— y las demás son sus temas; no
hay una lista fija en el código, se escriben en el panel y el blog arma sus
filtros con las que existan, igual que la tienda con sus categorías. Se filtra
por cualquiera de ellas en `/blog?etiqueta=huerta-en-tu-casa`.

La dirección de una nota no se escribe: sale del título. Mientras es borrador
la sigue —cambiarle el título le cambia la URL, que todavía no tiene nadie— y
desde que se publicó queda quieta, porque a partir de ahí es un link que puede
estar guardado en cualquier lado. Dos títulos iguales tampoco se pisan: el
segundo queda en `-2`.

La foto puede salir de dos lados: de las fotos del sitio —las de
`public/imgs/`, que en el panel se eligen de una galería— o del dispositivo de
quien escribe, que es lo más común cuando la foto se sacó esa misma mañana.
Esas van al bucket de Supabase y la nota se guarda con su URL.

**Una nota se puede dejar cargada con fecha de más adelante y sale sola ese
día.** No hay cron, ni cola, ni un deploy que la traiga: `notas` guarda
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

## Tienda y blog: prendidas o apagadas

La tienda y el blog se pueden apagar, y **salieron a producción apagados**: la
casa los prende desde el panel cuando el catálogo y las primeras notas estén
listos. Es una fila por sección en `secciones` y un interruptor arriba de
Productos —"Activar tienda"— y de Blog —"Activar blog"—. Tocarlo no lo cambia:
salta un recuadro que dice qué va a pasar y hay que confirmarlo, porque
prender la tienda la pone a la venta para cualquiera que entre.

Con una sección apagada:

- su link no está en el menú, y la home tampoco ofrece "Ver la tienda";
- su dirección (`/tienda`, `/blog`, `/blog/<slug>`) muestra una pantalla de
  **Próximamente** —con el menú, el pie y WhatsApp— en vez de un 404: la página
  existe, todavía no abrió, y se pide que no se indexe mientras tanto;
- `POST /api/compras` no cierra ninguna compra y contesta 503. La puerta está
  también en la API porque una URL no deja de existir porque la vista se haya
  escondido.

Lo que se carga en el panel se sigue cargando igual: apagar no esconde
productos ni despublica notas, cierra la puerta de calle. Prender de vuelta
trae todo como estaba.

Si la base no contesta —o si todavía no corrió la migración que crea la
tabla— las secciones cuentan como apagadas: cerrado de más es una página que
dice "Próximamente"; abierto de más es una tienda a la venta sin que nadie la
haya prendido. Por esta consulta las páginas que muestran el menú se arman en
cada visita, así prender la tienda se ve enseguida y no en el próximo deploy.

## Cuentas y perfil

Nadie se registra en este sitio: se reserva. Con el mail de esa reserva queda
hecha la cuenta, y desde `/perfil` esa persona ve lo que pidió, lo que compró y
puede corregir sus datos o soltar una reserva.

La cuenta nace **sin contraseña**, y mientras siga así se entra con sólo
escribir el mail. Es a propósito: es la única forma de que alguien que acaba de
reservar entre a ver su reserva sin inventar nada. Tiene el costo evidente
—quien escriba un mail ajeno ve esas reservas— y por eso el perfil ofrece
ponerse una contraseña, que es lo que cierra esa puerta cuenta por cuenta:

- **Al reservar o comprar**, si la cuenta no tiene contraseña, la sesión queda
  abierta sola y la pantalla de "listo" lleva al perfil.
- **Si ya tiene contraseña**, la reserva se toma igual pero la sesión no se
  abre: se entra por `/perfil`, con la contraseña. Si no fuera así, alcanzaría
  con cargar una reserva para saltearla.
- **En `/perfil` sin sesión** se escribe el mail; la contraseña se pide sólo si
  esa cuenta tiene una.
- **Poner o cambiar la contraseña** le sube el `sesion_epoch` a la fila, y con
  eso caducan todas las sesiones abiertas menos la que la está poniendo. Es lo
  que echa a quien hubiera entrado antes con sólo el mail.
- **Si se la olvida** no hay mail de reseteo, porque el sitio no manda mails:
  esa persona llama, y desde el panel (sección Cuentas) se le borra la
  contraseña. Su cuenta vuelve a entrar con el mail, como el día que nació.

No usa Supabase Auth a propósito. Todo el acceso a los datos del sitio ya pasa
por el server con la secret key, así que una tabla propia y una cookie firmada
alcanzan, sin traer el cliente de auth al navegador ni reescribir las policies
con `auth.uid()`. La sesión es una cookie httpOnly `pebeta_usuario` con el id
del usuario, el epoch y una firma HMAC (`lib/sesion.ts`), y las contraseñas se
guardan con scrypt, sal propia por cuenta (`lib/usuarios.ts`). La acompaña una
segunda cookie, `pebeta_sesion`, que no está firmada y no dice quién es nadie:
existe sólo para que la barra de navegación muestre "Mi perfil" sin que las
páginas del sitio tengan que leer cookies del lado del server: el menú se arma
igual para todo el mundo —lo único que mira es qué secciones están abiertas— y
lo que cambia por visitante se resuelve en el navegador.

El perfil lee con la secret key filtrando por la cuenta de la sesión —
`reservas` y `compras` no tienen policy de lectura y no la van a tener— y cada
server action vuelve a preguntar quién es: el id de una reserva nunca alcanza
para tocarla, se busca por reserva *y* por cuenta. Cancelar se puede hasta
24 horas antes (`HORAS_PARA_CANCELAR` en `lib/reservas.ts`); más cerca de la
fecha, la pantalla manda a WhatsApp.

## El chat

Abajo a la derecha, en todas las páginas del sitio, hay una burbuja que contesta
consultas: horarios, cómo llegar, qué hay en la proveeduría, qué paseo conviene
—y, si quien pregunta ya sabe lo que quiere, le toma la reserva ahí mismo—. Del
otro lado hay un modelo de Anthropic (`claude-opus-5`, vía `@anthropic-ai/sdk`).

**No hay una base de conocimiento nueva.** Casi todo lo que alguien pregunta ya
vive en alguna tabla —los horarios, el catálogo con sus precios y su stock, las
notas del blog— o en `lib/casa.ts`, así que el asistente no sale a buscar nada:
recibe el estado de la casa escrito adelante en el system prompt y contesta con
eso. El sitio es chico y entra entero en un prefijo cacheado, y una sola llamada
por pregunta es más rápida y más barata que un ida y vuelta de herramientas para
leer lo que ya teníamos.

`lib/casa.ts` nació de ahí: la dirección y los cuatro rasgos de la carta estaban
escritos adentro del JSX de las secciones que los muestran, y salieron de ahí
cuando apareció un segundo lector. Es el mismo criterio que `lib/contacto.ts` con
el WhatsApp: un dato, un lugar.

**Lo que no sabe, no lo inventa.** Precios, stock, horarios y fechas son plata y
son gente manejando una hora y media hasta el campo. Si algo no está en lo que
recibió, usa la herramienta `derivar_a_la_casa`: la consulta queda marcada
`derivada` en el panel y a la persona se le pasa el WhatsApp. El menú del día
entra en esa bolsa a propósito —la carta cambia cada semana y no está cargada en
ningún lado—, así que el asistente puede explicar cómo funciona la cocina pero no
nombrar un plato como si estuviera hoy.

Con la tienda o el blog apagados, sus datos ni se leen: el asistente no puede
ofrecer un catálogo que en el sitio dice "Próximamente".

### La reserva sale de la conversación, pero no la toma el modelo

Cuando ya tiene todo, el asistente llama a `proponer_reserva`. Eso **no reserva
nada**: arma un resumen, lo valida con `validarReserva` —la misma función que usa
el formulario, así que una fecha que ya pasó o un paseo un jueves se corrigen
hablando— y lo muestra en pantalla con un botón.

La propuesta se guarda en `consultas.propuesta`, del lado del server, y no viaja
de vuelta: el botón manda el id de la conversación y nada más. `POST
/api/chat/reserva` la vuelve a leer de la base, la vuelve a validar y recién ahí
escribe en `reservas`. Un tool call no es un consentimiento, y una propuesta que
viajara al navegador y volviera sería una reserva que cualquiera puede editar
antes de apretar. La propuesta vence a la media hora.

De ahí en adelante es una reserva como cualquier otra: entra pendiente, abre la
cuenta con el mail y aparece en `/perfil` y en el panel.

### Cómo viaja

`POST /api/chat` es el único que le habla al modelo. El navegador manda el id de
la conversación y el texto; el hilo **nunca** viaja desde el cliente, se lee de
`consultas`. Si viajara, alcanzaría con editarlo para hacerle decir cualquier
cosa al asistente.

La respuesta baja como SSE y se pinta a medida que llega: la diferencia entre
esperar quince segundos en blanco y leer mientras se escribe. Si quien pregunta
cierra la pestaña en el medio, el turno se termina igual del lado del server y se
guarda entero.

### Lo que cuesta

`/api/chat` es un endpoint público que cuesta plata cada vez que contesta, así
que tiene dos frenos, los dos en `lib/consultas.ts` y repetidos como constraints
de la tabla:

- **cinco conversaciones por hora** desde la misma IP —del hash de la IP, no de
  la IP: no se puede volver de ahí a la dirección, y no queremos poder—;
- **veinte preguntas por conversación**, y ahí se deriva al WhatsApp sin volver a
  llamar al modelo.

No es un rate limit de verdad —para eso haría falta Redis, que este stack no
tiene— pero acota lo que puede costar una tarde con alguien haciendo `curl` en un
`for`. El prompt está partido en dos bloques: el estable —que es casi todo— con
`cache_control`, y la fecha y la hora después del breakpoint, porque un `new
Date()` metido arriba invalidaría el cache en cada visita sin fallar, sólo saliendo
diez veces más caro.

`consultas` no tiene una sola policy y RLS queda prendido: con la publishable key
esa tabla no existe. Una conversación se escribe turno a turno, y una policy de
update abierta dejaría que cualquiera con un id reescriba el hilo de otro.

## Panel

`/admin` —se entra por el botón del pie del sitio— es la parte de adentro. Un
aside con las secciones y, al lado, la que esté abierta:

| Sección | Qué hace |
| --- | --- |
| Resumen | Lo que hay tomado de hoy en adelante —pendientes, reservas del día, personas anotadas—, lo vendido en la tienda en los últimos 30 días, los pedidos que faltan entregar y las consultas del chat que esperan respuesta. |
| Reservas | Paseos y mesas en la misma tabla, con filtros por qué, cuándo y estado, y los botones para confirmar, cancelar o reabrir. |
| Compras | Los pedidos de la tienda, lo último primero, con el detalle de cada uno y su total. Entran `pagada`: se marcan entregadas cuando la persona pasó a retirar, o canceladas si no pasó. |
| Consultas | Las conversaciones del chat, cada una entera y no en una celda. El filtro que se usa es "Para contestar": las que el asistente derivó porque no supo. Se marcan resueltas, se vuelven a abrir o se borran. |
| Cuentas | Quiénes reservan, con buscador por mail, nombre o teléfono. Lo único que se hace desde acá es borrarle la contraseña a quien se la olvidó, para que vuelva a entrar con el mail. |
| Productos | El catálogo entero, publicado o no, con filtros por categoría, estado y buscador. Se carga, se edita, se publica, se esconde y se borra. Arriba está el interruptor que abre o cierra la tienda en el sitio. |
| Categorías | Los cajones de la tienda: nombre, bajada, orden y si están a la vista. Se puede crear una sin pasar por acá, desde el select del formulario de un producto. |
| Blog | Las notas: se escriben, se guardan de borrador, se publican, se sacan y se borran, con filtros por estado y buscador. Arriba está el interruptor que abre o cierra el blog en el sitio. Llevan etiquetas —la primera es su sección—, la dirección sale del título y la foto se sube o se elige de la galería. Una nota con fecha de más adelante queda programada y sale sola ese día. |
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
