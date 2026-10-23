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
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      incidents: {
        all: "/api/incidents",
        geojson: "/api/incidents/geojson",
      },
      hospitals: {
        all: "/api/hospitals",
        geojson: "/api/hospitals/geojson",
      },
      stations: {
        all: "/api/stations",
        geojson: "/api/stations/geojson",
      },
      cameras: {
        all: "/api/cameras",
        geojson: "/api/cameras/geojson",
      },
      parkings: {
        all: "/api/parkings",
        geojson: "/api/parkings/geojson",
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
