# 🗺️ Caries Urbanas · Estrategia UX/UI, Visión SIG Holística y Arquitectura de Sistema

> 📘 **Notion Master Document** | *Observatorio Urbano de Santa Fe — Proyecto Caries Urbanas*  
> 🏛️ **Impulsado por:** Bloque Encuentro · Concejal Lucas Simoniello  
> 🏷️ **Áreas:** Diseño UX/UI, Innovación Pública, Sistemas de Información Geográfica (SIG), Derecho a la Ciudad, Arquitectura Backend  
> 📌 **Estado:** Documentación Oficial / En Producción  
> 📅 **Fecha de actualización:** Julio 2026  
> 🔗 **Visor Público:** `cariesurbanas.vercel.app`

---

## 📌 1. Resumen Ejecutivo y Marco Conceptual: *"Del Pin en el Mapa al Derecho a la Ciudad"*

El proyecto **Caries Urbanas** no es solo un mapa interactivo de lugares feos o sucios; es una **plataforma geoespacial de gestión integral y política pública sobre el suelo urbano** en Santa Fe, Argentina.

```
 ┌──────────────────────────────────────────────────────────────────────────────────────────┐
 │                                LOS NÚMEROS DEL DIAGNÓSTICO                               │
 ├───────────────────────────────┬───────────────────────────────┬──────────────────────────┤
 │      363 Inmuebles            │     52% Concentrados          │    $721 Millones         │
 │      Relevados                │     en Distrito Centro        │    Deuda Municipal       │
 └───────────────────────────────┴───────────────────────────────┴──────────────────────────┘
```

### 🧠 Fundamentación Teórica y Geográfica
1. **La Especulación en el Centro Urbano (Gómez, 2011; Zárate Martín, 2012):**  
   Santa Fe se organiza en anillos socioeconómicos concéntricos. Que el **52% de las caries urbanas estén en el Distrito Centro** (donde el Reglamento de Ordenamiento Urbano - ROU habilita construcción en altura C1/C2) demuestra que la ociosidad no es casualidad: es **especulación inmobiliaria**. Como afirma Zárate Martín, la morfología urbana *"materializa la firma del poder"*; mapear el abandono es transformarlo en evidencia pública.
2. **El Suelo como Derecho Colectivo (David Harvey, 2008):**  
   *"El beneficio privado aplasta todas las demás nociones de derechos"*. El proyecto invierte esta lógica: recupera la función social del suelo ofreciendo incentivos a quienes recuperen inmuebles y sanciones firmes a quienes los abandonen.
3. **El Estado como Parte del Problema y de la Solución:**  
   Con una honestidad inédita, el relevamiento identifica que **al menos 14 inmuebles son de titularidad estatal** (Nación, Provincia, Municipio, empresas públicas). La transparencia es total: el abandono público también se expone.
4. **Infraestructura de Ciudadanía Activa (Janoschka, 2011):**  
   Frente al neoliberalismo urbano, se construyen "espacios de ciudadanía". El visor público, el formulario de denuncia y los datos abiertos no son mero adorno tecnológico, sino herramientas de empoderamiento vecinal.

---

## 🌐 2. La Mirada Holística del SIG Web: De los Puntos a la Superficie

Tradicionalmente, las iniciativas ciudadanas quedan atrapadas en mapas rígidos como Google My Maps (que solo muestran "pines"). La plataforma web **Caries Urbanas** implementa una **visión SIG holística en la web**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                        VISIÓN HOLÍSTICA DEL SIG                        │
 ├────────────────────────────────────────────────────────────────────────┤
 │  [ Capas de Base ]   ──────>  Satelital HD + Vectorial Oscuro Limpio   │
 │  [ Capas de Datos ]  ──────>  Puntos, Mapa de Calor, Clusters          │
 │  [ Capas Territoriales ] ──>  Límites de Distritos + Zonificación ROU │
 │  [ Capas Futuras ]   ──────>  Polígonos Catastrales ($m²$ y Hectáreas) │
 └────────────────────────────────────────────────────────────────────────┘
```

### 📏 El Salto UX/Político: De Puntos a Polígonos ($m^2$)
- **El límite del punto:** Un pin indica *dónde* hay una carie, pero no transmite la magnitud real del terreno.
- **El impacto del polígono:** Vincular el visor con la Infraestructura de Datos Espaciales (**IDE Municipal - Ord. 12.715**) o la capa de parcelas catastrales permite calcular la **superficie real en $m^2$**.
- **Cambio del discurso político:** El proyecto deja de decir *"tenemos 363 inmuebles abandonados"* y pasa a demostrar *"tenemos X hectáreas de suelo urbano estratégico retenidas por especulación"*.

---

## 👥 3. Modelo de Doble Propósito y UX de la Privacidad (Ley 25.326)

Para servir con eficacia al **ciudadano** y al **funcionario/técnico administrativo**, el sistema adopta una **arquitectura de doble nivel**, contemplando la **Ley 25.326 de Protección de Datos Personales**.

```
 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │                                DOS VISTAS / DOS AUDIENCIAS                              │
 ├────────────────────────────────────────────┬────────────────────────────────────────────┤
 │ 🧑‍🤝‍🧑 VISOR PÚBLICO (Ciudadano)               │ 🏛️ BACKOFFICE INTERNO (Gestión Púb.)       │
 ├────────────────────────────────────────────┼────────────────────────────────────────────┤
 │ • Mapa interactivo sin fricción           │ • Acceso autenticado por roles (Admin/Téc)│
 │ • Datos anonimizados (sin DNI/CUIT/tel)   │ • Ficha completa de titulares y deudas    │
 │ • Mapa de calor, clusters y estadísticas  │ • Gestión de expedientes e inspecciones    │
 │ • Formulario de denuncia barrial          │ • Auditoría del ciclo de vida (estado)     │
 └────────────────────────────────────────────┴────────────────────────────────────────────┘
