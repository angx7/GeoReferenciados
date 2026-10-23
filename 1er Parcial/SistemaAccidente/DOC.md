# REPORTE DE PRÁCTICA: NUEVAS ENTIDADES EN BACKEND

---

## Portada Institucional

* **Institución:** Universidad / Instituto Tecnológico
* **Carrera:** Ingeniería en Sistemas Computacionales / Tecnologías de la Información
* **Asignatura:** Sistemas de Información Georreferenciados (7mo Semestre - 1er Parcial)
* **Nombre de la Práctica:** Nuevas Entidades en Backend Georreferenciado
* **Proyecto:** Sistema de Monitoreo Urbano e Incidentes Georreferenciados
* **Ubicación de Estudio:** León, Guanajuato, México
* **Fecha:** Octubre 2026

---

## 1. Introducción

El desarrollo de aplicaciones georreferenciadas modernas exige una arquitectura en el backend que combine la gestión de recursos mediante interfaces de programación de aplicaciones RESTful con estándares internacionales de codificación geográfica como **GeoJSON (RFC 7946)**. 

En esta práctica, se tomó como base el proyecto de backend desarrollado previamente en clase para la gestión de incidentes urbanos en la ciudad de León, Guanajuato. El objetivo principal consistió en **incorporar cuatro nuevas entidades georreferenciadas** provenientes de un catálogo de servicios e infraestructura municipal, completando así una arquitectura con **cinco entidades operativas**.

Cada entidad implementada provee una estructura de datos estandarizada, soporte para consultas flexibles mediante filtros dinámicos (`search`, `type`, `status`), control riguroso de errores a través de clases de error personalizadas (`AppError`) con códigos de estado HTTP semánticos (como el `404 Not Found`), y la capacidad de transformar los registros tabulares en colecciones GeoJSON (`FeatureCollection` con geometrías `Point` [longitud, latitud]) listas para ser consumidas por librerías cartográficas de frontend como Leaflet, Mapbox o OpenLayers.

---

## 2. Entidades Seleccionadas y Especificaciones Técnicas

De acuerdo con la tabla provista en los requerimientos de la práctica, se seleccionaron las siguientes cuatro entidades urbanas:

| Entidad | Ruta Base | Tipos Permitidos (`type`) | Estados Permitidos (`status`) | Campo Numérico y Validación |
| :--- | :--- | :--- | :--- | :--- |
| **Hospitales y clínicas** | `/api/hospitals` | `hospital`, `clinica`, `cruz_roja` | `operando`, `saturado`, `cerrado` | `beds` (entero 1 a 2000) |
| **Estaciones de emergencia** | `/api/stations` | `bomberos`, `policia`, `proteccion_civil` | `activa`, `inactiva` | `units` (entero 1 a 100) |
| **Cámaras de videovigilancia** | `/api/cameras` | `fija`, `ptz`, `lectora_placas` | `activa`, `falla`, `mantenimiento` | `rangeMeters` (entero 10 a 500) |
| **Estacionamientos públicos** | `/api/parkings` | `superficie`, `techado`, `subterraneo` | `abierto`, `lleno`, `cerrado` | `capacity` (entero 1 a 5000) |

> **Nota:** Junto con la entidad `incidents` (`/api/incidents`) existente, el sistema dispone de un total de **5 entidades completas**.

### Estructura Canónica de Cada Registro
Todos los registros en los datos semilla de las entidades contienen la estructura:
```json
{
  "id": "CADENA_UNICA",
  "name": "Nombre descriptivo de la entidad",
  "type": "tipo_permitido",
  "status": "estado_permitido",
  "description": "Detalles descriptivos del punto de interés",
  "<campoNumerico>": 123,
  "location": {
    "type": "Point",
    "coordinates": [-101.6812, 21.1248]
  },
  "createdAt": "2026-01-10T08:00:00.000Z",
  "updatedAt": "2026-01-10T08:00:00.000Z"
}
```
*Las coordenadas respetan el estándar GeoJSON:* `[longitud, latitud]`, donde para León, Guanajuato la longitud se encuentra en torno a `-101.68` y la latitud en torno a `21.12`.

---

## 3. Estructura del Proyecto

La arquitectura del proyecto sigue una estricta separación de responsabilidades en tres capas fundamentales (**Datos Semilla -> Servicios de Negocio -> Enrutadores Express**), centralizadas por el archivo de rutas `routes/index.js` y expuestas por la aplicación `app.js`:

