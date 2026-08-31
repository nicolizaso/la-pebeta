import { hayAsistente } from "@/lib/asistente";
import { MAX_MENSAJE } from "@/lib/consultas";
import { Chat } from "./Chat";

/**
 * La puerta del chat, del lado del server.
 *
 * Sin `ANTHROPIC_API_KEY` no hay asistente que valga: en vez de mostrar una
 * burbuja que al abrirse pide disculpas, no se monta nada. Es la misma pregunta
 * que hace `/api/chat` antes de contestar, sólo que acá se hace una vez y
 * decide si el widget existe.
 *
 * Va en cada página del sitio al lado del Footer, como el Lightbox: el panel de
 * admin no lo lleva, porque ahí no hay nadie a quien atender.
 */
export function Asistente() {
  if (!hayAsistente()) return null;
  return <Chat maxMensaje={MAX_MENSAJE} />;
}
