import { createClient } from "@supabase/supabase-js";

/**
 * Los dos clientes de Supabase, siempre del lado del server.
 *
 * `supabase()` usa la publishable key, que es pública a propósito: lo que se
 * puede hacer con ella lo decide RLS, y hoy es dejar una reserva (que entra
 * como pendiente) y leer el catálogo publicado y los horarios.
 *
 * `supabaseAdmin()` usa la secret key y saltea RLS, así que sólo lo puede
 * llamar el panel de `/admin`: listar reservas (que tienen teléfonos y mails),
 * confirmarlas, cancelarlas y cargar los horarios.
 */

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
const SECRETO = process.env.SUPABASE_SECRET_KEY;

export function supabase() {
  if (!URL || !KEY) {
    throw new Error(
      "Faltan SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY. En local van en .env.local; en Vercel, en las environment variables del proyecto."
    );
  }
  return createClient(URL, KEY, { auth: { persistSession: false } });
}

/** ¿Está configurada la secret key? Lo pregunta el panel antes de leer nada. */
export function hayClaveDeAdmin(): boolean {
  return Boolean(URL && SECRETO);
}

export function supabaseAdmin() {
  if (!URL || !SECRETO) {
    throw new Error(
      "Faltan SUPABASE_URL y SUPABASE_SECRET_KEY. El panel de admin las necesita para leer las reservas y cargar los horarios: en local van en .env.local; en Vercel, en las environment variables del proyecto."
    );
  }
  return createClient(URL, SECRETO, { auth: { persistSession: false } });
}
