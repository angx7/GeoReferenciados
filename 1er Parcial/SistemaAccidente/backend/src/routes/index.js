"use strict";

const express = require("express");

// Importación de los routers de cada entidad
const incidentsRouter = require("./incidents.router");
const hospitalsRouter = require("./hospitals.router");
const stationsRouter = require("./stations.router");
const camerasRouter = require("./cameras.router");
const parkingsRouter = require("./parkings.router");

/**
 * Función encargada de centralizar y registrar todas las rutas de la API bajo el prefijo /api.
 * @param {express.Application} app - Instancia principal de la aplicación Express.
 */
function routerApi(app) {
  const apiRouter = express.Router();
  app.use("/api", apiRouter);

  // Registro de rutas para cada una de las 5 entidades del backend:
  // 1. Incidentes urbanos (trabajado previamente en clase)
  apiRouter.use("/incidents", incidentsRouter);

  // 2. Hospitales y clínicas
  apiRouter.use("/hospitals", hospitalsRouter);

  // 3. Estaciones de emergencia
  apiRouter.use("/stations", stationsRouter);

  // 4. Cámaras de videovigilancia
  apiRouter.use("/cameras", camerasRouter);

  // 5. Estacionamientos públicos
  apiRouter.use("/parkings", parkingsRouter);
}

module.exports = routerApi;
