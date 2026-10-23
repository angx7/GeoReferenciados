"use strict";

// Configuración inicial
const INITIAL_CENTER = [21.122, -101.68];
const INITIAL_ZOOM = 13;

const CATEGORY_CONFIG = {
  bache: { label: "Bache", color: "#d92d20" },
  alumbrado: { label: "Alumbrado", color: "#f79009" },
  basura: { label: "Basura", color: "#667085" },
  fuga: { label: "Fuga de agua", color: "#1570ef" },
  accidente: { label: "Accidente", color: "#7a5af8" },
};

// Creación de arreglo de incidentes
let incidentes = [
  {
    id: "INC-011",
    title: "Bache frente a la universidad",
    category: "bache",
    description: "Bache profundo que dificulta el paso de vehiculos",
    status: "pendiente",
    latitude: 21.1248,
    longitude: -101.6812,
    createdAt: "2026-01-15",
  },
  {
    id: "INC-012",
    title: "Luminaria sin funcionar en el cruce",
    category: "alumbrado",
    description:
      "Poste de luz apagado desde hace tres días, la zona es muy oscura por la noche",
    status: "pendiente",
    latitude: 21.1305,
    longitude: -101.675,
    createdAt: "2026-01-16",
  },
  {
    id: "INC-013",
    title: "Acumulación de basura en esquina",
    category: "basura",
    description:
      "Bolsas de basura rotas dejadas en la banqueta que atraen fauna nociva",
    status: "atendido", // Ajustado para coincidir con el HTML
    latitude: 21.119,
    longitude: -101.6901,
    createdAt: "2026-01-17",
  },
  {
    id: "INC-017",
    title: "Se rompio el corazón de mi profe",
    category: "fuga",
    description: "Le rompieron el cocoro",
    status: "pendiente",
    latitude: 21.125818,
    longitude: -101.6684,
    createdAt: "2026-01-18",
  },
];

// ==========================================
// REFERENCIAS DOM (CORREGIDAS PARA QUE COINCIDAN CON HTML)
// ==========================================
const incidentForm = document.getElementById("incidente-form"); // Corregido: HTML dice incidente-form
const incidentIdInput = document.getElementById("incident-id");
const titleInput = document.getElementById("title-input");
const categoryInput = document.getElementById("category-input");
const descriptionInput = document.getElementById("description-input");
const statusInput = document.getElementById("status-input");
const latitudeInput = document.getElementById("latitude-input");
const longitudeInput = document.getElementById("longitude-input");

const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const statusFilter = document.getElementById("status-filter"); // Corregido el typo satus-filter

const incidentList = document.getElementById("incidents-list"); // Corregido: HTML dice incidents-list
const emptyMessage = document.getElementById("empty-message");
const resultsCounter = document.getElementById("results-counter");

const statTotal = document.getElementById("stat-total");
const statPending = document.getElementById("stat-pending");
const statResolved = document.getElementById("stat-resolved");

const formTitle = document.getElementById("form-title");
const formModeBadge = document.getElementById("form-mode-badge");
const formMessage = document.getElementById("form-message");
const saveButton = document.getElementById("save-button");
const cancelButton = document.getElementById("cancel-button");

const fitMapButton = document.getElementById("btn-fit-map");
const coordinateIndicator = document.getElementById("coordinate-indicator");

// Ocultar botón de cancelar por defecto
cancelButton.style.display = "none";

// Inicialización del mapa
const map = L.map("map", {
  center: INITIAL_CENTER,
  zoom: INITIAL_ZOOM,
  zoomControl: true,
});

// Inicializar la capa base
const streetLayer = L.tileLayer(
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
);

const humanitarianLayer = L.tileLayer(
  "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    attribution:
      "&copy; OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team",
  },
);

streetLayer.addTo(map);

// Gestionar grupos de capas
const incidentLayer = L.layerGroup().addTo(map);
const selectionLayer = L.layerGroup().addTo(map);

const baseLayers = {
  "Mapa de Calles": streetLayer,
  "Mapa Humanitario": humanitarianLayer,
};
const overlays = {
  "Incidentes urbanos": incidentLayer,
  "Seleccion temporal": selectionLayer,
};

L.control
  .layers(baseLayers, overlays, { collapsed: false, position: "topright" })
  .addTo(map);
L.control.scale({ imperial: false, position: "bottomright" }).addTo(map);

