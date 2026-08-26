// Configuramos nuestro token de acceso a Mapbox
mapboxgl.accessToken =
  "pk.eyJ1IjoianVhbmZyOTciLCJhIjoiY2x4cnhqZGZpMWUzdTJrb2Qxd2k5Z3huYSJ9.Kp99lB1snn3xzzi26jKy4w";

// Inicializar el mapa
const map = new mapboxgl.Map({
  container: "map", // ID del contenedor del mapa
  style: "mapbox://styles/mapbox/streets-v11", // Estilo del mapa
  center: [-90, 20], // centrado para ver bien Norte y Centroamérica
  zoom: 2,
});

// Control de navegación
map.addControl(new mapboxgl.NavigationControl());

// Control adicional: pantalla completa
map.addControl(new mapboxgl.FullscreenControl());

map.on("load", function () {
  // ===== FUENTE 1: Fronteras de países (Polygon) =====
  map.addSource("countries", {
    type: "geojson",
    data: "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json",
  });

  // 1. Capa para el interior de los países (para que se vea un color de relleno)
  map.addLayer({
    id: "countries-fill",
    type: "fill",
    source: "countries",
    paint: {
      "fill-color": "#4a90d9",
      "fill-opacity": 0.15,
    },
  });

  // 2. Capa exclusiva para las fronteras
  map.addLayer({
    id: "countries-borders",
    type: "line",
    source: "countries",
    paint: {
      "line-color": "#4a90d9",
      "line-width": 2,
    },
  });

  // ===== FUENTE 2: Aeropuertos (Point) =====
  map.addSource("airports", {
    type: "geojson",
    data: "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson",
    // ---- FUNCIONALIDAD ADICIONAL: clustering ----
    // Con cluster: true, Mapbox agrupa automáticamente los puntos que están
    // cerca cuando el zoom es bajo, y los separa conforme te acercas.
    // Esto evita mostrar cientos de aeropuertos amontonados en un zoom lejano.
    cluster: true,
    clusterMaxZoom: 6, // a partir de este zoom, ya no se agrupan más
    clusterRadius: 40, // distancia en píxeles para considerar "cercano"
  });

  // Círculos que representan los cúmulos
  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "airports",
    filter: ["has", "point_count"], // solo puntos que SÍ son un cúmulo
    paint: {
      "circle-color": "#e67e22",
      "circle-opacity": 0.6,
      "circle-radius": ["step", ["get", "point_count"], 15, 20, 25, 100, 35],
    },
  });

  // Número de aeropuertos dentro de cada cúmulo
  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "airports",
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-size": 12,
    },
  });

  // Aeropuertos individuales (cuando ya no están agrupados)
  map.addLayer({
    id: "airports-layer",
    type: "circle",
    source: "airports",
    filter: ["!", ["has", "point_count"]], // puntos que NO son cúmulo
    paint: {
      "circle-radius": 4,
      "circle-color": "#e67e22",
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  });

  // ===== Popup con datos reales del GeoJSON al hacer clic en un aeropuerto =====
  map.on("click", "airports-layer", function (e) {
    const props = e.features[0].properties;
    const coordinates = e.features[0].geometry.coordinates.slice();

    const nombre = props.name || "Sin nombre";
    const codigo = props.iata_code || props.gps_code || "N/D";

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(`<strong>${nombre}</strong><br>Código: ${codigo}`)
      .addTo(map);
  });

  // Clic en un cúmulo: acerca el zoom para separarlo
  map.on("click", "clusters", function (e) {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    const clusterId = features[0].properties.cluster_id;
    map
      .getSource("airports")
      .getClusterExpansionZoom(clusterId, function (err, zoom) {
        if (err) return;
        map.easeTo({ center: features[0].geometry.coordinates, zoom: zoom });
      });
  });

  // Cambiar el cursor a "pointer" al pasar sobre aeropuertos o cúmulos
  ["airports-layer", "clusters"].forEach(function (layer) {
    map.on("mouseenter", layer, function () {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", layer, function () {
      map.getCanvas().style.cursor = "";
    });
  });

  // ===== Ruta manual (LineString) =====
  // Coordenadas escritas a mano: Aeropuerto de León (BJX) -> CDMX (MEX)
  map.addSource("route", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [-101.4805, 20.9935], // BJX - León, Guanajuato
          [-99.0721, 19.4363], // MEX - Ciudad de México
        ],
      },
    },
  });

  map.addLayer({
    id: "route-layer",
    type: "line",
    source: "route",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#e74c3c",
      "line-width": 4,
    },
  });
});

// ===== Marcador manual con popup =====
const popup = new mapboxgl.Popup({ offset: 25 }).setText(
  "León, Guanajuato - origen de la ruta de vuelo",
);

new mapboxgl.Marker({ color: "#2ec9cc" })
  .setLngLat([-101.4805, 20.9935])
  .setPopup(popup)
  .addTo(map);

// ===== Mostrar coordenadas al hacer clic en el mapa =====
const coordsDisplay = document.getElementById("coords");

map.on("click", function (e) {
  coordsDisplay.textContent =
    "Lng: " + e.lngLat.lng.toFixed(5) + ", Lat: " + e.lngLat.lat.toFixed(5);
});
