"use strict";

const { randomUUID } = require("node:crypto");

const seedIncidents = require("../data/incidents.seed");
const AppError = require("../utils/appError");

class IncidentsService {
  constructor() {
    this.incidents = structuredClone(seedIncidents);
  }

  // Obtener todos y filtrar

  async getAll(filters = {}) {
    const { search = "", category = "all", status = "all" } = filters;

    let result = [...this.incidents];

    const normalizedSearch = this.normalizeText(search);

    if (normalizedSearch) {
      result = result.filter((incident) => {
        const seaarchableContent = this.normalizeText(
          `${incident.title} ${incident.description} ${incident.category}`,
        );

        return seaarchableContent.includes(normalizedSearch);
      });
    }

    if (category !== "all") {
      result = result.filter((incident) => incident.category === category);
    }

    if (status !== "all") {
      result = result.filter((incident) => incident.status === status);
    }

    // Los más recientes aparecen primero
    result.sort(
      (first, second) => new Date(second.createdAt) - new Date(first.createdAt),
    );

    return result;
  }

  async getById(id) {
    const incident = this.incidents.find((incident) => incident.id === id);
    if (!incident) {
      throw new AppError(404, "Incidente no encontrado/inexistente");
    }
    return incident;
  }

  async create(data) {
    const newIncident = {
      id: `INC-${randomUUID()}`,
      title: data.title.trim(),
      category: data.category,
      description: data.description.trim(),
      status: "pendiente",
      location: {
        type: "Point",
        coordinates: [Number(data.longitude), Number(data.latitude)],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.incidents.push(newIncident);
    return newIncident;
  }

  async update(id, changes) {
    const index = this.incidents.findIndex((incident) => incident.id === id);
    if (index === -1) {
      throw new AppError(
        404,
        `Incidente no encontrado/inexistente con el id: ${id}`,
      );
    }
    const currentIncident = this.incidents[index];
    const currentLongitude = currentIncident.location.coordinates[0];
    const currentLatitude = currentIncident.location.coordinates[1];

    const updatedLongitude =
      changes.longitude !== undefined
        ? Number(changes.longitude)
        : currentLongitude;

    const updatedLatitude =
      changes.latitude !== undefined
        ? Number(changes.latitude)
        : currentLatitude;

    const updatedIncident = {
      ...currentIncident,
      ...(changes.title !== undefined && { title: changes.title.trim() }),
      ...(changes.category !== undefined && { category: changes.category }),
      ...(changes.description !== undefined && {
        description: changes.description.trim(),
      }),
      ...(changes.status !== undefined && { status: changes.status }),
      location: {
        type: "Point",
        coordinates: [updatedLongitude, updatedLatitude],
      },
      updatedAt: new Date().toISOString(),
    };

    this.incidents[index] = updatedIncident;
    return updatedIncident;
  }

  async delete(id) {
    const index = this.incidents.findIndex((incident) => incident.id === id);
    if (index === -1) {
      throw new AppError(
        404,
        `Incidente no encontrado/inexistente con el id: ${id}`,
      );
    }
    const deletedIncident = this.incidents.splice(index, 1)[0];
    return deletedIncident;
  }

  async getGeoJSON(filters = {}) {
    const incidents = await this.getAll(filters);
    return {
      type: "FeatureCollection",
      features: incidents.map((incident) => ({
        type: "Feature",
        properties: {
          id: incident.id,
          title: incident.title,
          category: incident.category,
          description: incident.description,
          status: incident.status,
          createdAt: incident.createdAt,
          updatedAt: incident.updatedAt,
        },
        geometry: incident.location,
      })),
    };
  }

  normalizeText(value) {
    return String(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }
}

module.exports = IncidentsService;
