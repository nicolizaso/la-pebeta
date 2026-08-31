-- Cuál de los dos paseos: la visita a la huerta o el recorrido por la granja.
--
-- Hasta acá `tipo = 'paseos'` era una sola cosa, y cuál se quería se pedía en
-- el comentario. Ahora el formulario lo pregunta, así que la reserva lo guarda
-- y el panel lo muestra sin tener que leer el texto libre.
--
-- Es la misma regla que valida `lib/reservas.ts`, escrita también como
-- constraint para que no entre nada raro ni siquiera escribiendo contra la base
-- de forma directa: un paseo lleva uno de los dos, una mesa no lleva ninguno.

alter table public.reservas
  add column paseo text not null default '';

alter table public.reservas
  add constraint reservas_paseo_por_tipo check (
    (tipo = 'paseos' and paseo in ('huerta', 'granja'))
    or (tipo = 'restaurant' and paseo = '')
  )
  -- los paseos ya tomados no tienen cuál: se anotaron antes de que se pudiera
  -- elegir, y ahí lo que se quería está en el comentario. La regla nueva rige
  -- para lo que entre de acá en adelante; el listado los muestra igual, con la
  -- etiqueta genérica.
  not valid;
