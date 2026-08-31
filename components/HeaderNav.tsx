"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * La barra de arriba: el logo, los links que correspondan y el botón de
 * reservar.
 *
 * Cuáles son los links lo decide `Header`, del lado del server, porque depende
 * de qué secciones estén activas. Acá adentro sólo queda lo que necesita el
 * navegador: el fondo que aparece al bajar y el menú del teléfono.
 */
export type NavLink = { href: string; label: string };

export function HeaderNav({ links }: { links: NavLink[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`site${scrolled ? " scrolled" : ""}`}>
      <Link href="/" className="logo" onClick={close}>
        La Pebeta
      </Link>
      <nav className={`links${open ? " open" : ""}`}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} onClick={close}>
            {link.label}
          </Link>
        ))}
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