// Leyenda
const legend = L.control({ position: "bottomleft" });
legend.onAdd = function () {
  const container = L.DomUtil.create("div", "map-legend");
  let content = "<h4>Categorias</h4>";
  Object.entries(CATEGORY_CONFIG).forEach(([key, config]) => {
    content += `
    <div class="legend-item">
      <span class="legend-color" style="background:${config.color}"></span>
      <span>${config.label}</span>
    </div>`;
  });
  container.innerHTML = content;
  return container;
};
legend.addTo(map);

// Crear evento de clic en el mapa
map.on("click", function (event) {
  const latitude = Number(event.latlng.lat.toFixed(6));
  const longitude = Number(event.latlng.lng.toFixed(6));

  latitudeInput.value = latitude;
  longitudeInput.value = longitude;

  coordinateIndicator.textContent = `Coordenadas seleccionadas: ${latitude}, ${longitude}`;
  showTemporaryMarker(latitude, longitude);
});

// Mostrar la ubicación seleccionada temporalmente en el mapa
function showTemporaryMarker(latitude, longitude) {
  selectionLayer.clearLayers();
  const temporaryMarker = L.marker([latitude, longitude], { draggable: true });

  temporaryMarker
    .bindPopup(
      `<strong>Ubicación Seleccionada</strong><br>Puedes arrastrar este marcador para ajustar la posición.`,
    )
    .addTo(selectionLayer)
    .openPopup();

  temporaryMarker.on("dragend", function (event) {
    const position = event.target.getLatLng();
    const newLatitude = Number(position.lat.toFixed(6));
    const newLongitude = Number(position.lng.toFixed(6));

    latitudeInput.value = newLatitude;
    longitudeInput.value = newLongitude;
    coordinateIndicator.textContent = `Coordenadas ajustadas: ${newLatitude}, ${newLongitude}`;
  });
}

function getFilteredIncidents() {
  const searchText = normalizeText(searchInput.value);
  const selectedCategory = categoryFilter.value;
  const selectedStatus = statusFilter.value;

  return incidentes.filter(function (incident) {
    const searchableText = normalizeText(
      `${incident.title} ${incident.description} ${incident.category}`,
    );
    const matchesSearch = searchableText.includes(searchText);
    const matchesCategory =
      selectedCategory == "all" || incident.category == selectedCategory;
    const matchesStatus =
      selectedStatus == "all" || incident.status == selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });
}

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function renderApplication() {
  const filteredIncidents = getFilteredIncidents();

  renderMapIncidents(filteredIncidents);
  renderIncidentList(filteredIncidents);
  renderStatistics(filteredIncidents);
  updateResultsCounter(filteredIncidents.length);
}

function renderMapIncidents(data) {
  incidentLayer.clearLayers();
  data.forEach(function (incident) {
    const category = CATEGORY_CONFIG[incident.category];

    const point = L.circleMarker([incident.latitude, incident.longitude], {
      radius: 9,
      color: "#ffffff",
      weight: 2,
      fillColor: category.color,
      fillOpacity: 0.95,
    });

    point.bindTooltip(incident.title, { direction: "top", offset: [0, -8] });
    point.bindPopup(createPopupContent(incident), { maxWidth: 280 });
    point.addTo(incidentLayer);
  });
}

function createPopupContent(incident) {
  const category = CATEGORY_CONFIG[incident.category];
  const container = document.createElement("div");
  container.className = "popup-content";

  const title = document.createElement("h3");
  title.textContent = incident.title;

  const categoryParagraph = document.createElement("p");
  categoryParagraph.innerHTML = `<strong>Categoria: </strong> ${category.label}`;

  const statusParagraph = document.createElement("p");
  statusParagraph.innerHTML = `<strong>Estado: </strong> ${formatStatus(incident.status)}`;

  const descriptionParagraph = document.createElement("p");
  descriptionParagraph.textContent = incident.description;

  const coordinatesParagraph = document.createElement("p");
  coordinatesParagraph.className = "coordinates-text";
  coordinatesParagraph.textContent = `${incident.latitude}, ${incident.longitude}`;

  const actions = document.createElement("div");
  actions.className = "popup-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "button button-primary button-small";
  editButton.textContent = "Editar";

  editButton.addEventListener("click", function () {
    startEditingIncident(incident.id);
    map.closePopup();
  });

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "button button-danger button-small";
  deleteButton.textContent = "Eliminar";

  deleteButton.addEventListener("click", function () {
    deleteIncident(incident.id);
    map.closePopup();
  });

  actions.append(editButton, deleteButton);
  container.append(
    title,
    categoryParagraph,
    statusParagraph,
    descriptionParagraph,
    coordinatesParagraph,
    actions,
  );

  return container;
}