```text
SistemaAccidente/
├── DOC.md                              # Documentación y reporte técnico de cambios
├── frontend/                           # Aplicación cliente con visor de mapa Leaflet
│   ├── app.js
│   ├── index.html
│   └── styles.css
└── backend/
    ├── package.json
    ├── .env
    ├── request/
    │   ├── api.http                    # Archivo de pruebas HTTP completas para REST Client
    │   └── incidents.http
    └── src/
        ├── app.js                      # Configuración de Express, middlewares y bienvenida
        ├── index.js                    # Punto de entrada y arranque del servidor HTTP
        ├── data/                       # Semillas de datos (Capas de persistencia en memoria)
        │   ├── incidents.seed.js
        │   ├── hospitals.seed.js       # [NUEVO] Semilla con 7 registros reales de León
        │   ├── stations.seed.js        # [NUEVO] Semilla con 7 registros reales de León
        │   ├── cameras.seed.js         # [NUEVO] Semilla con 7 registros reales de León
        │   └── parkings.seed.js        # [NUEVO] Semilla con 7 registros reales de León
        ├── services/                   # Lógica de negocio y transformación a GeoJSON
        │   ├── incidents.service.js    # [CORREGIDO] Corrección typo 'FeatureCollection'
        │   ├── hospitals.service.js    # [NUEVO] Servicio para hospitales
        │   ├── stations.service.js     # [NUEVO] Servicio para estaciones
        │   ├── cameras.service.js      # [NUEVO] Servicio para cámaras
        │   └── parkings.service.js     # [NUEVO] Servicio para estacionamientos
        ├── routes/                     # Controladores y rutas HTTP
        │   ├── index.js                # [MODIFICADO] Montaje de las 5 entidades en apiRouter
        │   ├── incidents.router.js     # [CORREGIDO] Invocación de getGeoJSON() en /geojson
        │   ├── hospitals.router.js     # [NUEVO] Router de hospitales
        │   ├── stations.router.js      # [NUEVO] Router de estaciones
        │   ├── cameras.router.js       # [NUEVO] Router de cámaras
        │   └── parkings.router.js      # [NUEVO] Router de estacionamientos
        ├── middlewares/
        │   └── error.handler.js        # Manejador centralizado de errores y 404
        └── utils/
            └── appError.js             # Clase para errores operacionales HTTP
```

---

## 4. Desarrollo Paso a Paso y Explicación de Cambios

### 4.1. Creación de Semillas de Datos (`src/data/*.seed.js`)
Se crearon cuatro archivos de datos semilla con coordenadas geográficas reales de la ciudad de León, Guanajuato. Cada semilla incluye al menos 6 registros reales (se incluyeron 7 por entidad), contemplando diversidad de tipos y estados:

1. **`src/data/hospitals.seed.js`**:
   * Ubicaciones reales: Hospital General Regional de León (San Carlos), Hospital Aranda de la Parra, Cruz Roja Mexicana León I, UMAE T1 del IMSS, Clínica ISSSTE Azteca, Hospital Materno Infantil y Centro Médico Campestre.
   * Atributos cubiertos: `id`, `name`, `type` (`hospital`, `clinica`, `cruz_roja`), `status` (`operando`, `saturado`, `cerrado`), `description`, `beds` (20 a 480 camas), `location` (`Point` con `[long, lat]`), `createdAt`, `updatedAt`.

2. **`src/data/stations.seed.js`**:
   * Ubicaciones reales: Estación Central de Bomberos No. 1 (Obrera), Estación de Bomberos No. 3 (Zona Norte), Estación de Bomberos No. 6 (Zona Sur), Dirección General de Policía Municipal y Policía Vial (Cepol Poniente), Comisaría San Juan Bosco, Base Central de Protección Civil (La Pradera) y Módulo Parque Hidalgo.
   * Atributos cubiertos: `id`, `name`, `type` (`bomberos`, `policia`, `proteccion_civil`), `status` (`activa`, `inactiva`), `description`, `units` (2 a 45 vehículos), `location`, `createdAt`, `updatedAt`.

3. **`src/data/cameras.seed.js`**:
   * Ubicaciones reales: Distribuidor Vial Benito Juárez, Arco de la Calzada de los Héroes, Complejo Poliforum León, Acceso Carretero Silao-León (Blvd. Aeropuerto), Acceso Carretero Insurgentes (Lagos de Moreno), Glorieta Gutiérrez Nájera y Centro Comercial Plaza Mayor.
   * Atributos cubiertos: `id`, `name`, `type` (`ptz`, `fija`, `lectora_placas`), `status` (`activa`, `falla`, `mantenimiento`), `description`, `rangeMeters` (45 a 300 metros), `location`, `createdAt`, `updatedAt`.

