# SOP / Spec de implementación: Vista Proveedor

Referencia visual del demo: **capturas en `src/screen-captures/`**.

- `screencapture-proto-ma-no-work-proveedor-dashboard-html-2026-01-05-22_38_34.png` — Dashboard
- `screencapture-proto-ma-no-work-proveedor-evento-detalle-html-2026-01-05-22_39_12.png` — Detalle de evento
- `screencapture-proto-ma-no-work-proveedor-estado-validacion-html-2026-01-05-22_40_39.png` — Estado de validación
- `screencapture-proto-ma-no-work-proveedor-cargar-trabajador-html-2026-01-05-22_40_02.png` — Cargar trabajador

---

## Regla obligatoria: componentes

**No crear componentes nuevos.** Reutilizar los existentes siempre que aplique.

Componentes disponibles en el proyecto:

- `@/components/ui/PageHeader` — título + subtítulo + slot derecho
- `@/components/ui/MetricCard` — tarjeta de métrica (icono, valor, label, opcional helper)
- `@/components/ui/NavbarLogo` — logo y link

Si un bloque del demo no tiene equivalente exacto, implementarlo con **HTML + clases Tailwind / variables CSS** en la página correspondiente, sin extraer un componente nuevo.

---

## Archivos a tocar (solo estilos y estructura, sin cambiar lógica)

- `src/app/proveedor/layout.tsx`
- `src/app/proveedor/page.tsx`
- `src/app/proveedor/eventos/[id]/page.tsx`

Sistema de diseño: Tailwind v4 + variables en `src/app/globals.css`. Usar `text-(--text)`, `border-(--stroke)`, `rounded-(--radius)`, etc. Si hace falta un token nuevo, añadirlo en `globals.css` y usarlo desde las páginas.

---

## 1. Dashboard proveedor (`/proveedor`)

**Estructura y clases de referencia (demo):**

- **`.container`** — contenedor principal centrado, ancho máximo acorde al diseño.
- **`.header`** — logo “S” (círculo morado) + “SULLAIR ARGENTINA SA” + “CUIT: 30-57672171-0”.
- **`.title-section`** — “Mis Eventos” (título) + “Gestioná la documentación de tu equipo” (subtítulo).
- **`.stats-grid`** — 4 métricas en fila:
  - **3** Eventos Activos
  - **678** Trabajadores
  - **91%** Progreso
  - Última Validación (texto/label)
- **`.section-header`** — “Eventos Asignados” + badge/círculo con número (ej. 3).
- **`.events-grid`** — grid de tarjetas de evento. Cada tarjeta:
  - Badge “NUEVO” si aplica.
  - Estado: “Cargar Documentación” o “PENDIENTE” / “APROBADO”.
  - Fecha (ej. “23-24 Oct 2026”, “29 Oct 2024”).
  - Nombre del evento (ej. “BTS WORLD TOUR 2026”, “La Vela Puerca”).
  - Ubicación con icono 📍 (ej. “Estadio Monumental (River Plate)”, “Movistar Arena”).
  - Tres contadores: X Pendientes (naranja), X Aprobados (verde), X Rechazados (rojo).
- **`.quick-actions`** — “Acciones Rápidas” con tres ítems:
  - 📄 Ver Protocolo Actual
  - 📊 Reporte de Última Validación
  - 💬 ¿Necesitás Ayuda?
- **`.footer`** — “CREW” + “powered by MANOBOT” + “Cerrar Sesión”.

**Visual (desde captura):** Fondo con degradado suave rosa/lila. Tarjetas blancas, bordes redondeados, sombra suave. Estados: naranja (pendiente), verde (aprobado), rojo (rechazado). Números de métricas en azul. Reutilizar `PageHeader` para título + subtítulo y `MetricCard` para las 4 métricas si el diseño lo permite.

---

## 2. Detalle de evento (`/proveedor/eventos/[id]`)

**Referencia visual:** `screencapture-proto-ma-no-work-proveedor-evento-detalle-html-2026-01-05-22_39_12.png`

- **Navegación:** Flecha “volver” (←) arriba a la izquierda.
- **Tarjeta del evento:**
  - Hero/imagen superior con degradado morado–azul (ilustración o placeholder).
  - Título del evento en negrita.
  - Detalles con iconos:
    - Calendario: “Lunes 29 de Octubre, 2024”.
    - Ubicación: “Movistar Arena · CABA”.
    - Reloj: “Apertura: 20:00hs · Show: 22:00hs”.
- **Resumen de estado:** Tres tarjetas horizontales:
  - Pendientes (número en naranja).
  - Aprobados (número en verde).
  - Rechazados (número en rojo).
    Fondo blanco, bordes redondeados, sombra sutil. Reutilizar `MetricCard` si encaja.
- **Acciones principales** (botones grandes, icono + título + subtítulo + flecha):
  - “Ver Protocolo” — fondo azul claro, subtítulo “Requisitos y lineamientos del evento”.
  - “Cargar Trabajadores” — fondo verde claro, subtítulo “Agregar nuevo empleado y documentación”.
  - “Estado de Validación” — fondo amarillo claro, subtítulo “Ver detalles y reportes completos”.
- **Últimos trabajadores:** Título “Últimos Trabajadores” + badge “17 Total” (fondo azul oscuro). Lista de filas: avatar con iniciales (círculo morado), nombre, rol, badge “Aprobado” (verde) o “Pendiente” (naranja).
- **Footer:** “MANOBOT RH” con icono morado (alineado con layout/demo).