function renderIncidentList(data) {
  incidentList.innerHTML = "";

  if (data.length === 0) {
    emptyMessage.removeAttribute("hidden");
  } else {
    emptyMessage.setAttribute("hidden", "");
  }

  data.forEach(function (incident) {
    const category = CATEGORY_CONFIG[incident.category];
    const card = document.createElement("article");
    card.className = "incident-card";
    card.style.setProperty("--incident-color", category.color);

    const header = document.createElement("div");
    header.className = "incident-card-header";

    const title = document.createElement("h3");
    title.textContent = incident.title;

    const statusBadge = document.createElement("span");
    statusBadge.className =
      incident.status == "pendiente"
        ? "badge badge-pending"
        : "badge badge-resolved";
    statusBadge.textContent = formatStatus(incident.status);

    header.append(title, statusBadge);

    const description = document.createElement("p");
    description.className = "incident-description";
    description.textContent = incident.description;

    const meta = document.createElement("div");
    meta.className = "incident-meta";

    const categoryBadge = document.createElement("span");
    categoryBadge.className = "badge badge-category";
    categoryBadge.textContent = category.label;

    const coordinates = document.createElement("span");
    coordinates.className = "coordinates-text";
    coordinates.textContent = `${incident.latitude}, ${incident.longitude}`;

    meta.append(categoryBadge, coordinates);

    const actions = document.createElement("div");
    actions.className = "incident-actions";

    const localeButton = document.createElement("button");
    localeButton.type = "button";
    localeButton.className = "button button-secondary button-small";
    localeButton.textContent = "Ver en Mapa";
    localeButton.addEventListener("click", () => focusIncident(incident));

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "button button-primary button-small";
    editButton.textContent = "Editar";
    editButton.addEventListener("click", () =>
      startEditingIncident(incident.id),
    );

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "button button-danger button-small";
    deleteButton.textContent = "Eliminar";
    deleteButton.addEventListener("click", () => deleteIncident(incident.id));

    actions.append(localeButton, editButton, deleteButton);
    card.append(header, description, meta, actions);

    incidentList.appendChild(card);
  });
}

function updateResultsCounter(count) {
  if (resultsCounter)
    resultsCounter.textContent = `${count} incidentes encontrados`;
}

function renderStatistics(data) {
  if (!statTotal || !statPending || !statResolved) return;
  statTotal.textContent = data.length;
  statPending.textContent = data.filter((i) => i.status === "pendiente").length;
  statResolved.textContent = data.filter((i) => i.status === "atendido").length; // Ajustado a "atendido"
}

// FUNCIÓN AUXILIAR: validateIncident()
// Valida los campos del formulario antes de crear o actualizar
function validateIncident() {
  const data = {
    title: titleInput.value.trim(),
    category: categoryInput.value,
    description: descriptionInput.value.trim(),
    status: statusInput.value,
    latitude: parseFloat(latitudeInput.value),
    longitude: parseFloat(longitudeInput.value),
  };

  if (
    !data.title ||
    !data.category ||
    !data.description ||
    isNaN(data.latitude) ||
    isNaN(data.longitude)
  ) {
    showFormMessage(
      "Completa todos los campos requeridos y selecciona una ubicación.",
      "error",
    );
    return null;
  }
  return data;
}

// 1. FUNCIÓN: createIncident(data)
// Descripción para Reporte: Genera un objeto nuevo, le asigna ID único y fecha,
// lo guarda en el arreglo global y actualiza todas las vistas.
function createIncident(data) {
  const newIncident = {
    id: generateIncidentId(),
    ...data,
    createdAt: getCurrentDate(),
  };

  incidentes.push(newIncident);
  renderApplication();
  resetForm();
  showFormMessage("Incidente registrado exitosamente", "success");
  focusIncident(newIncident);
}

// 2. FUNCION: generateIncidentId()
// Descripción para Reporte: Crea un ID uniendo el prefijo, timestamp actual y un random.
function generateIncidentId() {
  const timestamp = Date.now().toString().slice(-8);

  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `INC-${timestamp}-${randomNum}`;
}

// 3. FUNCION: getCurrentDate()
// Descripción para Reporte: Obtiene y formatea la fecha actual de JS a formato YYYY-MM-DD.
function getCurrentDate() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