4. **`src/data/parkings.seed.js`**:
   * Ubicaciones reales: Estacionamiento Subterráneo Plaza Principal / Fundadores, Estacionamiento Poliforum León, Estacionamiento Multinivel Techado Plaza Mayor, Estacionamiento Superficie Barrio San Juan de Dios, Estacionamiento Techado Terminal de Autobuses, Estacionamiento Superficie Calle La Paz Centro y Estacionamiento Subterráneo Calzada de los Héroes.
   * Atributos cubiertos: `id`, `name`, `type` (`subterraneo`, `superficie`, `techado`), `status` (`abierto`, `lleno`, `cerrado`), `description`, `capacity` (60 a 2200 cajones), `location`, `createdAt`, `updatedAt`.

---

### 4.2. Implementación de la Capa de Servicios (`src/services/*.service.js`)
Cada entidad cuenta con su respectiva clase de servicio (`HospitalsService`, `StationsService`, `CamerasService`, `ParkingsService`), implementando los métodos exigidos por la práctica:

* **`constructor()`**: Inicializa una copia aislada de los datos semilla mediante `structuredClone()`, garantizando que las consultas o modificaciones no alteren la referencia original del archivo.
* **`getAll(filters = {})`**:
  * Aplica filtros opcionales recibidos por query string: `search`, `type`, `status`.
  * Realiza una búsqueda insensible a mayúsculas y acentos sobre nombre, descripción y tipo con la función `normalizeText()`.
  * Filtra por `type` y `status` si son diferentes a `'all'`.
  * Ordena los resultados por fecha de creación descendente (`createdAt`), mostrando los más recientes primero.
* **`getById(id)`**:
  * Localiza el elemento mediante su ID único.
  * Si el elemento no existe, arroja una excepción `throw new AppError(404, "<Entidad> no encontrado/inexistente con el id: ${id}")`, que se delega automáticamente al manejador de errores de Express.
* **`getGeoJSON(filters = {})`**:
  * Invoca `getAll(filters)` para obtener los elementos filtrados.
  * Mapea cada registro a una estructura GeoJSON `Feature` con sus propiedades y geometría `Point`, retornando un objeto `FeatureCollection`.
* **`normalizeText(value = "")`**:
  * Convierte cadenas a minúsculas, aplica descomposición `NFD` y elimina tildes y diacríticos con una expresión regular (`/[\u0300-\u036f]/g`).

#### Fragmento representativo del servicio (ejemplo de `HospitalsService`):
```javascript
// src/services/hospitals.service.js
"use strict";

const seedHospitals = require("../data/hospitals.seed");
const AppError = require("../utils/appError");

class HospitalsService {
  constructor() {
    this.hospitals = structuredClone(seedHospitals);
  }

  async getAll(filters = {}) {
    const { search = "", type = "all", status = "all" } = filters;
    let result = [...this.hospitals];

    const normalizedSearch = this.normalizeText(search);
    if (normalizedSearch) {
      result = result.filter((hospital) => {
        const searchableContent = this.normalizeText(
          `${hospital.name} ${hospital.description} ${hospital.type}`
        );
        return searchableContent.includes(normalizedSearch);
      });
    }

    if (type && type !== "all") {
      result = result.filter((hospital) => hospital.type === type);
    }

    if (status && status !== "all") {
      result = result.filter((hospital) => hospital.status === status);
    }

    result.sort(
      (first, second) => new Date(second.createdAt) - new Date(first.createdAt)
    );
    return result;
  }

  async getById(id) {
    const hospital = this.hospitals.find((item) => item.id === id);
    if (!hospital) {
      throw new AppError(404, `Hospital no encontrado/inexistente con el id: ${id}`);
    }
    return hospital;
  }

  async getGeoJSON(filters = {}) {
    const items = await this.getAll(filters);
    return {
      type: "FeatureCollection",
      features: items.map((hospital) => ({
        type: "Feature",
        properties: {
          id: hospital.id,
          name: hospital.name,
          type: hospital.type,
          status: hospital.status,
          description: hospital.description,
          beds: hospital.beds,
          createdAt: hospital.createdAt,
          updatedAt: hospital.updatedAt,
        },
        geometry: hospital.location,
      })),
    };
  }

  normalizeText(value = "") {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }
}

module.exports = HospitalsService;
```

---

