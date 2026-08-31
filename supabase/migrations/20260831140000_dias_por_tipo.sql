-- Los días abiertos dejan de ser los mismos para todo.
--
-- El restaurant sigue atendiendo de jueves a domingo, pero las experiencias del
-- campo —la visita a la huerta y el paseo por la granja— salen viernes, sábados
-- y domingos. Hasta acá la tabla pedía un solo rango para los dos tipos, así
-- que un paseo un jueves entraba igual.
--
-- Es la misma regla que valida `lib/reservas.ts`, escrita también como
-- constraint para que no entre nada raro ni siquiera escribiendo contra la base
-- de forma directa.

alter table public.reservas
  drop constraint reservas_dia_abierto;

alter table public.reservas
  add constraint reservas_dia_abierto check (
    (tipo = 'paseos' and extract(dow from fecha) in (0, 5, 6))
    or (tipo = 'restaurant' and extract(dow from fecha) in (0, 4, 5, 6))
  )
  -- las reservas que ya estaban tomadas se respetan: si hay un paseo un jueves,
  -- se cumple igual. La regla nueva rige para lo que entre de acá en adelante.
  not valid;
