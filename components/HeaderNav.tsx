"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";

/**
 * La barra de arriba: el logo, los links que correspondan y el botón de
 * reservar.
 *
 * Cuáles son los links lo decide `Header`, del lado del server, porque depende
 * de qué secciones estén activas. Acá adentro queda lo que necesita el
 * navegador: el fondo que aparece al bajar, el menú del teléfono y "Mi perfil".
 */
export type NavLink = { href: string; label: string };

export function HeaderNav({ links }: { links: NavLink[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [conCuenta, setConCuenta] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * "Mi perfil" aparece si hay sesión, y eso se sigue preguntando acá: es lo
   * único del menú que cambia por visitante, así que leerlo en el server
   * obligaría a armar una página distinta para cada uno. La cookie que se mira
   * no es la de la sesión —esa es httpOnly y no se puede leer desde el
   * navegador— sino la señal que la acompaña, que sólo dice que hay alguien.
   */
  useEffect(() => {
    setConCuenta(document.cookie.split("; ").includes("pebeta_sesion=1"));
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`site${scrolled ? " scrolled" : ""}`}>
      <Link href="/" className="marca-link" onClick={close}>
        <Logo dual />
      </Link>
      <nav className={`links${open ? " open" : ""}`}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} onClick={close}>
            {link.label}
          </Link>
        ))}
        {conCuenta ? (
          <Link href="/perfil" onClick={close}>
            Mi perfil
          </Link>
        ) : null}
        <Link href="/reservas" className="cta" onClick={close}>
          Reservar
        </Link>
      </nav>
      <button
        className="nav-toggle"
        aria-label="Abrir menú"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  );
}
