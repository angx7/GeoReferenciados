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

/**
 * POST /
 * Registra un nuevo estacionamiento público en memoria.
 */
router.post("/", async (req, res) => {
  const parkingData = req.body;

  const newParking = await service.create(parkingData);
  res.status(201).json({
    message: "Estacionamiento público registrado exitosamente.",
    data: newParking,
  });
});

/**
 * PATCH /:id
 * Actualiza parcialmente los datos de un estacionamiento público existente.
 */
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const changes = req.body;

  const updatedParking = await service.update(id, changes);
  res.status(200).json({
    message: "Estacionamiento público actualizado exitosamente.",
    data: updatedParking,
  });
});

/**
 * DELETE /:id
 * Elimina un estacionamiento público existente por su ID.
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const deletedParking = await service.delete(id);
  res.status(200).json({
    message: "Estacionamiento público eliminado exitosamente.",
    data: deletedParking,
  });
});

module.exports = router;