### 4.3. Implementación de los Enrutadores (`src/routes/*.router.js`)
Se crearon los módulos de rutas correspondientes:
* `src/routes/hospitals.router.js`
* `src/routes/stations.router.js`
* `src/routes/cameras.router.js`
* `src/routes/parkings.router.js`

Cada archivo expone tres endpoints HTTP:
1. `GET /`: Devuelve `{ count: number, data: Array }` con los registros filtrados.
2. `GET /geojson`: Devuelve la estructura `FeatureCollection` GeoJSON. **Crucial:** Esta ruta se define **antes** de `GET /:id` para evitar que el enrutador de Express confunda la palabra `geojson` con un identificador dinámico.
3. `GET /:id`: Devuelve `{ data: Object }` con la información del registro solicitado, o responde con código `404` mediante `AppError` en caso de no encontrarse.

#### Fragmento representativo del router (ejemplo de `cameras.router.js`):
```javascript
// src/routes/cameras.router.js
"use strict";

const express = require("express");
const CamerasService = require("../services/cameras.service");

const router = express.Router();
const service = new CamerasService();

// GET / - Listado general con soporte de filtros
router.get("/", async (req, res) => {
  const filters = {
    search: req.query.search,
    type: req.query.type,
    status: req.query.status,
  };
  const cameras = await service.getAll(filters);
  res.status(200).json({ count: cameras.length, data: cameras });
});

// GET /geojson - GeoJSON FeatureCollection para visualizadores cartográficos
router.get("/geojson", async (req, res) => {
  const filters = {
    search: req.query.search,
    type: req.query.type,
    status: req.query.status,
  };
  const geoJSON = await service.getGeoJSON(filters);
  res.status(200).json(geoJSON);
});

// GET /:id - Detalle de un registro específico
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const camera = await service.getById(id);
  res.status(200).json({ data: camera });
});

module.exports = router;
```

---

### 4.4. Centralización de Rutas en `src/routes/index.js`
Se modificó `src/routes/index.js` para registrar los cuatro nuevos routers en `apiRouter` cumpliendo con la sintaxis exigida:
```javascript
"use strict";

const express = require("express");

// Importación de enrutadores
const incidentsRouter = require("./incidents.router");
const hospitalsRouter = require("./hospitals.router");
const stationsRouter = require("./stations.router");
const camerasRouter = require("./cameras.router");
const parkingsRouter = require("./parkings.router");

function routerApi(app) {
  const apiRouter = express.Router();
  app.use("/api", apiRouter);

  // Registro de las 5 entidades
  apiRouter.use("/incidents", incidentsRouter);
  apiRouter.use("/hospitals", hospitalsRouter);
  apiRouter.use("/stations", stationsRouter);
  apiRouter.use("/cameras", camerasRouter);
  apiRouter.use("/parkings", parkingsRouter);
}

module.exports = routerApi;
```

---

### 4.5. Mejoras en `src/app.js` y Corrección del Código Base
1. **Catálogo de Bienvenida en `GET /`**:
   Se actualizó el endpoint base de `app.js` para documentar la totalidad de los recursos disponibles de la API:
   ```json
   {
     "name": "API de Incidentes Urbanos y Entidades Georreferenciadas - León, Gto.",
     "version": "1.0.0",
     "endpoints": {
       "health": "/api/health",
       "incidents": { "all": "/api/incidents", "geojson": "/api/incidents/geojson" },
       "hospitals": { "all": "/api/hospitals", "geojson": "/api/hospitals/geojson" },
       "stations": { "all": "/api/stations", "geojson": "/api/stations/geojson" },
       "cameras": { "all": "/api/cameras", "geojson": "/api/cameras/geojson" },
       "parkings": { "all": "/api/parkings", "geojson": "/api/parkings/geojson" }
     }
   }
   ```
2. **Corrección en `incidents.router.js`**:
   Se detectó que en el endpoint `GET /geojson` de la entidad original `incidents`, se invocaba erróneamente `service.getAll(filters)` en vez de `service.getGeoJSON(filters)`. Se corrigió la llamada para que entregue una colección GeoJSON real.
3. **Corrección en `incidents.service.js`**:
   Se corrigió el nombre del tipo en la salida GeoJSON de `"FeaturedCollection"` a `"FeatureCollection"`, cumpliendo con el estándar RFC 7946.

---

## 5. Resultados y Verificación de Funcionamiento

Se implementaron pruebas automatizadas y un archivo de peticiones HTTP (`backend/request/api.http`) para verificar el correcto funcionamiento de cada endpoint.

