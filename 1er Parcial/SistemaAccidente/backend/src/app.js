"use strict";

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const routerApi = require("./routes");

const {
  notFoundHandler,
  logErrors,
  errorHandler,
} = require("./middlewares/error.handler");

const app = express();

app.use(cors());
app.use(express.json());

// Endpoint raíz con documentación de bienvenida y listado de recursos disponibles

app.get("/", (req, res) => {
  res.status(200).json({
    name: "API de Incidentes Urbanos y Entidades Georreferenciadas - León, Gto.",
    version: "1.1.0",
    endpoints: {
      health: "/api/health",
      incidents: {
        all: "GET /api/incidents",
        geojson: "GET /api/incidents/geojson",
        byId: "GET /api/incidents/:id",
        create: "POST /api/incidents",
        update: "PATCH /api/incidents/:id",
        delete: "DELETE /api/incidents/:id",
      },
      hospitals: {
        all: "GET /api/hospitals",
        geojson: "GET /api/hospitals/geojson",
        byId: "GET /api/hospitals/:id",
        create: "POST /api/hospitals",
        update: "PATCH /api/hospitals/:id",
        delete: "DELETE /api/hospitals/:id",
      },
      stations: {
        all: "GET /api/stations",
        geojson: "GET /api/stations/geojson",
        byId: "GET /api/stations/:id",
        create: "POST /api/stations",
        update: "PATCH /api/stations/:id",
        delete: "DELETE /api/stations/:id",
      },
      cameras: {
        all: "GET /api/cameras",
        geojson: "GET /api/cameras/geojson",
        byId: "GET /api/cameras/:id",
        create: "POST /api/cameras",
        update: "PATCH /api/cameras/:id",
        delete: "DELETE /api/cameras/:id",
      },
      parkings: {
        all: "GET /api/parkings",
        geojson: "GET /api/parkings/geojson",
        byId: "GET /api/parkings/:id",
        create: "POST /api/parkings",
        update: "PATCH /api/parkings/:id",
        delete: "DELETE /api/parkings/:id",
      },
    },
  });
});

// Endpoint de verificación de salud del servidor
app.use("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "El servidor esta haciendo kuchao",
    timestamp: new Date().toISOString(),
  });
});

// Registro de las rutas de la API (/api/...)
routerApi(app);

// Middlewares de manejo de errores
app.use(notFoundHandler);
app.use(logErrors);
app.use(errorHandler);

module.exports = app;
