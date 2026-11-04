"use strict";

const { randomUUID } = require("node:crypto");

const seedStations = require("../data/stations.seed");
const AppError = require("../utils/appError");

/**
 * Servicio para la gestión de Estaciones de Emergencia (Bomberos, Policía, Protección Civil).
 * Implementa consultas con filtros dinámicos, búsqueda por ID, creación,
 * actualización parcial, eliminación y exportación en GeoJSON.
 */
class StationsService {
  constructor() {
    // Clonamos los datos semilla para disponer de una copia en memoria
    this.stations = structuredClone(seedStations);
  }

  /**
   * Obtiene todas las estaciones de emergencia aplicando filtros opcionales de búsqueda, tipo y estado.
   * @param {Object} filters - Filtros disponibles: search, type, status.
   * @returns {Promise<Array>} Lista de estaciones de emergencia ordenadas cronológicamente.
   */
  async getAll(filters = {}) {
    const { search = "", type = "all", status = "all" } = filters;

    let result = [...this.stations];

    // Búsqueda por coincidencia de texto en nombre, descripción y tipo
    const normalizedSearch = this.normalizeText(search);
    if (normalizedSearch) {
      result = result.filter((station) => {
        const searchableContent = this.normalizeText(
          `${station.name} ${station.description} ${station.type}`,
        );
        return searchableContent.includes(normalizedSearch);
      });
    }

    // Filtro por tipo de corporación ('bomberos', 'policia', 'proteccion_civil')
    if (type && type !== "all") {
      result = result.filter((station) => station.type === type);
    }

    // Filtro por estado operativo ('activa', 'inactiva')
    if (status && status !== "all") {
      result = result.filter((station) => station.status === status);
    }

    // Ordenamiento por fecha de creación más reciente
    result.sort(
      (first, second) => new Date(second.createdAt) - new Date(first.createdAt),
    );

    return result;
  }

  /**
   * Obtiene una estación de emergencia según su identificador único.
   * @param {string} id - Identificador de la estación (ej. STAT-001).
   * @throws {AppError} 404 si la estación no existe.
   * @returns {Promise<Object>} Datos de la estación encontrada.
   */
  async getById(id) {
    const station = this.stations.find((item) => item.id === id);
    if (!station) {
      throw new AppError(
        404,
        `Estación de emergencia no encontrada/inexistente con el id: ${id}`,
      );
    }
    return station;
  }

  /**
   * Registra una nueva estación de emergencia en memoria siguiendo la estructura de clase.
   * @param {Object} data - Datos de la estación a crear.
   * @returns {Promise<Object>} Estación creada con su ID generado y timestamps.
   */
  async create(data) {
    const coordinates =
      data.location && Array.isArray(data.location.coordinates)
        ? [
            Number(data.location.coordinates[0]),
            Number(data.location.coordinates[1]),
          ]
        : [Number(data.longitude), Number(data.latitude)];

    const newStation = {
      id: `STAT-${randomUUID()}`,
      name: data.name.trim(),
      type: data.type,
      status: data.status || "activa",
      description: data.description.trim(),
      units: Number(data.units),
      location: {
        type: "Point",
        coordinates,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.stations.push(newStation);
    return newStation;
  }

  /**
   * Actualiza parcialmente los datos de una estación de emergencia existente por su ID.
   * @param {string} id - Identificador de la estación a modificar.
   * @param {Object} changes - Campos a actualizar parcialmente.
   * @throws {AppError} 404 si la estación no existe.
   * @returns {Promise<Object>} Estación actualizada.
   */
  async update(id, changes) {
    const index = this.stations.findIndex((station) => station.id === id);
    if (index === -1) {
      throw new AppError(
        404,
        `Estación de emergencia no encontrada/inexistente con el id: ${id}`,
      );
    }

    const currentStation = this.stations[index];
    const currentLongitude = currentStation.location.coordinates[0];
    const currentLatitude = currentStation.location.coordinates[1];

    const updatedLongitude =
      changes.longitude !== undefined
        ? Number(changes.longitude)
        : changes.location?.coordinates?.[0] !== undefined
          ? Number(changes.location.coordinates[0])
          : currentLongitude;

    const updatedLatitude =
      changes.latitude !== undefined
        ? Number(changes.latitude)
        : changes.location?.coordinates?.[1] !== undefined
          ? Number(changes.location.coordinates[1])
          : currentLatitude;

    const updatedStation = {
      ...currentStation,
      ...(changes.name !== undefined && { name: changes.name.trim() }),
      ...(changes.type !== undefined && { type: changes.type }),
      ...(changes.status !== undefined && { status: changes.status }),
      ...(changes.description !== undefined && {
        description: changes.description.trim(),
      }),
      ...(changes.units !== undefined && { units: Number(changes.units) }),
      location: {
        type: "Point",
        coordinates: [updatedLongitude, updatedLatitude],
      },
      updatedAt: new Date().toISOString(),
    };

    this.stations[index] = updatedStation;
    return updatedStation;
  }

  /**
   * Elimina una estación de emergencia del arreglo en memoria a partir de su ID.
   * @param {string} id - Identificador de la estación a borrar.
   * @throws {AppError} 404 si la estación no existe.
   * @returns {Promise<Object>} Estación eliminada.
   */
  async delete(id) {
    const index = this.stations.findIndex((station) => station.id === id);
    if (index === -1) {
      throw new AppError(
        404,
        `Estación de emergencia no encontrada/inexistente con el id: ${id}`,
      );
    }

    const deletedStation = this.stations.splice(index, 1)[0];
    return deletedStation;
  }

  /**
   * Exporta las estaciones filtradas en formato GeoJSON FeatureCollection para su representación en mapas.
   * @param {Object} filters - Filtros para seleccionar las estaciones.
   * @returns {Promise<Object>} FeatureCollection GeoJSON con geometría Point y propiedades.
   */
  async getGeoJSON(filters = {}) {
    const items = await this.getAll(filters);

    return {
      type: "FeatureCollection",
      features: items.map((station) => ({
        type: "Feature",
        properties: {
          id: station.id,
          name: station.name,
          type: station.type,
          status: station.status,
          description: station.description,
          units: station.units,
          createdAt: station.createdAt,
          updatedAt: station.updatedAt,
        },
        geometry: station.location,
      })),
    };
  }

  /**
   * Normaliza texto para facilitar comparaciones insensibles a mayúsculas y acentos.
   * @param {string} value - Texto a normalizar.
   * @returns {string} Texto limpio sin diacríticos.
   */
  normalizeText(value = "") {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }
}

module.exports = StationsService;
