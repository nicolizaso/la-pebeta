-- Las cuentas de quienes reservan y compran.
--
-- Nadie se registra: la cuenta nace sola con la primera reserva, con el mail
-- como llave. Por eso `password_hash` puede estar vacío —así entra quien
-- todavía no se puso una contraseña, con sólo escribir su mail— y por eso
-- ponerse una es lo que cierra esa puerta para esa cuenta.
--
-- No usa Supabase Auth a propósito: todo el acceso a los datos de este sitio ya
-- pasa por el server con la secret key, así que una tabla propia y una cookie
-- firmada (lib/sesion.ts) alcanzan, y no hay que traer el cliente de auth ni
-- reescribir las policies con auth.uid().
create table public.usuarios (
  id uuid primary key default gen_random_uuid(),
  -- la llave de la cuenta, siempre en minúsculas para que no haya dos
  email text not null unique
    check (email = lower(email) and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'),
  nombre text not null default '' check (char_length(nombre) <= 80),
  telefono text not null default '' check (char_length(telefono) <= 30),
  -- vacío = cuenta sin contraseña, que entra sólo con el mail
  password_hash text not null default '' check (char_length(password_hash) <= 400),
  password_puesta timestamptz,
  -- sube cuando se cambia la contraseña y ahí caducan las demás sesiones
  sesion_epoch timestamptz not null default now(),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  ultimo_acceso timestamptz not null default now(),
  -- las dos cosas van juntas: o hay contraseña y fecha, o no hay ninguna
  constraint usuarios_password_coherente check (
    (password_hash = '' and password_puesta is null)
    or (password_hash <> '' and password_puesta is not null)
  )
);

-- El dueño de una reserva y de una compra. Es nullable porque las que ya
-- estaban no tienen cuenta, y porque una reserva se toma igual aunque el alta
-- de la cuenta falle: primero está atender a quien reserva.
alter table public.reservas
  add column usuario_id uuid references public.usuarios(id) on delete set null;

alter table public.compras
  add column usuario_id uuid references public.usuarios(id) on delete set null;

-- lo que lee el perfil: lo de esta persona, lo último primero
create index reservas_usuario_idx on public.reservas (usuario_id, fecha desc);
create index compras_usuario_idx on public.compras (usuario_id, creada desc);

-- El mail deja de ser opcional en una reserva: es con lo que se arma la cuenta.
-- Va `not valid` porque las reservas viejas se tomaron sin mail y no hay por
-- qué tocarlas: la regla corre para lo que entre de ahora en adelante.
alter table public.reservas
  add constraint reservas_email_requerido
  check (email <> '' and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$')
  not valid;

-- Las cuentas tienen mails, teléfonos y hashes de contraseña: no se leen ni se
-- escriben desde afuera. RLS habilitada y ninguna policy, así que sólo las toca
-- la secret key, igual que el listado de reservas.
alter table public.usuarios enable row level security;
