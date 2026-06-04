# Caries Urbanas · Observatorio Urbano de Santa Fe

**Caries Urbanas** es un sistema de gestión integral y observatorio ciudadano de inmuebles abandonados, terrenos baldíos y estructuras en peligro en Santa Fe, Argentina. Impulsado por el Concejal Lucas Simoniello y el espacio #Encuentro.

## ¿Qué son las Caries Urbanas?

Inmuebles públicos o privados que se encuentren en gran estado de abandono y que generen un impacto negativo en el entorno urbano.

## Objetivos del Observatorio

- Fortalecer la gestión activa del uso del suelo municipal.
- Fomentar el desarrollo urbano, económico y social.
- Detectar oportunidades para intervenciones estratégicas y desalentar la especulación.

## Características Principales

- Visualización en mapa interactivo de lotes relevados.
- Filtros por estado del inmueble (Sin tratar, En tratamiento, Tratadas) y por distritos.
- Estadísticas del análisis espacial del relevamiento.
- Herramientas de medición en el mapa.
- Capas de datos: Mapa de calor, clusters, límites de distritos.

## Tecnologías Utilizadas

- **MapLibre GL JS** para el renderizado del mapa interactivo.
- **Turf.js** para el análisis espacial y operaciones geométricas.
- **GSAP** para las animaciones fluidas de la interfaz de usuario.
- HTML5, CSS3 y JavaScript Vanilla.

## ¿Cómo ejecutar el proyecto localmente?

Dado que es un proyecto frontend estático (HTML, CSS, JS), puedes ejecutarlo utilizando cualquier servidor HTTP local. Por ejemplo, usando Python o la extensión Live Server en VSCode.

### Opción 1: Python

```bash
# Si tienes Python 3 instalado, abre tu terminal en la carpeta del proyecto y ejecuta:
python -m http.server 8000
```
Luego, visita `http://localhost:8000` en tu navegador web.

### Opción 2: Node.js (http-server)

```bash
# Si tienes Node.js instalado
npx http-server
```
Visita la URL que indique la terminal, generalmente `http://localhost:8080`.

## Participación Ciudadana

Este observatorio es una herramienta ciudadana. Los vecinos de Santa Fe pueden reportar inmuebles abandonados, terrenos baldíos o estructuras con peligro de derrumbe para fortalecer la base de datos y promover una intervención temprana y fundamentar la normativa local.
