# Calculadora de Estancia de Estudiante

Calculadora (interfaz en español) para los plazos de la solicitud de estancia por
estudios en España. A partir de la fecha de llegada y la duración o la fecha de salida
del periodo de turista, calcula la ventana válida para presentar la solicitud.

Construida con **Astro 7** + una isla de **React 19**, estilada con **Tailwind CSS v4**
y desplegada en **Vercel**.

## Desarrollo local

**Requisito:** Node.js 22 y [pnpm](https://pnpm.io/) (este proyecto usa pnpm, no npm)

```bash
pnpm install
pnpm dev      # servidor de desarrollo en http://localhost:4321
```

| Comando         | Acción                                          |
| --------------- | ----------------------------------------------- |
| `pnpm dev`      | Servidor de desarrollo (`localhost:4321`)       |
| `pnpm build`    | Compila el sitio estático en `dist/`            |
| `pnpm preview`  | Sirve la compilación de `dist/` localmente      |
| `pnpm check`    | Verifica tipos con `astro check`                |

## Estructura

- `src/pages/index.astro` — página única; shell estático que monta la calculadora
  interactiva como única isla React (`client:only`).
- `src/layouts/Layout.astro` — shell HTML, estilos globales.
- `src/components/Header.astro`, `src/components/Disclaimer.astro` — cabecera y pie
  estáticos (sin JS).
- `src/components/Calculator.tsx`, el resto de `src/components/` y
  `src/services/calculationService.ts` — la isla React y la lógica de cálculo.

## Despliegue

El proyecto se despliega en Vercel (preset de Astro autodetectado). Cada push a `main`
genera un despliegue de producción; las ramas/PRs generan previews. Para volver a una
versión anterior que funcionaba, usa **Instant Rollback** en el panel de Vercel.
