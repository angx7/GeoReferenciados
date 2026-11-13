"use strict";

const app = require("./app");
const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log("");
  console.log("===============================");
  console.log("API DE INCIDENTES URBANOS");
  console.log("===============================");
  console.log(`Servidor: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Datos: http://localhost:${PORT}/api/incidents`);
  console.log(`GeoJSON: http://localhost:${PORT}/api/incidents/geojson`);
  console.log("===============================");
  console.log("");
});

// CIERRE CONTROLADO (Ctrl + C o cuando el sistema detiene el proceso)
function shutdown(signal) {
  console.log(`\nSe recibió ${signal}. Cerrando servidor...`);

  server.close(() => {
    console.log("Servidor cerrado correctamente.");
    process.exit(0);
  });
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
