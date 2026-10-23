"use strict";

const app = require("./app");
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
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
