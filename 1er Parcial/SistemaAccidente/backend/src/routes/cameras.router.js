"use strict";

const express = require("express");
const CamerasService = require("../services/cameras.service");

// Inicialización del router de Express y del servicio de cámaras de videovigilancia
const router = express.Router();
const service = new CamerasService();

/**
 * GET /
 * Retorna la lista de cámaras de videovigilancia.
 * Permite filtrar por texto (search), tipo de cámara (type) y estado operativo (status).
 */
router.get("/", async (req, res) => {
  const filters = {
    search: req.query.search,
    type: req.query.type,
    status: req.query.status,
  };

  const cameras = await service.getAll(filters);
  res.status(200).json({
    count: cameras.length,
    data: cameras,
  });
});

/**
 * GET /geojson
 * Devuelve las ubicaciones y atributos de las cámaras en formato GeoJSON FeatureCollection.
 * Debe colocarse previo al enrutador dinámico /:id.
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
 * Retorna los detalles de una cámara por su identificador único.
 * Si el ID no existe en la base de datos o arreglo en memoria, responde con status 404.
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const camera = await service.getById(id);
  res.status(200).json({
    data: camera,
  });
});

module.exports = router;
