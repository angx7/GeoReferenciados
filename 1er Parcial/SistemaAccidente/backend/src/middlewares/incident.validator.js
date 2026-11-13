"use strict";

const AppError = require("../utils/appError");

const ALLOWED_CATEGORIES = [
  "bache",
  "alumbrado",
  "basura",
  "fuga",
  "accidente",
];

const ALLOWED_STATUSES = ["pendiente", "atendido"];

const ALLOWED_FIELDS = [
  "title",
  "category",
  "description",
  "status",
  "latitude",
  "longitude",
];

/**
 * Función interna que ejecuta las validaciones del body para incidentes.
 */
function handleValidation(req, res, next, { partial = false } = {}) {
  const errors = [];
  const body = req.body || {};

  // 1. Validar campos no permitidos (campos desconocidos en el payload)
  const unknownFields = Object.keys(body).filter(
    (field) => !ALLOWED_FIELDS.includes(field),
  );
  if (unknownFields.length > 0) {
    errors.push(`Campos no permitidos: ${unknownFields.join(", ")}.`);
  }

  // 2. En PATCH (partial: true), verificar que se proporcione al menos un campo permitido
  const providedFields = ALLOWED_FIELDS.filter(
    (field) => body[field] !== undefined && body[field] !== null && body[field] !== "",
  );
  if (partial && providedFields.length === 0) {
    errors.push("Debes proporcionar al menos un campo para actualizar.");
  }

  // 3. En POST (!partial), todos los campos son obligatorios
  if (!partial) {
    ALLOWED_FIELDS.forEach((field) => {
      if (
        body[field] === undefined ||
        body[field] === null ||
        body[field] === ""
      ) {
        errors.push(`El campo "${field}" es obligatorio.`);
      }
    });
  }

  // 4. Validación de 'title' (si viene en el body)
  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim().length < 4) {
      errors.push(
        'El campo "title" debe ser una cadena de texto con al menos 4 caracteres.',
      );
    } else if (body.title.trim().length > 80) {
      errors.push(
        'El campo "title" debe ser una cadena de texto con no más de 80 caracteres.',
      );
    }
  }

  // 5. Validación de 'category' (si viene en el body)
  if (
    body.category !== undefined &&
    !ALLOWED_CATEGORIES.includes(body.category)
  ) {
    errors.push(
      `La categoría debe ser una de las siguientes: ${ALLOWED_CATEGORIES.join(", ")}.`,
    );
  }

  // 6. Validación de 'description' (si viene en el body)
  if (body.description !== undefined) {
    if (
      typeof body.description !== "string" ||
      body.description.trim().length < 10
    ) {
      errors.push(
        'El campo "description" debe ser una cadena de texto con al menos 10 caracteres.',
      );
    } else if (body.description.trim().length > 250) {
      errors.push(
        'El campo "description" debe ser una cadena de texto con no más de 250 caracteres.',
      );
    }
  }

  // 7. Validación de 'status' (si viene en el body)
  if (
    body.status !== undefined &&
    !ALLOWED_STATUSES.includes(body.status)
  ) {
    errors.push(
      `El estado debe ser: ${ALLOWED_STATUSES.join(" o ")}.`,
    );
  }

  // 8. Validación de 'latitude' (si viene en el body)
  if (body.latitude !== undefined) {
    const latitude =
      typeof body.latitude === "number"
        ? body.latitude
        : parseFloat(body.latitude);

    if (
      typeof body.latitude === "boolean" ||
      isNaN(latitude) ||
      !Number.isFinite(latitude)
    ) {
      errors.push("La latitud debe ser numérica.");
    } else if (latitude < -90 || latitude > 90) {
      errors.push("La latitud debe estar entre -90 y 90.");
    } else {
      req.body.latitude = latitude;
    }
  }

  // 9. Validación de 'longitude' (si viene en el body)
  if (body.longitude !== undefined) {
    const longitude =
      typeof body.longitude === "number"
        ? body.longitude
        : parseFloat(body.longitude);

    if (
      typeof body.longitude === "boolean" ||
      isNaN(longitude) ||
      !Number.isFinite(longitude)
    ) {
      errors.push("La longitud debe ser numérica.");
    } else if (longitude < -180 || longitude > 180) {
      errors.push("La longitud debe estar entre -180 y 180.");
    } else {
      req.body.longitude = longitude;
    }
  }

  // Si hay errores acumulados, invocamos next con AppError(400)
  if (errors.length > 0) {
    return next(
      new AppError(400, "La información enviada no es válida.", errors),
    );
  }

  next();
}

/**
 * Middleware para validar el payload de incidentes (POST o PATCH).
 * Permite usarse directamente como middleware o como fábrica con opciones { partial: true/false }.
 */
function validateIncidentPayload(optionsOrReq, resOrOptions, maybeNext) {
  // Si fue llamado directamente como middleware de Express: (req, res, next)
  if (typeof maybeNext === "function") {
    return handleValidation(optionsOrReq, resOrOptions, maybeNext, {
      partial: false,
    });
  }

  // Si fue llamado como fábrica: validateIncidentPayload({ partial: true })
  const { partial = false } = optionsOrReq || {};
  return function incidentPayloadValidator(req, res, next) {
    return handleValidation(req, res, next, { partial });
  };
}

/**
 * Middleware para validar parámetros de consulta (query) en GET /incidents.
 */
function validateIncidentQuery(req, res, next) {
  const { search, category, status } = req.query;
  const errors = [];

  if (search !== undefined && typeof search !== "string") {
    errors.push("El parámetro 'search' debe ser una cadena de texto.");
  }

  if (
    category !== undefined &&
    category !== "all" &&
    !ALLOWED_CATEGORIES.includes(category)
  ) {
    errors.push("La categoría de filtrado no es válida.");
  }

  if (
    status !== undefined &&
    status !== "all" &&
    !ALLOWED_STATUSES.includes(status)
  ) {
    errors.push("El estado de filtrado no es válido.");
  }

  if (errors.length > 0) {
    return next(
      new AppError(400, "Los parámetros de consulta no son válidos.", errors),
    );
  }

  next();
}

module.exports = {
  validateIncidentPayload,
  validateIncidentQuery,
  ALLOWED_CATEGORIES,
  ALLOWED_STATUSES,
};
