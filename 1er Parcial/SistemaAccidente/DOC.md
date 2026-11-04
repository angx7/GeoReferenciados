# REPORTE DE PRÁCTICA: NUEVAS ENTIDADES Y OPERACIONES CRUD EN BACKEND

---

## Portada Institucional

* **Institución:** Universidad / Instituto Tecnológico
* **Carrera:** Ingeniería en Sistemas Computacionales / Tecnologías de la Información
* **Asignatura:** Sistemas de Información Georreferenciados (7mo Semestre - 1er Parcial)
* **Nombre de la Práctica:** Nuevas Entidades y Operaciones CRUD (Crear, Actualizar Parcialmente y Borrar) en Backend Georreferenciado
* **Proyecto:** Sistema de Monitoreo Urbano e Incidentes Georreferenciados
* **Ubicación de Estudio:** León, Guanajuato, México
* **Fecha:** Octubre 2026

---

## 1. Introducción

Continuando con el desarrollo de la aplicación para el monitoreo de incidentes urbanos en León, Guanajuato, en esta etapa nos enfocamos en crear y completar el backend que alimentará y dará soporte a toda la plataforma que diseñamos previamente.

El objetivo es centralizar la información en un servidor para que el mapa y los formularios no dependan de datos aislados. Además de conectar los incidentes que ya teníamos, enriquecimos la aplicación agregando cuatro nuevas entidades importantes para la ciudad: hospitales, estaciones de emergencia, cámaras de videovigilancia y estacionamientos públicos.

Con esto, cada una de las cinco entidades cuenta con sus propias rutas para consultar información, aplicar filtros de búsqueda por tipo o estado, entregar las coordenadas en formato GeoJSON listo para Leaflet, y ejecutar las operaciones completas de **creación (`POST /`), actualización parcial (`PATCH /:id`) y eliminación (`DELETE /:id`)**, logrando un sistema completo y funcional.

---

## 2. Entidades Seleccionadas y Especificaciones Técnicas

De acuerdo con la tabla provista en los requerimientos de la práctica, se seleccionaron las siguientes cuatro entidades urbanas adicionales a `incidents`:

| Entidad | Ruta Base | Prefijo ID | Tipos Permitidos (`type`) | Estados Permitidos (`status`) | Campo Numérico |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Incidentes urbanos** | `/api/incidents` | `INC-` | `bache`, `alumbrado`, `basura`, `fuga`, `accidente` | `pendiente`, `atendido` | N/A |
| **Hospitales y clínicas** | `/api/hospitals` | `HOSP-` | `hospital`, `clinica`, `cruz_roja` | `operando`, `saturado`, `cerrado` | `beds` (entero 1 a 2000) |
| **Estaciones de emergencia** | `/api/stations` | `STAT-` | `bomberos`, `policia`, `proteccion_civil` | `activa`, `inactiva` | `units` (entero 1 a 100) |
| **Cámaras de videovigilancia** | `/api/cameras` | `CAM-` | `fija`, `ptz`, `lectora_placas` | `activa`, `falla`, `mantenimiento` | `rangeMeters` (entero 10 a 500) |
| **Estacionamientos públicos** | `/api/parkings` | `PARK-` | `superficie`, `techado`, `subterraneo` | `abierto`, `lleno`, `cerrado` | `capacity` (entero 1 a 5000) |

---

## 3. Estructura del Proyecto

La arquitectura del proyecto sigue una estricta separación de responsabilidades en tres capas (**Datos Semilla -> Servicios de Negocio -> Enrutadores Express**), centralizadas por el archivo `routes/index.js`:

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
    │   ├── api.http                    # Colección de pruebas GET, POST, PATCH y DELETE
    │   └── incidents.http
    └── src/
        ├── app.js                      # Configuración de Express y middlewares
        ├── index.js                    # Punto de entrada y arranque del servidor HTTP
        ├── data/                       # Semillas de datos en memoria (León, Gto.)
        │   ├── incidents.seed.js
        │   ├── hospitals.seed.js
        │   ├── stations.seed.js
        │   ├── cameras.seed.js
        │   └── parkings.seed.js
        ├── services/                   # Lógica de negocio (getAll, getById, create, update, delete, getGeoJSON)
        │   ├── incidents.service.js
        │   ├── hospitals.service.js
        │   ├── stations.service.js
        │   ├── cameras.service.js
        │   └── parkings.service.js
        ├── routes/                     # Controladores HTTP (GET, POST, PATCH, DELETE)
        │   ├── index.js
        │   ├── incidents.router.js
        │   ├── hospitals.router.js
        │   ├── stations.router.js
        │   ├── cameras.router.js
        │   └── parkings.router.js
        ├── middlewares/
        │   └── error.handler.js        # Manejador centralizado de errores y 404
        └── utils/
            └── appError.js             # Clase para errores operacionales HTTP
