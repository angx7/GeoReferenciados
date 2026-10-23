"use strict";

const express = require("express");
const HospitalsService = require("../services/hospitals.service");

// Inicialización del router de Express y de la instancia del servicio
const router = express.Router();
const service = new HospitalsService();

/**
 * GET /
 * Obtiene el listado completo de hospitales y clínicas.
 * Soporta parámetros query para filtrado opcional: ?search=...&type=...&status=...
 */
router.get("/", async (req, res) => {
  const filters = {
    search: req.query.search,
    type: req.query.type,
    status: req.query.status,
  };

  const hospitals = await service.getAll(filters);
  res.status(200).json({
    count: hospitals.length,
    data: hospitals,
  });
});

/**
 * GET /geojson
 * Retorna las ubicaciones de los hospitales en formato GeoJSON FeatureCollection.
 * Debe definirse ANTES de /:id para evitar que Express interprete 'geojson' como parámetro de ID.
 */
router.get("/geojson", async (req, res) => {
  const filters = {
    search: req.query.search,
    type: req.query.type,
    status: req.query.status,
  };

  const geoJSON = await service.getGeoJSON(filters);
  res.status(200).json(geoJSON);
});

/**
 * GET /:id
 * Retorna el detalle de un hospital a partir de su ID.
 * Si no existe, el servicio lanza un AppError (404) que es interceptado por el middleware de errores.
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const hospital = await service.getById(id);
  res.status(200).json({
    data: hospital,
  });
});

module.exports = router;
