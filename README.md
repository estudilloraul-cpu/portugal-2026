# Explorer Family · Portugal 2026

Primera versión funcional de la guía PWA offline.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo, por ejemplo `portugal-2026`.
2. Sube **el contenido de esta carpeta** a la raíz del repositorio.
3. En GitHub entra en `Settings` → `Pages`.
4. En `Build and deployment`, selecciona `Deploy from a branch`.
5. Selecciona la rama `main` y la carpeta `/ (root)`.
6. Guarda. GitHub mostrará la URL pública unos minutos después.

## Instalar en iPhone

1. Abre la URL de GitHub Pages en Safari.
2. Pulsa Compartir.
3. Elige `Añadir a pantalla de inicio`.
4. Repite el proceso en el iPhone de la otra persona.

## Cómo editar el contenido general

La información está en `data/trip.json`.

- `days`: tarjetas del planning.
- `cards`: fichas ampliadas.
- Cada actividad puede incluir un código `ref` que abre una ficha.

## Cambios realizados dentro de la app

Los cambios del planning se guardan en `localStorage`, solo en el dispositivo donde se hacen.
Todavía no se sincronizan entre ambos móviles.

## Estado de esta versión

Incluye:
- PWA instalable.
- Uso offline tras la primera carga.
- Tarjetas de días editables.
- Dossier de Lisboa con búsqueda y filtros.
- Enlaces desde cada actividad a su ficha detallada.

Pendiente:
- Sintra, Óbidos, Nazaré, Aveiro, Oporto y Burgos.
- Fotografías locales optimizadas.
- Exportar/importar cambios entre móviles.
- Más fichas de transporte, restaurantes y pernoctas.
