"use strict";

const stations = {
    {
        id: Identificador único.
        name: Nombre de la estación o base operativa.
        type: 'bomberos' | 'policia' | 'proteccion_civil'.
        status: 'activa' | 'inactiva'.
        description: Descripción de la cobertura, cuadrante y equipamiento.
        units: Número entero de unidades vehiculares asignadas (1-100).
        location: type: "Point", coordinates: [longitud, latitud].
        createdAt / updatedAt: Marcas de tiempo en formato ISO.
    }
}

module.exports = stations;