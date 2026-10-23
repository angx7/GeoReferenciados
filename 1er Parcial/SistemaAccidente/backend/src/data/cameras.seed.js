"use strict";

/**
 * Seed data para la entidad Cámaras de Videovigilancia en León, Guanajuato.
 * Cumple con los campos requeridos:
 * - id: Identificador único.
 * - name: Nombre descriptivo del punto de monitoreo vial o urbano.
 * - type: 'fija' | 'ptz' | 'lectora_placas'.
 * - status: 'activa' | 'falla' | 'mantenimiento'.
 * - description: Ubicación detallada y propósito de vigilancia.
 * - rangeMeters: Rango efectivo de cobertura en metros (entero 10-500).
 * - location: Objeto GeoJSON de tipo Point con coordenadas [longitud, latitud].
 * - createdAt / updatedAt: Marcas de tiempo en formato ISO.
 */
const cameras = [
  {
    id: "CAM-001",
    name: "Cámara PTZ Distribuidor Vial Benito Juárez",
    type: "ptz",
    status: "activa",
    description:
      "Domo robótico 360 grados de alta resolución para supervisión de tráfico en la intersección de Morelos y López Mateos.",
    rangeMeters: 300,
    location: {
      type: "Point",
      coordinates: [-101.6668, 21.1585],
    },
    createdAt: "2026-01-10T07:00:00.000Z",
    updatedAt: "2026-01-10T07:00:00.000Z",
  },
  {
    id: "CAM-002",
    name: "Cámara Fija Arco de la Calzada de los Héroes",
    type: "fija",
    status: "activa",
    description:
      "Cámara fija de seguridad ciudadana enfocada al corredor peatonal y acceso poniente de la Zona Centro.",
    rangeMeters: 80,
    location: {
      type: "Point",
      coordinates: [-101.6756, 21.1208],
    },
    createdAt: "2026-01-11T08:15:00.000Z",
    updatedAt: "2026-01-11T08:15:00.000Z",
  },
  {
    id: "CAM-003",
    name: "Cámara PTZ Poliforum y Complejo Feria",
    type: "ptz",
    status: "mantenimiento",
    description:
      "Cámara panorámica en Blvd. Francisco Villa y López Mateos, en proceso de calibración de zoom óptico para la temporada ferial.",
    rangeMeters: 250,
    location: {
      type: "Point",
      coordinates: [-101.6565, 21.1132],
    },
    createdAt: "2026-01-12T09:30:00.000Z",
    updatedAt: "2026-01-12T09:30:00.000Z",
  },
  {
    id: "CAM-004",
    name: "Cámara Lectora LPR Acceso Silao - León (Blvd. Aeropuerto)",
    type: "lectora_placas",
    status: "activa",
    description:
      "Cámara lectora de matrículas en pórtico carretero para detección de vehículos con reporte de robo.",
    rangeMeters: 50,
    location: {
      type: "Point",
      coordinates: [-101.5954, 21.0638],
    },
    createdAt: "2026-01-13T10:45:00.000Z",
    updatedAt: "2026-01-13T10:45:00.000Z",
  },
  {
    id: "CAM-005",
    name: "Cámara Lectora LPR Paseo de los Insurgentes",
    type: "lectora_placas",
    status: "activa",
    description:
      "Sistema de reconocimiento de placas en el acceso norponiente de la ciudad hacia Lagos de Moreno.",
    rangeMeters: 45,
    location: {
      type: "Point",
      coordinates: [-101.7205, 21.1642],
    },
    createdAt: "2026-01-14T11:20:00.000Z",
    updatedAt: "2026-01-14T11:20:00.000Z",
  },
  {
    id: "CAM-006",
    name: "Cámara Fija Glorieta Gutiérrez Nájera",
    type: "fija",
    status: "falla",
    description:
      "Punto de videovigilancia urbana en el cruce de Mariano Escobedo y Díaz Mirón, reporta corte en la transmisión de fibra óptica.",
    rangeMeters: 90,
    location: {
      type: "Point",
      coordinates: [-101.6789, 21.1167],
    },
    createdAt: "2026-01-15T12:00:00.000Z",
    updatedAt: "2026-01-15T12:00:00.000Z",
  },
  {
    id: "CAM-007",
    name: "Cámara PTZ Plaza Mayor y Blvd. Clouthier",
    type: "ptz",
    status: "activa",
    description:
      "Monitoreo perimetral comercial de alto flujo vehicular y peatonal en el acceso a Plaza Mayor.",
    rangeMeters: 220,
    location: {
      type: "Point",
      coordinates: [-101.6934, 21.1565],
    },
    createdAt: "2026-01-16T13:10:00.000Z",
    updatedAt: "2026-01-16T13:10:00.000Z",
  },
];

module.exports = cameras;
