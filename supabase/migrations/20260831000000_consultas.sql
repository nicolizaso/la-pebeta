-- Las consultas del chat: una fila por conversación, con el hilo entero adentro.
--
-- A diferencia de `reservas` y `compras` —que entran de una sola vez y por eso
-- tienen su policy de alta pública—, una conversación se va escribiendo turno a
-- turno. Una policy de update abierta dejaría que cualquiera que tenga un id
-- reescriba el hilo de otro, así que acá no hay policies: RLS queda prendido y
-- sin nada que lo abra, y todo —leer y escribir— pasa por la secret key del
-- lado del server. El navegador nunca le habla a esta tabla de forma directa;
-- le habla a /api/chat, que es el que decide qué se guarda.
create table public.consultas (
  id uuid primary key default gen_random_uuid(),
  -- Código corto para dictar por teléfono, igual que una reserva o una compra:
  -- sirve para que quien atiende encuentre la conversación de la que le hablan.
  codigo text not null unique,
  creada timestamptz not null default now(),
  actualizada timestamptz not null default now(),
  -- `derivada` es "esto lo tiene que contestar una persona": lo marca el
  -- asistente cuando no sabe, y es lo que sale en el resumen del panel.
  estado text not null default 'abierta'
    check (estado in ('abierta', 'derivada', 'resuelta')),
  -- [{ rol: 'persona' | 'asistente', texto, momento }], en orden.
  -- El tope es el mismo que valida lib/consultas.ts: una consulta es una
  -- consulta, no una charla infinita contra un endpoint que cuesta plata.
  hilo jsonb not null default '[]'::jsonb
    check (jsonb_array_length(hilo) <= 40),
  -- Desde qué página se abrió el chat. Dice mucho: la misma pregunta hecha
  -- desde /tienda y desde /restaurant no es la misma pregunta.
  pagina text not null default '' check (char_length(pagina) <= 200),
  -- Nombre, teléfono y mail, pero sólo si la persona los dejó en la charla.
  contacto jsonb not null default '{}'::jsonb,
  -- La reserva que el asistente propuso y todavía nadie confirmó. Vive acá, del
  -- lado del server, y no viaja al navegador: el modelo propone, la persona
  -- aprieta un botón y el que escribe en `reservas` es /api/chat/reserva, que
  -- vuelve a leer esta columna y a validarla. Así una propuesta no se puede
  -- inventar ni retocar desde el cliente.
  propuesta jsonb,
  -- La reserva que salió de esta conversación, si salió alguna.
  reserva uuid references public.reservas(id) on delete set null,
  -- El hash de la IP, no la IP. Es para poder cortarle la mano a quien abra
  -- cien conversaciones en un minuto, y no para saber quién entró.
  huella text not null default '' check (char_length(huella) <= 64)
);

-- lo último primero, que es como se lee en el panel
create index consultas_creada_idx on public.consultas (creada desc);
-- lo que hay para contestar
create index consultas_estado_idx on public.consultas (estado, creada desc);
-- el contador del límite por IP: cuántas abrió esta huella en la última hora
create index consultas_huella_idx on public.consultas (huella, creada desc);

-- Sin policies a propósito: ver el comentario de arriba. RLS prendido y nada
-- que lo abra significa que con la publishable key esta tabla no existe.
alter table public.consultas enable row level security;
