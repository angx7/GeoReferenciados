"use strict";

const { randomUUID } = require("node:crypto");

const seedHospitals = require("../data/hospitals.seed");
const AppError = require("../utils/appError");

/**
 * Servicio para la gestión de Hospitales y Clínicas.
 * Proporciona métodos de consulta con filtros, obtención por ID, creación,
 * actualización parcial, eliminación y exportación en formato GeoJSON.
 */
class HospitalsService {
  constructor() {
    // Clonamos los datos semilla para disponer de una copia en memoria aislada
    this.hospitals = structuredClone(seedHospitals);
  }

  /**
   * Obtiene todos los hospitales aplicando filtros opcionales de búsqueda, tipo y estado.
   * @param {Object} filters - Objeto con los filtros: search, type, status.
   * @returns {Promise<Array>} Lista de hospitales ordenados por fecha de creación descendente.
   */
  async getAll(filters = {}) {
    const { search = "", type = "all", status = "all" } = filters;

    let result = [...this.hospitals];

    // Filtro de búsqueda por texto normalizado (nombre, descripción y tipo)
    const normalizedSearch = this.normalizeText(search);
    if (normalizedSearch) {
      result = result.filter((hospital) => {
        const searchableContent = this.normalizeText(
          `${hospital.name} ${hospital.description} ${hospital.type}`,
        );
        return searchableContent.includes(normalizedSearch);
      });
    }

    // Filtro por tipo de establecimiento ('hospital', 'clinica', 'cruz_roja')
    if (type && type !== "all") {
      result = result.filter((hospital) => hospital.type === type);
    }

    // Filtro por estado operativo ('operando', 'saturado', 'cerrado')
    if (status && status !== "all") {
      result = result.filter((hospital) => hospital.status === status);
    }

    // Ordenamiento por fecha de creación: los registros más recientes primero
    result.sort(
      (first, second) => new Date(second.createdAt) - new Date(first.createdAt),
    );

    return result;
  }

  /**
   * Busca un hospital específico por su identificador único.
   * @param {string} id - Identificador del hospital (ej. HOSP-001).
   * @throws {AppError} 404 si el hospital no existe.
   * @returns {Promise<Object>} Datos del hospital encontrado.
   */
  async getById(id) {
    const hospital = this.hospitals.find((item) => item.id === id);
    if (!hospital) {
      throw new AppError(
        404,
        `Hospital no encontrado/inexistente con el id: ${id}`,
      );
    }
    return hospital;
  }

  /**
   * Registra un nuevo hospital o clínica en memoria siguiendo la estructura de clase.
   * @param {Object} data - Datos del hospital a crear.
   * @returns {Promise<Object>} Hospital creado con su ID generado y timestamps.
   */
  async create(data) {
    const coordinates =
      data.location && Array.isArray(data.location.coordinates)
        ? [
            Number(data.location.coordinates[0]),
            Number(data.location.coordinates[1]),
          ]
        : [Number(data.longitude), Number(data.latitude)];

    const newHospital = {
      id: `HOSP-${randomUUID()}`,
      name: data.name.trim(),
      type: data.type,
      status: data.status || "operando",
      description: data.description.trim(),
      beds: Number(data.beds),
      location: {
        type: "Point",
        coordinates,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.hospitals.push(newHospital);
    return newHospital;
  }

  /**
   * Actualiza parcialmente los datos de un hospital existente por su ID.
   * @param {string} id - Identificador del hospital a modificar.
   * @param {Object} changes - Campos a actualizar parcialmente.
   * @throws {AppError} 404 si el hospital no existe.
   * @returns {Promise<Object>} Hospital actualizado.
   */
  async update(id, changes) {
    const index = this.hospitals.findIndex((hospital) => hospital.id === id);
    if (index === -1) {
      throw new AppError(
        404,
        `Hospital no encontrado/inexistente con el id: ${id}`,
      );
    }

    const currentHospital = this.hospitals[index];
    const currentLongitude = currentHospital.location.coordinates[0];
    const currentLatitude = currentHospital.location.coordinates[1];

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

    const updatedHospital = {
      ...currentHospital,
      ...(changes.name !== undefined && { name: changes.name.trim() }),
      ...(changes.type !== undefined && { type: changes.type }),
      ...(changes.status !== undefined && { status: changes.status }),
      ...(changes.description !== undefined && {
        description: changes.description.trim(),
      }),
      ...(changes.beds !== undefined && { beds: Number(changes.beds) }),
      location: {
        type: "Point",
        coordinates: [updatedLongitude, updatedLatitude],
      },
      updatedAt: new Date().toISOString(),
    };

    this.hospitals[index] = updatedHospital;
    return updatedHospital;
  }

  /**
   * Elimina un hospital del arreglo en memoria a partir de su ID.
   * @param {string} id - Identificador del hospital a borrar.
   * @throws {AppError} 404 si el hospital no existe.
   * @returns {Promise<Object>} Hospital eliminado.
   */
  async delete(id) {
    const index = this.hospitals.findIndex((hospital) => hospital.id === id);
    if (index === -1) {
      throw new AppError(
        404,
        `Hospital no encontrado/inexistente con el id: ${id}`,
      );
    }

    const deletedHospital = this.hospitals.splice(index, 1)[0];
    return deletedHospital;
  }

  /**
   * Transforma los hospitales filtrados en una colección GeoJSON estándar (FeatureCollection).
   * @param {Object} filters - Filtros a aplicar antes de construir el GeoJSON.
   * @returns {Promise<Object>} Objeto GeoJSON de tipo FeatureCollection.
   */
  async getGeoJSON(filters = {}) {
    const items = await this.getAll(filters);

    return {
      type: "FeatureCollection",
      features: items.map((hospital) => ({
        type: "Feature",
        properties: {
          id: hospital.id,
          name: hospital.name,
          type: hospital.type,
          status: hospital.status,
          description: hospital.description,
          beds: hospital.beds,
          createdAt: hospital.createdAt,
          updatedAt: hospital.updatedAt,
        },
        geometry: hospital.location,
      })),
    };
  }

  /**
   * Función auxiliar para limpiar y normalizar cadenas de texto eliminando acentos y espacios extras.
   * @param {string} value - Cadena a normalizar.
   * @returns {string} Cadena en minúsculas y sin acentos.
   */
  normalizeText(value = "") {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }
}

module.exports = HospitalsService;
