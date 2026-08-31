"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/restaurant", label: "Restaurant" },
  { href: "/granja", label: "Granja" },
  { href: "/huerta", label: "Huerta" },
  { href: "/paseos", label: "Paseos" },
  { href: "/tienda", label: "Tienda" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
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
   * "Mi perfil" aparece si hay sesión, y eso se pregunta acá y no en el server
   * a propósito: leer la cookie mientras se arma la página volvería dinámicas a
   * todas las del sitio, que hoy salen estáticas. La cookie que se mira no es
   * la de la sesión —esa es httpOnly y no se puede leer desde el navegador—
   * sino la señal que la acompaña, que sólo dice que hay alguien.
   */
  useEffect(() => {
    setConCuenta(document.cookie.split("; ").includes("pebeta_sesion=1"));
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`site${scrolled ? " scrolled" : ""}`}>
      <Link href="/" className="logo" onClick={close}>
        La Pebeta
      </Link>
      <nav className={`links${open ? " open" : ""}`}>
        {NAV_LINKS.map((link) => (
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
