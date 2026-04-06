/**
 * Utilidades para generar respuestas HTTP estándar
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

const respuesta = (statusCode, body) => ({
  statusCode,
  headers: CORS_HEADERS,
  body: JSON.stringify(body),
});

const ok = (data, mensaje = 'Operación exitosa') =>
  respuesta(200, { success: true, mensaje, data });

const creado = (data, mensaje = 'Recurso creado exitosamente') =>
  respuesta(201, { success: true, mensaje, data });

const error = (statusCode, mensaje, detalles = null) =>
  respuesta(statusCode, {
    success: false,
    mensaje,
    ...(detalles && { detalles }),
  });

const badRequest = (mensaje, detalles = null) => error(400, mensaje, detalles);
const notFound = (mensaje = 'Recurso no encontrado') => error(404, mensaje);
const serverError = (mensaje = 'Error interno del servidor') => error(500, mensaje);

module.exports = { ok, creado, badRequest, notFound, serverError };