### 5.1. Matriz de Pruebas Ejecutadas
Todas las pruebas unitarias y de integración fueron ejecutadas con éxito:

* **Hospitales y clínicas (`/api/hospitals`)**:
  * `GET /api/hospitals` -> 200 OK (7 registros, propiedades completas, camas 20-480).
  * `GET /api/hospitals/geojson` -> 200 OK (Estructura `FeatureCollection` válida).
  * `GET /api/hospitals/HOSP-001` -> 200 OK (Hospital General Regional de León).
  * `GET /api/hospitals/HOSP-999` -> 404 Not Found (`AppError`: "Hospital no encontrado/inexistente con el id: HOSP-999").
  * `GET /api/hospitals?type=clinica` -> 200 OK (Filtrado exitoso por tipo).
  * `GET /api/hospitals?status=saturado` -> 200 OK (Filtrado exitoso por estado).

* **Estaciones de emergencia (`/api/stations`)**:
  * `GET /api/stations` -> 200 OK (7 estaciones: bomberos, policía y protección civil).
  * `GET /api/stations/geojson` -> 200 OK (Geometrías `Point` en León, Gto.).
  * `GET /api/stations/STAT-001` -> 200 OK (Estación Central de Bomberos No. 1).
  * `GET /api/stations/STAT-999` -> 404 Not Found (`AppError`).

* **Cámaras de videovigilancia (`/api/cameras`)**:
  * `GET /api/cameras` -> 200 OK (7 cámaras: PTZ, fijas y lectoras LPR).
  * `GET /api/cameras/geojson` -> 200 OK (`FeatureCollection`).
  * `GET /api/cameras/CAM-001` -> 200 OK (Cámara PTZ Distribuidor Vial Benito Juárez).
  * `GET /api/cameras/CAM-999` -> 404 Not Found (`AppError`).

* **Estacionamientos públicos (`/api/parkings`)**:
  * `GET /api/parkings` -> 200 OK (7 estacionamientos: subterráneos, techados y superficie).
  * `GET /api/parkings/geojson` -> 200 OK (`FeatureCollection`).
  * `GET /api/parkings/PARK-001` -> 200 OK (Estacionamiento Subterráneo Plaza Principal).
  * `GET /api/parkings/PARK-999` -> 404 Not Found (`AppError`).

### 5.2. Ejemplo de Respuesta JSON (`GET /api/hospitals/HOSP-001`)
```json
{
  "data": {
    "id": "HOSP-001",
    "name": "Hospital General Regional de León",
    "type": "hospital",
    "status": "operando",
    "description": "Hospital público de alta especialidad con atención de urgencias 24/7 y diversas especialidades médicas.",
    "beds": 250,
    "location": {
      "type": "Point",
      "coordinates": [-101.5815, 21.0772]
    },
    "createdAt": "2026-01-10T08:00:00.000Z",
    "updatedAt": "2026-01-10T08:00:00.000Z"
  }
}
```

### 5.3. Ejemplo de Respuesta GeoJSON (`GET /api/cameras/geojson`)
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "CAM-001",
        "name": "Cámara PTZ Distribuidor Vial Benito Juárez",
        "type": "ptz",
        "status": "activa",
        "description": "Domo robótico 360 grados de alta resolución para supervisión de tráfico en la intersección de Morelos y López Mateos.",
        "rangeMeters": 300,
        "createdAt": "2026-01-10T07:00:00.000Z",
        "updatedAt": "2026-01-10T07:00:00.000Z"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-101.6668, 21.1585]
      }
    }
  ]
}
```

---

## 6. Conclusiones

1. **Modularidad y Escalabilidad:** La arquitectura por capas implementada en el backend permitió incorporar cuatro entidades complejas con rapidez y consistencia técnica, manteniendo un desacoplamiento limpio entre la fuente de datos (`seed`), la lógica de consulta y transformación (`service`) y el protocolo de comunicación (`router`).
2. **Cumplimiento de Estándares Geográficos:** La adopción rigurosa de GeoJSON (RFC 7946) con orden `[longitud, latitud]` garantiza la interoperabilidad inmediata con herramientas de mapeo web (como Leaflet en el cliente frontend) y sistemas GIS empresariales.
3. **Manejo Robusto de Errores y Calidad de Código:** La centralización del manejo de excepciones mediante `AppError` y los middlewares de Express asegura respuestas uniformes, códigos de estado HTTP precisos (200, 400, 404, 500) y previene fallos inesperados en el servidor ante consultas de identificadores inexistentes o parámetros mal formateados.
