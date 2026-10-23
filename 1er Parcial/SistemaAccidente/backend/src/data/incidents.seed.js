"use strict";

// Creación de arreglo de incidentes
/**
 * Seed data para la entidad Incidentes Viales y Urbanos en León, Guanajuato.
 * Cumple con los campos requeridos:
 * - id: Identificador único alfanumérico del reporte (ej. INC-XXX).
 * - title: Título breve descriptivo del incidente.
 * - category: 'bache' | 'choque' | 'semaforo_apagado' | 'inundacion' | 'alcantarilla_abierta'.
 * - description: Detalle informativo sobre la afectación vial o evento.
 * - status: 'pendiente' | 'en_atencion' | 'resuelto' | 'cancelado'.
 * - location: Objeto GeoJSON de tipo Point con coordenadas [longitud, latitud].
 * - createdAt / updatedAt: Marcas de tiempo de creación y actualización en formato ISO 8601.
 */
const incidentes = [
  {
    id: "INC-011",
    title: "Bache frente a la universidad",
    category: "bache",
    description: "Bache profundo que dificulta el paso de vehiculos",
    status: "pendiente",
    location: {
      type: "Point",
      coordinates: [-101.6812, 21.1248],
    },
    createdAt: "2026-01-15T12:00:000Z",
    updatedAt: "2026-01-15T12:00:000Z",
  },
  {
    id: "INC-012",
    title: "Luminaria sin funcionar en el cruce",
    category: "alumbrado",
    description:
      "Poste de luz apagado desde hace tres días, la zona es muy oscura por la noche",
    status: "pendiente",
    location: {
      type: "Point",
      coordinates: [-101.675, 21.1305],
    },
    createdAt: "2026-01-16T12:00:000Z",
    updatedAt: "2026-01-16T12:00:000Z",
  },
  {
    id: "INC-013",
    title: "Acumulación de basura en esquina",
    category: "basura",
    description:
      "Bolsas de basura rotas dejadas en la banqueta que atraen fauna nociva",
    status: "atendido", // Ajustado para coincidir con el HTML
    location: {
      type: "Point",
      coordinates: [-101.6901, 21.119],
    },
    createdAt: "2026-01-17T12:00:000Z",
    updatedAt: "2026-01-17T12:00:000Z",
  },
  {
    id: "INC-017",
    title: "Se rompio la tubería de agua en la calle principal",
    category: "fuga",
    description:
      "Se ha reportado una fuga de agua en la calle principal que ha dejado sin suministro a varias casas",
    status: "pendiente",
    location: {
      type: "Point",
      coordinates: [-101.6684, 21.125818],
    },
    createdAt: "2026-01-18T12:00:000Z",
    updatedAt: "2026-01-18T12:00:000Z",
  },
  {
    id: "INC-018",
    title: "Falta de agua en la zona norte por fuga",
    category: "fuga",
    description:
      "La zona norte no tiene acceso al agua potable desde hace una semana por una fuga en la tubería principal",
    status: "pendiente",
    location: {
      type: "Point",
      coordinates: [-101.685, 21.12],
    },
    createdAt: "2026-01-19T12:00:000Z",
    updatedAt: "2026-01-19T12:00:000Z",
  },
];

module.exports = incidentes;
