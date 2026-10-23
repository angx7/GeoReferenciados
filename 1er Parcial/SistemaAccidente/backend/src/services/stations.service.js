"use strict";

const seedStations = require("../data/stations.seed");
const AppError = require("../utils/appError");

/**
 * Servicio para la gestión de Estaciones de Emergencia (Bomberos, Policía, Protección Civil).
 * Implementa consultas con filtros dinámicos, búsqueda por ID y exportación en GeoJSON.
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