```

### 🔒 UX & Seguridad Backend (Fuga Imposible por Diseño)
Para garantizar la privacidad sin sacrificar la agilidad UX:
1. **Separación Física en Base de Datos:** Dos esquemas SQL separados (`publico` para inmuebles/geometría y `restringido` para titulares, CUIT, DNI y contactos).
2. **Roles y Permisos DB:** El usuario público (`app_public`) solo tiene permiso `SELECT` sobre el esquema público y sobre vistas materializadas.
3. **DTOs Explícitos en Backend (NestJS):** Serialización estricta mediante `@Exclude()` por defecto. Ningún endpoint público expone datos personales.
4. **Imágenes Sensibles en S3:** Fotos privadas de inspecciones se sirven con *Presigned URLs* de corta duración tras verificación de rol.

---

## 🔄 4. UX del Ciclo de Vida del Inmueble (Máquina de Estados)

La experiencia de usuario refleja fielmente el procedimiento administrativo establecido en el proyecto de ordenanza de Lucas Simoniello:

```
  [Denuncia Ciudadana / Relevamiento]
                  │
                  ▼
         [Inspección Técnica]
                  │
                  ▼
  [Notificación al Dueño (15 días)]
                  │
                  ▼
     [Declaración de Carie Urbana]
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
 [Presenta Plan]    [Sin Respuesta (30 días)]
   (30 días)                │
        │                   ▼
        ▼           [Sanciones Progresivas]
 [Beneficios]       • Sobretasa e Impuestos
 • Suspensión       • Multas dobles
   de cobros        • Prohibición de carteles
 • Condonación      • Ejecución / Remate / Expropiación
   de multas          (Último recurso)
```

### 🎨 Sistema de Color Semántico Implementado
- 🔴 **Sin tratar (`#E85D26`):** Inmuebles calificados en abandono crítico.
- 🟡 **En tratamiento (`#F9A825`):** En proceso de notificación, inspección o plan de adecuación.
- 🟢 **Tratadas (`#34A853`):** Predios regularizados, recuperados o incorporados al Banco de Tierras.

---

## 🎨 5. Decisiones de Diseño UX/UI: ¿Qué Hicimos y Por Qué?

| Elemento UX/UI | Razón Técnica / Empírica | Solución Implementada |
| :--- | :--- | :--- |
| **Ergonomía Mobile-First** | El 80% de las consultas ciudadanas y relevamientos en calle se realizan desde teléfonos celulares. | Navegación con pulgar mediante **FABs flotantes** y modales estilo **Bottom Sheets**. |
| **Carga Cognitiva Reducida** | Los mapas con capas complejas abruman al usuario no técnico. | **Onboarding Tour** interactivo en 3 pasos que enseña a usar la app en 15 segundos. |
| **Transparencia Institucional** | Evitar sospechas de arbitrariedad en la calificación de caries. | Ficha detallada por lote con **foto real del inmueble**, dirección, distrito, ROU e ID de relevamiento. |
| **Herramienta de Medición** | El ciudadano necesita dimensionar visualmente el espacio perdido en su barrio. | Herramienta de medición en tiempo real de distancias y superficies trazables en el mapa. |
| **Fluidez y Performance** | Transmitir modernidad y rigor institucional. | Animaciones fluidas con **GSAP**, renderizado acelerado por GPU mediante **MapLibre GL**. |

---

## 🌍 6. Referentes Comparados de Políticas de Suelo

El diseño de esta herramienta se nutre de experiencias exitosas de urbanismo geoespacial:

- 🇨🇴 **Medellín (Colombia) — Urbanismo Social:** El mapa geoespacial no fue decorativo; sirvió para priorizar inversiones públicas en sectores de alta vulnerabilidad.
- 🇧🇷 **Brasil — Estatuto da Cidade (2001):** Consagró el "derecho a la ciudad" y la función social de la propiedad a nivel constitucional, inspirando el Art. 1° de la ordenanza de Santa Fe.
- 🇦🇷 **Rosario — SIPAM:** Plataforma pionera en datos espaciales abiertos de planeamiento urbano.
- ⚠️ **Buenos Aires — Puerto Madero (Contraejemplo):** Janoschka analiza cómo las corporaciones sin datos públicos abiertos prometen redistribución pero generan desposesión. La base abierta de Caries Urbanas garantiza rendición de cuentas.

---

## 🛠️ 7. Próximos Pasos en la Hoja de Ruta (Roadmap)

1. 📄 **Integración Catastral:** Gestión formal de la capa parcelaria con Catastro Municipal para pasar de puntos a polígonos exactos.
2. 📍 **Geocodificación:** Normalización de las 56 caries pendientes en planilla para llegar al 100% de los 363 inmuebles georreferenciados.
3. 📐 **Capa ROU:** Incorporación de la zonificación del Reglamento de Ordenamiento Urbano para filtros por potencial constructivo.
4. ⚙️ **Protocolo de "Carie Tratada":** Diseño de la UX para comunicar a los vecinos cuando un inmueble ha sido recuperado con éxito.
