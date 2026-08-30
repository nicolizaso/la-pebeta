-- El esquema de La Pebeta, entero, en su propio proyecto de Supabase.
--
-- Viene de cinco migraciones que vivían en el proyecto de Una Luca, donde estas
-- tablas convivían con las de otras apps y por eso llevaban el prefijo
-- `pebeta_`. Acá no hay con quién chocar, así que se llaman por su nombre.
--
-- Es un baseline, no el replay de aquella historia: lo que dice es el estado
-- final al que se había llegado allá —columnas agregadas, constraints
-- reemplazadas, defaults sacados— escrito de una sola vez.

-- Las reservas de paseo y de mesa. El sitio sólo puede dar de alta; confirmar y
-- cancelar es del panel, que escribe con la secret key.
create table public.reservas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  tipo text not null check (tipo in ('paseos', 'restaurant')),
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'confirmada', 'cancelada')),
  creada timestamptz not null default now(),
  nombre text not null check (char_length(nombre) between 2 and 80),
  telefono text not null check (char_length(telefono) between 6 and 30),
  email text not null default '' check (char_length(email) <= 120),
  fecha date not null,
  hora text not null check (hora ~ '^[0-9]{2}:[0-9]{2}$'),
  personas integer not null,
  comentarios text not null default '' check (char_length(comentarios) <= 500),
  -- las mismas reglas que valida la API, para que no entre nada raro
  -- ni siquiera escribiendo contra la base de forma directa
  constraint reservas_personas_por_tipo check (
    (tipo = 'paseos' and personas between 1 and 15)
    or (tipo = 'restaurant' and personas between 1 and 10)
  ),
  constraint reservas_dia_abierto check (
    extract(dow from fecha) in (0, 4, 5, 6)
  )
);

create index reservas_fecha_idx on public.reservas (fecha, hora);
create index reservas_estado_idx on public.reservas (estado, creada desc);

-- Los cajones del catálogo. No hay lista fija en el código: se cargan desde el
-- panel y el id sale del nombre (`quesos-de-tambo`).
create table public.categorias (
  id text primary key check (id ~ '^[a-z][a-z0-9-]{1,39}$'),
  nombre text not null check (char_length(nombre) between 2 and 60),
  descripcion text not null default '',
  orden smallint not null default 0,
  activa boolean not null default true
);

-- El catálogo de la proveeduría. `foto` es una clave del manifiesto de imágenes
-- ("huerta/17"); vacía si el producto todavía no tiene una. Todo producto
-- pertenece a una categoría de la tabla de arriba, así que hay que elegirla: no
-- hay default.
create table public.productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 2 and 120),
  descripcion text not null default '',
  precio integer not null default 0 check (precio >= 0),
  unidad text not null default '',
  stock integer not null default 0 check (stock >= 0),
  categoria text not null references public.categorias(id),
  activo boolean not null default true,
  creado timestamptz not null default now(),
  foto text not null default ''
);

create index productos_activo_idx on public.productos (activo, categoria);

-- Las compras de la tienda. Siempre tienen al menos un ítem, y no más de los
-- que entran en un pedido de proveeduría. La misma regla está en lib/tienda.ts.
create table public.compras (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'pagada', 'entregada', 'cancelada')),
  creada timestamptz not null default now(),
  cliente jsonb not null,
  items jsonb not null default '[]'::jsonb
    check (jsonb_array_length(items) between 1 and 40),
  total integer not null default 0 check (total >= 0)
);

-- Los horarios de atención, una fila por área y día de la semana.
create table public.horarios (
  id uuid primary key default gen_random_uuid(),
  area text not null check (area in ('proveeduria', 'restaurant')),
  -- 0 = domingo … 6 = sábado, igual que getDay() en el front
  dia smallint not null check (dia between 0 and 6),
  abierto boolean not null default false,
  desde text not null default '' check (desde = '' or desde ~ '^[0-9]{2}:[0-9]{2}$'),
  hasta text not null default '' check (hasta = '' or hasta ~ '^[0-9]{2}:[0-9]{2}$'),
  nota text not null default '' check (char_length(nota) <= 120),
  actualizado timestamptz not null default now(),
  -- un día abierto tiene que tener las dos puntas, y en orden
  constraint horarios_rango check (
    not abierto or (desde <> '' and hasta <> '' and desde < hasta)
  ),
  constraint horarios_area_dia unique (area, dia)
);

