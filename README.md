# Calculadora de Estancia de Estudiante

Calculadora (interfaz en español) para los plazos de la solicitud de estancia por
estudios en España. A partir de la fecha de llegada y la duración o la fecha de salida
del periodo de turista, calcula la ventana válida para presentar la solicitud.

Construida con **Astro 7** + una isla de **React 19**, estilada con **Tailwind CSS v4**
y desplegada en **Vercel**.

## Desarrollo local

**Requisito:** Node.js

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:4321
```

| Comando            | Acción                                         |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | Servidor de desarrollo (`localhost:4321`)      |
| `npm run build`    | Compila el sitio estático en `dist/`           |
| `npm run preview`  | Sirve la compilación de `dist/` localmente     |

## Estructura

- `src/pages/index.astro` — página única; monta la app React como isla cliente.
- `src/layouts/Layout.astro` — shell HTML, estilos globales.
- `src/App.tsx`, `src/components/`, `src/services/calculationService.ts` — la app React
  y la lógica de cálculo.

## Despliegue

El proyecto se despliega en Vercel (preset de Astro autodetectado). Cada push a `main`
genera un despliegue de producción; las ramas/PRs generan previews. Para volver a una
versión anterior que funcionaba, usa **Instant Rollback** en el panel de Vercel.
