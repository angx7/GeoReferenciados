"use strict";

const seedParkings = require("../data/parkings.seed");
const AppError = require("../utils/appError");

/**
 * Servicio para la gestión de Estacionamientos Públicos.
 * Ofrece métodos para consultar aparcamientos según tipo de infraestructura, capacidad y disponibilidad.
 */
class ParkingsService {
  constructor() {
    // Copia en memoria del catálogo de estacionamientos
    this.parkings = structuredClone(seedParkings);
  }

  /**
   * Obtiene la lista de estacionamientos con soporte para filtros de búsqueda, tipo y estado.
   * @param {Object} filters - Filtros disponibles: search, type, status.
   * @returns {Promise<Array>} Lista de estacionamientos ordenados por fecha de creación descendente.
   */
  async getAll(filters = {}) {
    const { search = "", type = "all", status = "all" } = filters;

    let result = [...this.parkings];

    // Búsqueda por texto en nombre, descripción y tipo de estacionamiento
    const normalizedSearch = this.normalizeText(search);
    if (normalizedSearch) {
      result = result.filter((parking) => {
        const searchableContent = this.normalizeText(
          `${parking.name} ${parking.description} ${parking.type}`,
        );
        return searchableContent.includes(normalizedSearch);
      });
    }

    // Filtro por tipo de instalación ('superficie', 'techado', 'subterraneo')
    if (type && type !== "all") {
      result = result.filter((parking) => parking.type === type);
    }

    // Filtro por estado del estacionamiento ('abierto', 'lleno', 'cerrado')
    if (status && status !== "all") {
      result = result.filter((parking) => parking.status === status);
    }

    // Ordenamiento por fecha de creación más reciente
    result.sort(
      (first, second) => new Date(second.createdAt) - new Date(first.createdAt),
    );

    return result;
  }

  /**
   * Busca un estacionamiento específico a partir de su ID.
   * @param {string} id - Identificador del estacionamiento (ej. PARK-001).
   * @throws {AppError} 404 si el estacionamiento no existe.
   * @returns {Promise<Object>} Datos del estacionamiento.
   */
  async getById(id) {
    const parking = this.parkings.find((item) => item.id === id);
    if (!parking) {
      throw new AppError(
        404,
        `Estacionamiento no encontrado/inexistente con el id: ${id}`,
      );
    }
    return parking;
  }

  /**
   * Transforma la lista de estacionamientos en una colección GeoJSON FeatureCollection.
   * @param {Object} filters - Filtros a aplicar antes de serializar a GeoJSON.
   * @returns {Promise<Object>} FeatureCollection GeoJSON con geometría Point y metadatos.
   */
  async getGeoJSON(filters = {}) {
    const items = await this.getAll(filters);

    return {
      type: "FeatureCollection",
      features: items.map((parking) => ({
        type: "Feature",
        properties: {
          id: parking.id,
          name: parking.name,
          type: parking.type,
          status: parking.status,
          description: parking.description,
          capacity: parking.capacity,
          createdAt: parking.createdAt,
          updatedAt: parking.updatedAt,
        },
        geometry: parking.location,
      })),
    };
  }

  /**
   * Normaliza cadenas de texto para búsquedas sin distinción de mayúsculas o tildes.
   * @param {string} value - Texto a limpiar.
   * @returns {string} Texto normalizado.
   */
  normalizeText(value = "") {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }
}

module.exports = ParkingsService;