-- El blog. Una nota entra como borrador (publicada = false) y sale sola cuando
-- llega su fecha: la regla de "está a la vista" es `publicada and fecha <=
-- now()`, y vive acá además de en el código, así que una nota programada no se
-- puede leer desde afuera ni escribiendo contra la base de forma directa.
--
-- La primera etiqueta es la sección en la que va ("La Pebeta en tu casa",
-- "Huerta en tu casa"), y las demás, temas sueltos: hasta seis y ninguna vacía.
-- El largo de cada una lo revisa lib/blog.ts, que es el que puede explicar qué
-- está mal. `foto` es una clave del manifiesto o la URL de una imagen subida
-- desde el panel, que es bastante más larga que ochenta caracteres.
create table public.notas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  bajada text not null default '',
  cuerpo text not null default '',
  autor text not null default '',
  foto text not null default '',
  publicada boolean not null default false,
  fecha timestamptz not null default now(),
  creada timestamptz not null default now(),
  actualizada timestamptz not null default now(),
  etiquetas text[] not null default '{}',
  constraint notas_slug_check check (slug ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  constraint notas_titulo_check check (char_length(titulo) between 3 and 140),
  constraint notas_bajada_check check (char_length(bajada) <= 300),
  constraint notas_cuerpo_check check (char_length(cuerpo) <= 20000),
  constraint notas_autor_check check (char_length(autor) <= 60),
  constraint notas_foto_check check (char_length(foto) <= 400),
  constraint notas_etiquetas_check check (
    (array_length(etiquetas, 1) is null or array_length(etiquetas, 1) <= 6)
    and '' <> all(etiquetas)
  )
);

-- el orden en que se lee el blog: lo último primero, y sólo lo que está para salir
create index notas_salida on public.notas (fecha desc) where publicada;

alter table public.reservas enable row level security;
alter table public.categorias enable row level security;
alter table public.productos enable row level security;
alter table public.compras enable row level security;
alter table public.horarios enable row level security;
alter table public.notas enable row level security;

-- Lo único que puede hacer una visita anónima es dejar una reserva, y siempre
-- entra como pendiente: confirmarla o cancelarla es del panel, que va a entrar
-- con la secret key.
create policy "reservas: alta pública"
  on public.reservas for insert
  to anon, authenticated
  with check (estado = 'pendiente');

-- El alta de una compra viene del sitio con la publishable key, igual que las
-- reservas. Entra pagada porque la pasarela (ficticia) ya la aprobó; entregarla
-- o cancelarla es del panel.
create policy "compras: alta pública"
  on public.compras for insert
  to anon, authenticated
  with check (estado = 'pagada');

-- El catálogo es público, pero sólo lo que está publicado.
create policy "categorias: lectura pública"
  on public.categorias for select
  to anon, authenticated
  using (activa);

create policy "productos: catálogo público"
  on public.productos for select
  to anon, authenticated
  using (activo);

-- Los horarios son información pública. Cargarlos es sólo del panel, y por eso
-- no hay policy de insert ni de update.
create policy "horarios: lectura pública"
  on public.horarios for select
  to anon, authenticated
  using (true);

create policy "notas: lectura pública"
  on public.notas for select
  to anon, authenticated
  using (publicada and fecha <= now());

-- El cajón donde van las fotos que se suben desde el panel para una nota.
-- Público: lo que guarda es la foto que abre una nota, que se ve en el blog.
-- Subir, en cambio, necesita la secret key, así que sólo puede hacerlo el panel
-- y no hacen falta policies sobre storage.objects.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog',
  'blog',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
