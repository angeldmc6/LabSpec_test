# Laboratorio de Espectroscopía Óptica — EPN

Sitio web oficial del **Laboratorio de Espectroscopía Óptica (LEO)** del Departamento de Física y Astronomía de la **Escuela Politécnica Nacional**, Quito, Ecuador.

> Desarrollado como sitio estático hospedado en GitHub Pages, con panel de administración integrado y sincronización directa con el repositorio.

---

## Estructura del repositorio

```
/
├── index.html          # Estructura HTML del sitio y panel admin
├── site.css            # Estilos del sitio público
├── site.js             # Lógica de renderizado, carrusel, ORCID, navegación
├── admin.css           # Estilos del panel de administración
├── admin.js            # Lógica del admin y publicación vía GitHub API
├── contenido.json      # Todo el contenido editable del sitio
└── img/
    ├── logo.*          # Logo del laboratorio
    ├── noticias/       # Imágenes de noticias
    ├── investigacion/  # Imágenes de áreas de investigación
    ├── proyectos/      # Imágenes de proyectos
    └── miembros/       # Fotos de miembros y alumni
```

---

## Páginas del sitio

| Pestaña | Contenido |
|---|---|
| **Inicio** | Hero con carrusel de áreas de investigación, noticias recientes, estadísticas del lab |
| **Noticias** | Todas las noticias con imagen de portada |
| **Investigación** | Líneas de investigación activas con imagen, descripción y etiquetas |
| **Proyectos** | Proyectos financiados con estado, financiador, fechas y filtros |
| **Miembros** | Miembros actuales (por categoría) y alumni con período y posición actual |
| **Publicaciones** | Publicaciones manuales + sincronización automática desde ORCID |
| **Únete** | Información para postulantes a pregrado, posgrado y postdoctorado |
| **Contacto** | Datos de contacto y patrocinadores |

---

## Panel de administración

El sitio incluye un panel admin integrado accesible desde el botón **⚙ Admin** en la barra de navegación.

### Acceso

La contraseña se define en la variable `ADMIN_PASS` al inicio de `admin.js`:

```js
const ADMIN_PASS = "leo2025"; // ← Cambiar por una contraseña segura
```

### Qué se puede editar

- Información general del laboratorio (nombre, descripción, estadísticas, contacto)
- Logo (se sube automáticamente a `img/logo.*` en GitHub)
- Noticias, áreas de investigación, proyectos, miembros y publicaciones
- Imágenes de cada entrada (se suben a la carpeta correspondiente en `img/`)
- ORCID iD de cada miembro para sincronizar publicaciones automáticamente

### Flujo de edición

```
Editar en el admin → Guardar → 🚀 Publicar en GitHub → sitio actualizado en ~30s
```

Al guardar una entrada con imagen, la imagen se sube primero a GitHub y el JSON guarda solo la ruta relativa. Al pulsar **Publicar**, se actualiza `contenido.json` en el repositorio.

---

## Configuración de GitHub Pages

### 1. Activar GitHub Pages

En el repositorio: **Settings → Pages → Source → Deploy from branch → `main` / `root`**

El sitio quedará disponible en:
```
https://<usuario>.github.io/<repositorio>/
```

### 2. Configurar el token de GitHub en el admin

El panel de administración necesita un token para publicar cambios directamente desde el navegador.

1. Ve a [github.com/settings/tokens](https://github.com/settings/tokens) → **Fine-grained tokens**
2. Crea un token con acceso **solo a este repositorio**
3. Permisos necesarios: `Contents: Read and write`
4. En el panel admin → **Publicar en GitHub** → ingresa usuario, repositorio y token
5. La configuración se guarda en el navegador (`localStorage`) — no se envía a ningún servidor externo

---

## Integración con ORCID

Cada miembro puede tener un **ORCID iD** (formato `0000-0000-0000-0000`) configurado en su perfil desde el admin.

- El enlace al perfil ORCID aparece en la tarjeta del miembro
- En la pestaña **Publicaciones → Desde ORCID**, el sitio consulta la [API pública de ORCID](https://pub.orcid.org) y carga automáticamente las publicaciones de todos los miembros con ORCID configurado
- No requiere autenticación — solo funciona con perfiles públicos

---

## Modo claro / oscuro

El sitio soporta modo claro (por defecto) y modo oscuro. El usuario puede cambiar entre modos con el botón 🌙 / ☀️ de la barra de navegación. La preferencia se guarda en el navegador.

---

## Desarrollo local

Por ser un sitio estático que carga `contenido.json` por fetch, necesita un servidor local para funcionar correctamente (los navegadores bloquean `fetch` en archivos locales por CORS).

```bash
# Con Python (recomendado)
python -m http.server 8000
# Abrir: http://localhost:8000

# Con Node.js
npx serve .
```

---

## Dependencias externas

Todas se cargan desde CDN, sin instalación:

| Recurso | Uso |
|---|---|
| [Google Fonts — Syne + Inter](https://fonts.google.com) | Tipografía del sitio |
| [ORCID Public API](https://pub.orcid.org) | Sincronización de publicaciones |
| [GitHub Contents API](https://docs.github.com/en/rest/repos/contents) | Publicación de cambios desde el admin |

---

## Contacto

**Dr. César Costa Vera** — Investigador principal  
cesar.costa@epn.edu.ec  
Departamento de Física y Astronomía, Escuela Politécnica Nacional  
Ladrón de Guevara E11-253, Quito, Ecuador
