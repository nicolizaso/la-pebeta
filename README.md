# La Pebeta

Home de La Pebeta — restaurant, granja agroecológica y proveeduría en Los Cardales, Buenos Aires.

## Stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [GSAP](https://gsap.com/) + ScrollTrigger
- [Lenis](https://lenis.darkroom.engineering/) para smooth scroll

## Desarrollo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Estructura

- `app/` — layout, página principal y estilos globales.
- `components/` — componentes de cada sección de la home (Header, Hero, Intro, Process, Restaurant, Granja, Proveeduría, Valores, Visita, Footer) y `SiteAnimations`, que centraliza Lenis + GSAP ScrollTrigger.
- `reference/` — prototipo HTML original usado como base del diseño.

## Build

```bash
npm run build
npm run start
```
