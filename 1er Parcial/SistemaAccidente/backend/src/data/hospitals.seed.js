"use strict";

/**
 * Seed data para la entidad Hospitales y Clínicas en León, Guanajuato.
 * Cumple con los campos requeridos:
 * - id: Identificador único.
 * - name: Nombre real del hospital o clínica.
 * - type: 'hospital' | 'clinica' | 'cruz_roja'.
 * - status: 'operando' | 'saturado' | 'cerrado'.
 * - description: Descripción del servicio o especialidades.
 * - beds: Número entero de camas disponibles (1-2000).
 * - location: Objeto GeoJSON de tipo Point con coordenadas [longitud, latitud].
 * - createdAt / updatedAt: Marcas de tiempo en formato ISO.
 */
const hospitals = [
  {
    id: "HOSP-001",
    name: "Hospital General Regional de León",
    type: "hospital",
    status: "operando",
    description:
      "Hospital público de alta especialidad con atención de urgencias 24/7 y diversas especialidades médicas.",
    beds: 250,
    location: {
      type: "Point",
      coordinates: [-101.563968, 21.05601],
    },
    createdAt: "2026-01-10T08:00:00.000Z",
    updatedAt: "2026-01-10T08:00:00.000Z",
  },
  {
    id: "HOSP-002",
    name: "Hospital Aranda de la Parra",
    type: "hospital",
    status: "operando",
    description:
      "Institución médica privada de tradición en el centro histórico, con torre médica y unidad de cuidados intensivos.",
    beds: 120,
    location: {
      type: "Point",
      coordinates: [-101.6835, 21.1232],
    },
    createdAt: "2026-01-11T09:30:00.000Z",
    updatedAt: "2026-01-11T09:30:00.000Z",
  },
  {
    id: "HOSP-003",
    name: "Cruz Roja Mexicana Delegación León",
    type: "cruz_roja",
    status: "operando",
    description:
      "Base de atención prehospitalaria, urgencias médicas, servicio de ambulancias y consulta médica general.",
    beds: 35,
    location: {
      type: "Point",
      coordinates: [-101.6548, 21.1445],
    },
    createdAt: "2026-01-12T10:15:00.000Z",
    updatedAt: "2026-01-12T10:15:00.000Z",
  },
  {
    id: "HOSP-004",
    name: "UMAE Hospital de Especialidades No. 1 IMSS (T1)",
    type: "hospital",
    status: "saturado",
    description:
      "Unidad médica de tercer nivel del IMSS con alta demanda en cirugías complejas y hospitalización regional.",
    beds: 480,
    location: {
      type: "Point",
      coordinates: [-101.6936, 21.1394],
    },
    createdAt: "2026-01-13T11:00:00.000Z",
    updatedAt: "2026-01-13T11:00:00.000Z",
  },
  {
    id: "HOSP-005",
    name: "Clínica de Medicina Familiar ISSSTE León",
    type: "clinica",
    status: "operando",
    description:
      "Clínica de atención médica ambulatoria, medicina familiar, vacunación y farmacia para derechohabientes del ISSSTE.",
    beds: 45,
    location: {
      type: "Point",
      coordinates: [-101.6591, 21.1128],
    },
    createdAt: "2026-01-14T12:00:00.000Z",
    updatedAt: "2026-01-14T12:00:00.000Z",
  },
  {
    id: "HOSP-006",
    name: "Hospital Materno Infantil de León",
    type: "hospital",
    status: "saturado",
    description:
      "Hospital público especializado en gineco-obstetricia, atención neonatal y salud reproductiva.",
    beds: 80,
    location: {
      type: "Point",
      coordinates: [-101.7145, 21.1265],
    },
    createdAt: "2026-01-15T14:20:00.000Z",
    updatedAt: "2026-01-15T14:20:00.000Z",
  },
  {
    id: "HOSP-007",
    name: "Centro Médico Quirúrgico Los Ángeles Campestre",
    type: "clinica",
    status: "cerrado",
    description:
      "Clínica ambulatoria y quirófanos para procedimientos de corta estancia, cerrada temporalmente por remodelación.",
    beds: 20,
    location: {
      type: "Point",
      coordinates: [-101.6918, 21.1512],
    },
    createdAt: "2026-01-16T16:00:00.000Z",
    updatedAt: "2026-01-16T16:00:00.000Z",
  },
];

module.exports = hospitals;
