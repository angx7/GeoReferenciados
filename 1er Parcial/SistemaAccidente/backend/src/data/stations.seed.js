"use strict";

/**
 * Seed data para la entidad Estaciones de Emergencia en León, Guanajuato.
 * Cumple con los campos requeridos:
 * - id: Identificador único.
 * - name: Nombre de la estación o base operativa.
 * - type: 'bomberos' | 'policia' | 'proteccion_civil'.
 * - status: 'activa' | 'inactiva'.
 * - description: Descripción de la cobertura, cuadrante y equipamiento.
 * - units: Número entero de unidades vehiculares asignadas (1-100).
 * - location: Objeto GeoJSON de tipo Point con coordenadas [longitud, latitud].
 * - createdAt / updatedAt: Marcas de tiempo en formato ISO.
 */
const stations = [
  {
    id: "STAT-001",
    name: "Estación Central de Bomberos No. 1",
    type: "bomberos",
    status: "activa",
    description:
      "Base central del Heroico Cuerpo de Bomberos de León, equipada con motobombas, unidades cisterna y ambulancia.",
    units: 8,
    location: {
      type: "Point",
      coordinates: [-101.6881, 21.1293],
    },
    createdAt: "2026-01-10T08:30:00.000Z",
    updatedAt: "2026-01-10T08:30:00.000Z",
  },
  {
    id: "STAT-002",
    name: "Estación de Bomberos No. 3",
    type: "bomberos",
    status: "activa",
    description:
      "Subestación de bomberos encargada de brindar respuesta rápida en la zona norte y corredor campestre de León.",
    units: 5,
    location: {
      type: "Point",
      coordinates: [-101.65619, 21.147148],
    },
    createdAt: "2026-01-11T09:00:00.000Z",
    updatedAt: "2026-01-11T09:00:00.000Z",
  },
  {
    id: "STAT-003",
    name: "Estación de Bomberos No. 6 (Zona Sur)",
    type: "bomberos",
    status: "activa",
    description:
      "Base operativa sur con cobertura hacia Blvd. Delta, Blvd. Aeropuerto e industrias de la salida a Silao.",
    units: 6,
    location: {
      type: "Point",
      coordinates: [-101.6115, 21.0854],
    },
    createdAt: "2026-01-12T10:00:00.000Z",
    updatedAt: "2026-01-12T10:00:00.000Z",
  },
  {
    id: "STAT-004",
    name: "Dirección General de Policía Municipal y Policía Vial (Cepol Poniente)",
    type: "policia",
    status: "activa",
    description:
      "Sede central de seguridad pública y vialidad de León con parque vehicular de patrullas y motocicletas operativas.",
    units: 45,
    location: {
      type: "Point",
      coordinates: [-101.6492, 21.1523],
    },
    createdAt: "2026-01-13T11:15:00.000Z",
    updatedAt: "2026-01-13T11:15:00.000Z",
  },
  {
    id: "STAT-005",
    name: "Comisaría de Policía Delegación San Juan Bosco",
    type: "policia",
    status: "activa",
    description:
      "Delegación policial de respuesta táctica en el sector poniente con unidades de vigilancia comunitaria.",
    units: 20,
    location: {
      type: "Point",
      coordinates: [-101.716901, 21.132153],
    },
    createdAt: "2026-01-14T12:30:00.000Z",
    updatedAt: "2026-01-14T12:30:00.000Z",
  },
  {
    id: "STAT-006",
    name: "Base Operativa Central de Protección Civil León",
    type: "proteccion_civil",
    status: "activa",
    description:
      "Centro de operaciones para gestión de riesgos, contingencias climáticas y rescate urbano en el municipio.",
    units: 12,
    location: {
      type: "Point",
      coordinates: [-101.6605, 21.1032],
    },
    createdAt: "2026-01-15T13:45:00.000Z",
    updatedAt: "2026-01-15T13:45:00.000Z",
  },
  {
    id: "STAT-007",
    name: "Módulo de Seguridad y Vigilancia Parque Hidalgo",
    type: "policia",
    status: "inactiva",
    description:
      "Módulo de proximidad social actualmente inactivo por mantenimiento mayor e integración al C4.",
    units: 2,
    location: {
      type: "Point",
      coordinates: [-101.693, 21.1301],
    },
    createdAt: "2026-01-16T15:00:00.000Z",
    updatedAt: "2026-01-16T15:00:00.000Z",
  },
];

module.exports = stations;
