"use strict";

/**
 * Seed data para la entidad Estacionamientos Públicos en León, Guanajuato.
 * Cumple con los campos requeridos:
 * - id: Identificador único.
 * - name: Nombre del estacionamiento.
 * - type: 'superficie' | 'techado' | 'subterraneo'.
 * - status: 'abierto' | 'lleno' | 'cerrado'.
 * - description: Ubicación específica, accesos y características.
 * - capacity: Capacidad total de cajones de estacionamiento (entero 1-5000).
 * - location: Objeto GeoJSON de tipo Point con coordenadas [longitud, latitud].
 * - createdAt / updatedAt: Marcas de tiempo en formato ISO.
 */
const parkings = [
  {
    id: "PARK-001",
    name: "Estacionamiento Subterráneo Plaza Principal",
    type: "subterraneo",
    status: "abierto",
    description:
      "Estacionamiento subterráneo bajo la Plaza Fundadores y Jardín Principal con acceso por calle Hidalgo.",
    capacity: 280,
    location: {
      type: "Point",
      coordinates: [-101.6841, 21.1221],
    },
    createdAt: "2026-01-10T08:00:00.000Z",
    updatedAt: "2026-01-10T08:00:00.000Z",
  },
  {
    id: "PARK-002",
    name: "Estacionamiento Poliforum León",
    type: "superficie",
    status: "abierto",
    description:
      "Gran explanada de estacionamiento para eventos, congresos y recinto ferial sobre Blvd. Francisco Villa.",
    capacity: 1500,
    location: {
      type: "Point",
      coordinates: [-101.6542, 21.1118],
    },
    createdAt: "2026-01-11T09:15:00.000Z",
    updatedAt: "2026-01-11T09:15:00.000Z",
  },
  {
    id: "PARK-003",
    name: "Estacionamiento Multinivel Techado Plaza Mayor",
    type: "techado",
    status: "abierto",
    description:
      "Estructura techada de 4 niveles con elevadores y sistema de guía de cajones vacíos.",
    capacity: 2200,
    location: {
      type: "Point",
      coordinates: [-101.6912, 21.1554],
    },
    createdAt: "2026-01-12T10:30:00.000Z",
    updatedAt: "2026-01-12T10:30:00.000Z",
  },
  {
    id: "PARK-004",
    name: "Estacionamiento Público Mercado San Juan de Dios",
    type: "superficie",
    status: "lleno",
    description:
      "Estacionamiento de superficie a un costado del tradicional barrio de San Juan de Dios y templo.",
    capacity: 85,
    location: {
      type: "Point",
      coordinates: [-101.6775, 21.1172],
    },
    createdAt: "2026-01-13T11:00:00.000Z",
    updatedAt: "2026-01-13T11:00:00.000Z",
  },
  {
    id: "PARK-005",
    name: "Estacionamiento Central de Autobuses León",
    type: "techado",
    status: "abierto",
    description:
      "Estacionamiento techado de corta y larga estancia frente a la terminal terrestre de autobuses.",
    capacity: 350,
    location: {
      type: "Point",
      coordinates: [-101.6631, 21.1189],
    },
    createdAt: "2026-01-14T12:45:00.000Z",
    updatedAt: "2026-01-14T12:45:00.000Z",
  },
  {
    id: "PARK-006",
    name: "Estacionamiento La Paz Centro",
    type: "superficie",
    status: "cerrado",
    description:
      "Estacionamiento privado abierto al público sobre calle Pedro Moreno, cerrado temporalmente por mantenimiento de pavimento.",
    capacity: 60,
    location: {
      type: "Point",
      coordinates: [-101.682, 21.1229],
    },
    createdAt: "2026-01-15T14:00:00.000Z",
    updatedAt: "2026-01-15T14:00:00.000Z",
  },
  {
    id: "PARK-007",
    name: "Estacionamiento Subterráneo Calzada Peatonal",
    type: "subterraneo",
    status: "abierto",
    description:
      "Cajones subterráneos bajo el corredor turístico Calzada de los Héroes con vigilancia continua.",
    capacity: 190,
    location: {
      type: "Point",
      coordinates: [-101.6738, 21.1205],
    },
    createdAt: "2026-01-16T15:30:00.000Z",
    updatedAt: "2026-01-16T15:30:00.000Z",
  },
];

module.exports = parkings;
