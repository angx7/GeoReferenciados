"use strict";

const express = require("express");
const ParkingsService = require("../services/parkings.service");

// Inicialización del router de Express y del servicio de estacionamientos públicos
const router = express.Router();
const service = new ParkingsService();

/**
 * GET /
 * Consulta general de estacionamientos públicos.
 * Admite parámetros query: ?search=...&type=...&status=...
 */
router.get("/", async (req, res) => {
  const filters = {
    search: req.query.search,
    type: req.query.type,
    status: req.query.status,
  };

  const parkings = await service.getAll(filters);
  res.status(200).json({
    count: parkings.length,
    data: parkings,
  });
});

/**
 * GET /geojson
 * Serializa los estacionamientos en estructura estándar GeoJSON FeatureCollection.
 * Definida con anterioridad a la ruta parametrizada /:id.
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
 * Retorna la información detallada de un estacionamiento dado su ID.
 * Emite 404 mediante AppError si no se encuentra.
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const parking = await service.getById(id);
  res.status(200).json({
    data: parking,
  });
});

module.exports = router;
