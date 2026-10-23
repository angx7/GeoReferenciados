"use strict";

const express = require("express");
const StationsService = require("../services/stations.service");

// Inicialización del router de Express y del servicio de estaciones de emergencia
const router = express.Router();
const service = new StationsService();

/**
 * GET /
 * Obtiene el catálogo de estaciones de emergencia.
 * Soporta filtros en query string: ?search=...&type=...&status=...
 */
router.get("/", async (req, res) => {
  const filters = {
    search: req.query.search,
    type: req.query.type,
    status: req.query.status,
  };

  const stations = await service.getAll(filters);
  res.status(200).json({
    count: stations.length,
    data: stations,
  });
});

/**
 * GET /geojson
 * Retorna las estaciones en estándar GeoJSON FeatureCollection.
 * Ubicada antes de /:id para evitar colisiones de enrutamiento con el parámetro id.
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
 * Retorna la información de una estación de emergencia específica.
 * Lanza AppError con código 404 si el ID no corresponde a ningún elemento.
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const station = await service.getById(id);
  res.status(200).json({
    data: station,
  });
});

module.exports = router;
