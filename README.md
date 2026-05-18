# SemiGITA — Semillero de Innovación e Investigación GITA

Sitio web oficial del semillero de investigación SemiGITA, alojado en GitHub Pages.

## Tecnologías

- HTML5 semántico con accesibilidad ARIA
- CSS moderno: Custom Properties, Grid, Flexbox, Glassmorphism, Scroll-driven animations
- JavaScript ES Modules: Intersection Observer, Canvas particles, data fetching dinámico
- Sin dependencias externas ni proceso de build — despliega directo en GitHub Pages

## Estructura

```
SemiGITAweb/
├── index.html              # Página principal (Single Page)
├── .nojekyll               # Deshabilita Jekyll en GitHub Pages
├── assets/
│   ├── css/                # Sistema de estilos modular
│   │   ├── tokens.css      # Design tokens (colores, espaciado, tipografía)
│   │   ├── reset.css       # CSS reset moderno
│   │   ├── base.css        # Estilos base y tipografía
│   │   ├── components.css  # Componentes reutilizables
│   │   ├── animations.css  # Animaciones y keyframes
│   │   └── main.css        # Estilos por sección + imports
│   ├── js/                 # Módulos JavaScript
│   │   ├── main.js         # Punto de entrada
│   │   ├── nav.js          # Navegación sticky + scroll spy
│   │   ├── animations.js   # Intersection Observer (scroll reveal)
│   │   ├── data.js         # Carga y renderiza JSON dinámicamente
│   │   └── particles.js    # Efecto de partículas en canvas (hero)
│   └── images/             # Recursos gráficos
├── data/                   # Contenido en JSON (editar para actualizar)
│   ├── members.json        # Integrantes del semillero
│   ├── projects.json       # Proyectos activos y completados
│   ├── publications.json   # Publicaciones académicas
│   └── research-lines.json # Líneas de investigación
```

## Cómo actualizar contenido

### Agregar un integrante
Editar `data/members.json` y agregar foto en `assets/images/members/member-[slug].webp`.

### Agregar un proyecto
Editar `data/projects.json` y agregar imagen en `assets/images/projects/project-[slug].webp`.

### Agregar una publicación
Editar `data/publications.json`.

## Integrar servicios externos

- **WhatsApp**: Cambiar el número en el botón de contacto en `index.html`
- **Google Forms**: Reemplazar `FORM_ID` en la sección de contacto con el ID real del formulario
- **Google Drive**: Usar el embed `https://drive.google.com/file/d/FILE_ID/preview`
- **Google Calendar**: Reemplazar `CALENDAR_ID` en la sección de eventos

## Despliegue

El sitio se despliega automáticamente en GitHub Pages en cada push a `main`.
URL: `https://[usuario].github.io/SemiGITAweb`

## Licencia

© SemiGITA — Semillero de Innovación e Investigación GITA