```

---

## 4. Desarrollo Paso a Paso y Explicación de Cambios

### 4.1. Operaciones en la Capa de Servicios (`src/services/*.service.js`)
Siguiendo exactamente el patrón desarrollado en clase dentro de `incidents.service.js`, se implementaron los métodos `create(data)`, `update(id, changes)` y `delete(id)` en los cuatro servicios adicionales (`HospitalsService`, `StationsService`, `CamerasService` y `ParkingsService`):

1. **`create(data)` (Crear)**:
   * Utiliza `randomUUID()` del módulo nativo `node:crypto` junto con el prefijo de la entidad (`HOSP-`, `STAT-`, `CAM-`, `PARK-`).
   * Limpia cadenas con `.trim()`, convierte el atributo numérico y las coordenadas `[Number(data.longitude), Number(data.latitude)]` a número para construir el punto GeoJSON `Point`.
   * Asigna las marcas de tiempo `createdAt` y `updatedAt` con `new Date().toISOString()`, inserta el elemento en el arreglo en memoria y lo retorna.

2. **`update(id, changes)` (Actualizar parcialmente)**:
   * Busca la posición del registro con `findIndex((item) => item.id === id)`. Si retorna `-1`, lanza un `AppError(404, ...)`.
   * Conserva las coordenadas actuales (`currentLongitude`, `currentLatitude`) si no se envían nuevas coordenadas en `changes`.
   * Emplea el operador *spread* (`...currentItem`) y propagación condicional (`...(changes.campo !== undefined && { campo: ... })`) para modificar únicamente las propiedades enviadas en la petición sin perder el resto de la información.
   * Actualiza `updatedAt` a la fecha/hora actual y guarda el registro modificado en la misma posición del arreglo.

3. **`delete(id)` (Borrar)**:
   * Localiza el índice del elemento con `findIndex`. Si no existe (`index === -1`), lanza un `AppError(404, ...)`.
   * Extrae y elimina el elemento del arreglo mediante `this.<entidad>.splice(index, 1)[0]` y retorna el registro eliminado.

#### Ejemplo de implementación en `HospitalsService` (`src/services/hospitals.service.js`):
```javascript
  async create(data) {
    const coordinates =
      data.location && Array.isArray(data.location.coordinates)
        ? [
            Number(data.location.coordinates[0]),
            Number(data.location.coordinates[1]),
          ]
        : [Number(data.longitude), Number(data.latitude)];

    const newHospital = {
      id: `HOSP-${randomUUID()}`,
      name: data.name.trim(),
      type: data.type,
      status: data.status || "operando",
      description: data.description.trim(),
      beds: Number(data.beds),
      location: {
        type: "Point",
        coordinates,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.hospitals.push(newHospital);
    return newHospital;
  }

  async update(id, changes) {
    const index = this.hospitals.findIndex((hospital) => hospital.id === id);
    if (index === -1) {
      throw new AppError(
        404,
        `Hospital no encontrado/inexistente con el id: ${id}`,
      );
    }

    const currentHospital = this.hospitals[index];
    const currentLongitude = currentHospital.location.coordinates[0];
    const currentLatitude = currentHospital.location.coordinates[1];

    const updatedLongitude =
      changes.longitude !== undefined
        ? Number(changes.longitude)
        : currentLongitude;

    const updatedLatitude =
      changes.latitude !== undefined
        ? Number(changes.latitude)
        : currentLatitude;

    const updatedHospital = {
      ...currentHospital,
      ...(changes.name !== undefined && { name: changes.name.trim() }),
      ...(changes.type !== undefined && { type: changes.type }),
      ...(changes.status !== undefined && { status: changes.status }),
      ...(changes.description !== undefined && {
        description: changes.description.trim(),
      }),
      ...(changes.beds !== undefined && { beds: Number(changes.beds) }),
      location: {
        type: "Point",
        coordinates: [updatedLongitude, updatedLatitude],
      },
      updatedAt: new Date().toISOString(),
    };

    this.hospitals[index] = updatedHospital;
    return updatedHospital;
  }

  async delete(id) {
    const index = this.hospitals.findIndex((hospital) => hospital.id === id);
    if (index === -1) {
      throw new AppError(
        404,
        `Hospital no encontrado/inexistente con el id: ${id}`,
      );
    }

    const deletedHospital = this.hospitals.splice(index, 1)[0];
    return deletedHospital;
  }
```

---

### 4.2. Actualización de Enrutadores (`src/routes/*.router.js`)
En los 5 enrutadores (`incidents.router.js`, `hospitals.router.js`, `stations.router.js`, `cameras.router.js` y `parkings.router.js`) se completaron los endpoints para exponer todas las operaciones del servicio:

* `GET /`: Lista todos los registros (con filtros `search`, `type`/`category`, `status`).
* `GET /geojson`: Exporta la colección en formato `FeatureCollection` de GeoJSON.
* `GET /:id`: Obtiene un registro por su ID o devuelve `404 Not Found`.
* `POST /`: Crea un nuevo registro y devuelve código `201 Created`.
* `PATCH /:id`: Actualiza parcialmente un registro existente por su ID y devuelve `200 OK`.
* `DELETE /:id`: Elimina un registro por su ID y devuelve `200 OK` con el elemento eliminado.

```javascript
// POST / - Crear registro
router.post("/", async (req, res) => {
  const hospitalData = req.body;
  const newHospital = await service.create(hospitalData);
  res.status(201).json({
    message: "Hospital o clínica registrado exitosamente.",
    data: newHospital,
  });
});

// PATCH /:id - Actualizar parcialmente
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const changes = req.body;
  const updatedHospital = await service.update(id, changes);
  res.status(200).json({
    message: "Hospital o clínica actualizado exitosamente.",
    data: updatedHospital,
  });
});

// DELETE /:id - Eliminar registro
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const deletedHospital = await service.delete(id);
  res.status(200).json({
    message: "Hospital o clínica eliminado exitosamente.",
    data: deletedHospital,
  });
});
```

---

## 5. Pruebas de Endpoints (`backend/request/api.http`)

En el archivo `backend/request/api.http` se dejaron configuradas todas las peticiones para probar `GET`, `POST`, `PATCH` y `DELETE` sobre las 5 entidades:

| Entidad | Crear (`POST`) | Actualizar Parcial (`PATCH`) | Borrar (`DELETE`) |
| :--- | :--- | :--- | :--- |
| **Incidentes** | `POST /api/incidents` | `PATCH /api/incidents/INC-001` | `DELETE /api/incidents/INC-001` |
| **Hospitales** | `POST /api/hospitals` | `PATCH /api/hospitals/HOSP-001` | `DELETE /api/hospitals/HOSP-007` |
| **Estaciones** | `POST /api/stations` | `PATCH /api/stations/STAT-001` | `DELETE /api/stations/STAT-007` |
| **Cámaras** | `POST /api/cameras` | `PATCH /api/cameras/CAM-003` | `DELETE /api/cameras/CAM-006` |
| **Estacionamientos** | `POST /api/parkings` | `PATCH /api/parkings/PARK-004` | `DELETE /api/parkings/PARK-006` |

---

## 6. Conclusiones

1. **Consistencia en la Arquitectura:** Mantener la misma estructura vista en clase (`randomUUID`, `findIndex`, propagación condicional en `update`, `splice` en `delete` y manejo de excepciones con `AppError`) facilitó escalar el CRUD completo hacia las cuatro nuevas entidades sin duplicar lógica innecesaria.
2. **Actualizaciones Parciales Seguras (`PATCH`):** El uso de desestructuración y propagación condicional permite modificar únicamente los atributos enviados por el cliente (como cambiar el estado o la capacidad de un estacionamiento) preservando intactas sus coordenadas GeoJSON y demás propiedades.
3. **Preparación para Integración con Leaflet:** Con los métodos de lectura, creación, edición parcial y borrado activos en las cinco entidades, el backend cuenta con todo lo necesario para sincronizarse en tiempo real con el mapa interactivo del frontend.
