"use strict";

const { randomUUID } = require("node:crypto");

const seedCameras = require("../data/cameras.seed");
const AppError = require("../utils/appError");

/**
 * Servicio para la gestión de Cámaras de Videovigilancia y Monitoreo Urbano.
 * Facilita filtros por cobertura, tipo de lente y estado operativo, creación,
 * actualización parcial, eliminación y exportación GeoJSON.
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
   * Registra una nueva cámara de videovigilancia en memoria siguiendo la estructura de clase.
   * @param {Object} data - Datos de la cámara a crear.
   * @returns {Promise<Object>} Cámara creada con su ID generado y timestamps.
   */
  async create(data) {
    const coordinates =
      data.location && Array.isArray(data.location.coordinates)
        ? [
            Number(data.location.coordinates[0]),
            Number(data.location.coordinates[1]),
          ]
        : [Number(data.longitude), Number(data.latitude)];

    const newCamera = {
      id: `CAM-${randomUUID()}`,
      name: data.name.trim(),
      type: data.type,
      status: data.status || "activa",
      description: data.description.trim(),
      rangeMeters: Number(data.rangeMeters),
      location: {
        type: "Point",
        coordinates,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.cameras.push(newCamera);
    return newCamera;
  }

  /**
   * Actualiza parcialmente los datos de una cámara de videovigilancia existente por su ID.
   * @param {string} id - Identificador de la cámara a modificar.
   * @param {Object} changes - Campos a actualizar parcialmente.
   * @throws {AppError} 404 si la cámara no existe.
   * @returns {Promise<Object>} Cámara actualizada.
   */
  async update(id, changes) {
    const index = this.cameras.findIndex((camera) => camera.id === id);
    if (index === -1) {
      throw new AppError(
        404,
        `Cámara de videovigilancia no encontrada/inexistente con el id: ${id}`,
      );
    }

    const currentCamera = this.cameras[index];
    const currentLongitude = currentCamera.location.coordinates[0];
    const currentLatitude = currentCamera.location.coordinates[1];

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

    const updatedCamera = {
      ...currentCamera,
      ...(changes.name !== undefined && { name: changes.name.trim() }),
      ...(changes.type !== undefined && { type: changes.type }),
      ...(changes.status !== undefined && { status: changes.status }),
      ...(changes.description !== undefined && {
        description: changes.description.trim(),
      }),
      ...(changes.rangeMeters !== undefined && {
        rangeMeters: Number(changes.rangeMeters),
      }),
      location: {
        type: "Point",
        coordinates: [updatedLongitude, updatedLatitude],
      },
      updatedAt: new Date().toISOString(),
    };

    this.cameras[index] = updatedCamera;
    return updatedCamera;
  }

  /**
   * Elimina una cámara de videovigilancia del arreglo en memoria a partir de su ID.
   * @param {string} id - Identificador de la cámara a borrar.
   * @throws {AppError} 404 si la cámara no existe.
   * @returns {Promise<Object>} Cámara eliminada.
   */
  async delete(id) {
    const index = this.cameras.findIndex((camera) => camera.id === id);
    if (index === -1) {
      throw new AppError(
        404,
        `Cámara de videovigilancia no encontrada/inexistente con el id: ${id}`,
      );
    }

    const deletedCamera = this.cameras.splice(index, 1)[0];
    return deletedCamera;
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
