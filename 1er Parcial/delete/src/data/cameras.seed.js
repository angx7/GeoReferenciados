"use strict";

const cameras = [
    {
        id: Identificador único.
        name: Nombre descriptivo del punto de monitoreo vial o urbano.
        type: 'fija' | 'ptz' | 'lectora_placas'.
        status: 'activa' | 'falla' | 'mantenimiento'.
        description: Ubicación detallada y propósito de vigilancia.
        rangeMeters: Rango efectivo de cobertura en metros (entero 10-500).
        location: type: "Point", coordinates: [longitud, latitud].
        createdAt / updatedAt: Marcas de tiempo en formato ISO.
    }
]

module.exports = cameras;