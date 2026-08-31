-- Qué secciones del sitio están abiertas al público.
--
-- La tienda y el blog salieron a producción apagados: el sitio los tiene
-- hechos, pero la casa los prende cuando el catálogo y las primeras notas
-- estén listos. Mientras están apagados no aparecen en el menú y su dirección
-- muestra un "Próximamente".
--
-- Es una fila por sección, con el id fijo por constraint: no es una tabla de
-- configuración general donde se pueda escribir cualquier clave, son las dos
-- partes del sitio que se pueden apagar y nada más. Agregar una tercera es
-- agregarla acá y en `lib/secciones.ts`.
create table public.secciones (
  id text primary key check (id in ('tienda', 'blog')),
  activa boolean not null default false,
  actualizado timestamptz not null default now()
);

-- Nacen apagadas, que es lo que pide la primera puesta en producción. Prender
-- una es del panel, con la secret key.
insert into public.secciones (id, activa)
values ('tienda', false), ('blog', false)
on conflict (id) do nothing;

alter table public.secciones enable row level security;

-- Se leen desde el sitio con la publishable key: el menú y cada página
-- preguntan si su sección está abierta antes de mostrarse. Prenderlas y
-- apagarlas es sólo del panel, así que no hay policy de escritura.
create policy "secciones: lectura pública"
  on public.secciones for select
  to anon, authenticated
  using (true);