Colores y tipografía: mismos tokens que el resto (--text, --muted, --accent, --pending, --approved, --rejected). Sin componentes nuevos; reutilizar los existentes o maquetar con divs + Tailwind.

---

## 3. Estado de validación

**Referencia visual:** `screencapture-proto-ma-no-work-proveedor-estado-validacion-html-2026-01-05-22_40_39.png`

- **Cabecera:** Flecha volver + título “Estado de Validación” + subtítulo “La Vela Puerca · 29 Oct 2024”.
- **Tarjetas de resumen:** Tres tarjetas:
  - Pendientes: fondo lavanda/morado claro, número en morado oscuro.
  - Aprobados: fondo azul claro, número en azul oscuro.
  - Rechazados: fondo rojo/rosa claro, número en rojo.
    Reutilizar `MetricCard` con los colores indicados.
- **Filtros:** Píldoras “Todos (17)” (activa: fondo morado, texto blanco), “Pendientes”, “Aprobados” (inactivas: gris claro).
- **Botones:** “Descargar Reporte” (icono de gráfico/descarga), “Agregar” (icono +). Fondo gris claro, texto gris oscuro, bordes redondeados.
- **Sección “Trabajadores”:** Título + badge con total (ej. 17). Lista de tarjetas por trabajador:
  - Avatar con iniciales (círculo morado).
  - Nombre en negrita, rol en gris.
  - Badge “Aprobado” (verde + check) o “Pendiente” (amarillo/naranja + icono reloj).
  - Detalles en dos columnas: DNI, Fecha validación | CUIL, ART/Estado (ej. “Vigente ✓”, “En Revisión”).
- **Footer:** Mismo criterio que en detalle de evento.

Implementar con estructura semántica (section, headings) y clases Tailwind/variables; sin nuevos componentes.

---

## 4. Cargar trabajador (modal o página)

**Referencia visual:** `screencapture-proto-ma-no-work-proveedor-cargar-trabajador-html-2026-01-05-22_40_02.png`

- **Cabecera:** Flecha volver + “Cargar Trabajador” + subtítulo “La Vela Puerca · 29 Oct 2024” + barra de progreso “Progreso: 0%”.
- **Sección “Datos Personales”** (tarjeta blanca, bordes redondeados):
  - Nombre Completo (placeholder ej. “Juan Pérez”).
  - DNI (placeholder ej. “35123456”).
  - CUIL (placeholder ej. “20-35123456-7”).
  - Rol / Función: select “Seleccioná el rol”.
    Inputs: fondo gris claro, esquinas redondeadas.
- **Sección “Documentación”** (tarjeta blanca):
  - DNI Frente: área de subida con borde punteado, icono documento, “Subir foto DNI frente”, “JPG, PNG • Max 5MB”.
  - DNI Dorso: mismo patrón, “Subir foto DNI dorso”.
  - Carnet ART: mismo patrón, “Subir carnet ART vigente”, “JPG, PNG • Max 5MB”.
- **Botones:** “Enviar a Validación” (gradiente púrpura–azul, texto blanco, redondeado); “Cancelar” (fondo blanco, borde gris).
- **Footer:** “MANOBOT RH” con icono.

Si en la app actual “Cargar trabajador” es un modal dentro de `/proveedor/eventos/[id]`, mantener ese comportamiento y solo aplicar estos estilos y textos. Sin componentes nuevos; reutilizar estilos de formularios existentes si los hay.

---

## Resumen de estilos del demo (para consistencia)

- **Fondo general:** Degradado suave rosa/lila (opcional; si no, mantener `var(--bg)`).
- **Tarjetas:** Fondo blanco (`var(--surface)`), `border-radius` generoso, `box-shadow` suave.
- **Estados:** Naranja (pendiente), verde (aprobado), rojo (rechazado); variables `--pending`, `--approved`, `--rejected`. Variantes pastel para fondos de tarjetas de resumen (lavanda, azul claro, rosa claro) si se desea.
- **Acento:** Morado/azul para logo, botones primarios y badges activos; alinear con `--accent` o `--accent-purple` según diseño.
- **Tipografía:** Títulos en negrita gris oscuro (`var(--text)`), secundario en gris (`var(--muted)` / `var(--text-secondary)`).
- **Footer:** “CREW” + “powered by MANOBOT” + “Cerrar Sesión” en rojo; mismo criterio en layout proveedor.

---

## Checklist antes de dar por cerrada la implementación

- [ ] No se ha creado ningún componente nuevo; se reutilizan `PageHeader`, `MetricCard`, `NavbarLogo` donde corresponda.
- [ ] Dashboard: header, title-section, stats-grid (4 métricas), section-header, events-grid, quick-actions, footer con textos del spec.
- [ ] Detalle de evento: hero, resumen 3 tarjetas, botones Ver Protocolo / Cargar Trabajadores / Estado de Validación, lista Últimos Trabajadores.
- [ ] Estado de validación: cabecera, 3 tarjetas resumen, filtros píldora, botones, lista de trabajadores con badges y detalles.
- [ ] Cargar trabajador: cabecera con progreso, Datos Personales, Documentación, botones Enviar a Validación y Cancelar.
- [ ] Referencia visual verificada contra las cuatro capturas en `src/screen-captures/`.
