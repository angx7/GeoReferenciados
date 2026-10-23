"use strict";

const seedCameras = require("../data/cameras.seed");
const AppError = require("../utils/appError");

/**
 * Servicio para la gestión de Cámaras de Videovigilancia y Monitoreo Urbano.
 * Facilita filtros por cobertura, tipo de lente y estado operativo, además de exportación GeoJSON.
 */
class CamerasService {
  constructor() {
    // Copia en memoria del catálogo inicial de cámaras
    this.cameras = structuredClone(seedCameras);
  }

  /**
   * Obtiene la lista de cámaras aplicando filtros opcionales.
   * @param {Object} filters - Filtros disponibles: search, type, status.
   * @returns {Promise<Array>} Cámaras ordenadas cronológicamente (más recientes primero).
   */
  async getAll(filters = {}) {
    const { search = "", type = "all", status = "all" } = filters;

    let result = [...this.cameras];

    // Búsqueda textual sobre nombre, descripción y tipo de cámara
    const normalizedSearch = this.normalizeText(search);
    if (normalizedSearch) {
      result = result.filter((camera) => {
        const searchableContent = this.normalizeText(
          `${camera.name} ${camera.description} ${camera.type}`,
        );
        return searchableContent.includes(normalizedSearch);
      });
    }

    // Filtro por tipo de cámara ('fija', 'ptz', 'lectora_placas')
    if (type && type !== "all") {
      result = result.filter((camera) => camera.type === type);
    }

    // Filtro por estado operativo ('activa', 'falla', 'mantenimiento')
    if (status && status !== "all") {
      result = result.filter((camera) => camera.status === status);
    }

    // Ordenamiento por fecha de creación descendente
    result.sort(
      (first, second) => new Date(second.createdAt) - new Date(first.createdAt),
    );

    return result;
  }

  /**
   * Obtiene el detalle de una cámara de videovigilancia por su ID.
   * @param {string} id - Identificador de la cámara (ej. CAM-001).
   * @throws {AppError} 404 si la cámara no se encuentra registrada.
   * @returns {Promise<Object>} Objeto con los datos de la cámara.
   */
  async getById(id) {
    const camera = this.cameras.find((item) => item.id === id);
    if (!camera) {
      throw new AppError(
        404,
        `Cámara de videovigilancia no encontrada/inexistente con el id: ${id}`,
      );
    }
    return camera;
  }

  /**
   * Genera una estructura GeoJSON FeatureCollection con las geometrías de las cámaras.
   * @param {Object} filters - Filtros para seleccionar las cámaras.
   * @returns {Promise<Object>} FeatureCollection compatible con clientes cartográficos como Leaflet o Mapbox.
   */
  async getGeoJSON(filters = {}) {
    const items = await this.getAll(filters);

    return {
      type: "FeatureCollection",
      features: items.map((camera) => ({
        type: "Feature",
        properties: {
          id: camera.id,
          name: camera.name,
          type: camera.type,
          status: camera.status,
          description: camera.description,
          rangeMeters: camera.rangeMeters,
          createdAt: camera.createdAt,
          updatedAt: camera.updatedAt,
        },
        geometry: camera.location,
      })),
    };
  }

  /**
   * Limpia cadenas de caracteres removiendo tildes y pasando a minúsculas.
   * @param {string} value - Texto de entrada.
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

module.exports = CamerasService;
