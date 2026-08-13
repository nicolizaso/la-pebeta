import { createClient } from "@supabase/supabase-js";

/**
 * El cliente de Supabase, siempre del lado del server.
 *
 * Usa la publishable key, que es pública a propósito: lo que se puede hacer
 * con ella lo decide RLS, y hoy es solamente dejar una reserva (que entra como
 * pendiente) y leer el catálogo publicado. Confirmar, cancelar o listar
 * reservas va a necesitar la secret key, que entra recién con el ABM.
 */

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

export function supabase() {
  if (!URL || !KEY) {
    throw new Error(
      "Faltan SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY. En local van en .env.local; en Vercel, en las environment variables del proyecto."
    );
  }
  return createClient(URL, KEY, { auth: { persistSession: false } });
}