// 4. FUNCION: startEditingIncident(id)
// Descripción para Reporte: Se invoca desde los botones de "Editar" en tarjetas y popups.
// Rellena el formulario con la info existente, cambia estado visual a "Edición" y ubica en el mapa.
function startEditingIncident(id) {
  const incident = incidentes.find((inc) => inc.id === id);
  if (!incident) return;

  // Cargar datos al formulario
  incidentIdInput.value = incident.id;
  titleInput.value = incident.title;
  categoryInput.value = incident.category;
  descriptionInput.value = incident.description;
  statusInput.value = incident.status;
  latitudeInput.value = incident.latitude;
  longitudeInput.value = incident.longitude;

  // Cambiar a modo edición
  formTitle.textContent = "Editar Incidente";
  formModeBadge.textContent = "Edición";
  formModeBadge.style.backgroundColor = "#f79009";
  cancelButton.style.display = "inline-block";

  focusIncident(incident);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 5. FUNCION: updateIncident(id, changes)
// Descripción para Reporte: Busca el índice del incidente, sobrescribe sus datos con
// el objeto spread (...) y actualiza el renderizado y limpia formulario.
function updateIncident(id, changes) {
  const index = incidentes.findIndex((inc) => inc.id === id);
  if (index !== -1) {
    incidentes[index] = { ...incidentes[index], ...changes };
    renderApplication();
    resetForm();
    showFormMessage("Incidente actualizado exitosamente", "success");
    focusIncident(incidentes[index]);
  }
}

// 6. FUNCION: deleteIncident(id)
// Descripción para Reporte: Pide validación por confirm(). Si es aceptada,
// filtra el arreglo para excluir el id borrado y vuelve a renderizar.
function deleteIncident(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este incidente?")) {
    incidentes = incidentes.filter((inc) => inc.id !== id);
    renderApplication();
    resetForm();
    showFormMessage("Incidente eliminado exitosamente", "success");
  }
}

// ==========================================
// FUNCIONES AUXILIARES SOLICITADAS
// ==========================================

// FUNCION AUXILIAR: resetForm()
function resetForm() {
  incidentForm.reset();
  incidentIdInput.value = "";
  formTitle.textContent = "Registrar incidente";
  formModeBadge.textContent = "Nuevo";
  formModeBadge.style.backgroundColor = "";
  cancelButton.style.display = "none";
  coordinateIndicator.textContent =
    "Haz clic en el mapa para seleccionar las coordenadas";
  selectionLayer.clearLayers();
  hideFormMessage();
}

// FUNCION AUXILIAR: showFormMessage(message, type)
function showFormMessage(message, type) {
  formMessage.textContent = message;
  formMessage.style.color = type === "success" ? "#12b76a" : "#d92d20";
  formMessage.removeAttribute("hidden");
  setTimeout(hideFormMessage, 4000);
}

// FUNCION AUXILIAR: hideFormMessage()
function hideFormMessage() {
  formMessage.setAttribute("hidden", "");
  formMessage.textContent = "";
}

// FUNCION AUXILIAR: formatStatus(status)
function formatStatus(status) {
  const mapStatus = {
    pendiente: "Pendiente",
    atendido: "Atendido",
  };
  return mapStatus[status] || status;
}

// FUNCION AUXILIAR (No pedida pero necesaria): focusIncident(incident)
function focusIncident(incident) {
  map.setView([incident.latitude, incident.longitude], 17);
  showTemporaryMarker(incident.latitude, incident.longitude);
}

// ==========================================
// EVENT LISTENERS DE FORMULARIO Y FILTROS
// ==========================================

// Eventos de Búsqueda y Filtros
searchInput.addEventListener("input", renderApplication);
categoryFilter.addEventListener("change", renderApplication);
statusFilter.addEventListener("change", renderApplication);

// Evento Cancelar Edición
cancelButton.addEventListener("click", function (e) {
  e.preventDefault();
  resetForm();
});

// Evento Ajustar Mapa
if (fitMapButton) {
  fitMapButton.addEventListener("click", () => {
    if (incidentLayer.getLayers().length > 0) {
      const group = new L.featureGroup(incidentLayer.getLayers());
      map.fitBounds(group.getBounds(), { padding: [20, 20] });
    }
  });
}

// ----------------------------------------------------------------------
// EVENTO PRINCIPAL: ENVIAR FORMULARIO (CREAR O ACTUALIZAR)
// ----------------------------------------------------------------------
incidentForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const incidentData = validateIncident();
  if (!incidentData) return;

  const editingId = incidentIdInput.value;

  if (editingId) {
    updateIncident(editingId, incidentData);
  } else {
    createIncident(incidentData);
  }
});

// Arrancar la aplicación inicial (Renderizado inicial)
renderApplication();
