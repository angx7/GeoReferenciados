"use strict";

const express = require("express");
const IncidentsService = require("../services/incidents.service");
const {
  validateIncidentPayload,
  validateIncidentQuery,
} = require("../middlewares/incident.validator");

// Inicialización del router de Express y del servicio de incidentes
const router = express.Router();
const service = new IncidentsService();

/**
 * GET /
 * Obtiene la lista de incidentes urbanos aplicando filtros opcionales.
 */
router.get("/", validateIncidentQuery, async (req, res) => {
  const filters = {
    search: req.query.search,
    category: req.query.category,
    status: req.query.status,
  };

  const incidents = await service.getAll(filters);
  res.status(200).json({
    count: incidents.length,
    data: incidents,
  });
});

/**
 * GET /geojson
 * Obtiene los incidentes serializados en formato GeoJSON FeatureCollection.
 * Debe ubicarse antes de la ruta /:id para evitar conflictos con el enrutador.
 */
router.get("/geojson", validateIncidentQuery, async (req, res) => {
  const filters = {
    search: req.query.search,
    category: req.query.category,
    status: req.query.status,
  };

  const geoJSON = await service.getGeoJSON(filters);
  res.status(200).json(geoJSON);
});

/**
 * GET /:id
 * Obtiene el detalle de un incidente específico por su ID.
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const incident = await service.getById(id);
  res.status(200).json({
    data: incident,
  });
});

/**
 * POST /
 * Registra un nuevo incidente urbano en memoria (requiere todos los campos obligatorios).
 */
router.post(
  "/",
  validateIncidentPayload({ partial: false }),
  async (req, res) => {
    const incidentData = req.body;

    const newIncident = await service.create(incidentData);
    res.status(201).json({
      message: "Incidente urbano registrado exitosamente.",
      data: newIncident,
    });
  },
);

/**
 * PATCH /:id
 * Actualiza parcialmente los datos de un incidente urbano existente (partial: true).
 */
router.patch(
  "/:id",
  validateIncidentPayload({ partial: true }),
  async (req, res) => {
    const { id } = req.params;
    const changes = req.body;

    const updatedIncident = await service.update(id, changes);
    res.status(200).json({
      message: "Incidente urbano actualizado exitosamente.",
      data: updatedIncident,
    });
  },
);

/**
 * DELETE /:id
 * Elimina un incidente urbano existente por su ID.
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const deletedIncident = await service.delete(id);
  res.status(200).json({
    message: "Incidente urbano eliminado exitosamente.",
    data: deletedIncident,
  });
});

module.exports = router;
