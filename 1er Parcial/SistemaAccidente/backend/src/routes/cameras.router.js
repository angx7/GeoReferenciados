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

/**
 * POST /
 * Registra una nueva cámara de videovigilancia en memoria.
 */
router.post("/", async (req, res) => {
  const cameraData = req.body;

  const newCamera = await service.create(cameraData);
  res.status(201).json({
    message: "Cámara de videovigilancia registrada exitosamente.",
    data: newCamera,
  });
});

/**
 * PATCH /:id
 * Actualiza parcialmente los datos de una cámara de videovigilancia existente.
 */
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const changes = req.body;

  const updatedCamera = await service.update(id, changes);
  res.status(200).json({
    message: "Cámara de videovigilancia actualizada exitosamente.",
    data: updatedCamera,
  });
});

/**
 * DELETE /:id
 * Elimina una cámara de videovigilancia existente por su ID.
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const deletedCamera = await service.delete(id);
  res.status(200).json({
    message: "Cámara de videovigilancia eliminada exitosamente.",
    data: deletedCamera,
  });
});

module.exports = router;
