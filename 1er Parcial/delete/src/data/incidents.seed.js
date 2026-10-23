"use strict";

const incidents = [
    {
        id: Identificador único alfanumérico del reporte (ej. INC-XXX).
        title: Título breve descriptivo del incidente.
        category: 'bache' | 'choque' | 'semaforo_apagado' | 'inundacion' | 'alcantarilla_abierta'.
        description: Detalle informativo sobre la afectación vial o evento.
        status: 'pendiente' | 'en_atencion' | 'resuelto' | 'cancelado'.
        location: type: "Point", coordinates: [longitud, latitud].
        createdAt / updatedAt: Marcas de tiempo de creación y actualización en formato ISO 8601.
    }
]

module.exports = incidents;