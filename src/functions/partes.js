const partesService = require('../business/PartesService');
const { ok, creado, badRequest, notFound, serverError } = require('../utils/response');

/**
 * Lambda Functions: Partes
 * Handlers desacoplados para cada operación del marketplace
 */

/**
 * POST /partes
 * Registrar una nueva parte de moto
 */
const crear = async (event) => {
  console.log('[Lambda:crear] Evento recibido:', JSON.stringify(event, null, 2));

  try {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return badRequest('El cuerpo de la solicitud no es JSON válido');
    }

    const parte = await partesService.registrarParte(body);
    console.log('[Lambda:crear] Parte creada:', parte.id);

    return creado(parte, `Parte "${parte.nombre}" registrada exitosamente en el marketplace`);
  } catch (error) {
    console.error('[Lambda:crear] Error:', error);

    if (error.code === 'VALIDATION_ERROR') {
      return badRequest(error.message, error.errores);
    }

    return serverError('No se pudo registrar la parte. Intente nuevamente.');
  }
};

/**
 * GET /partes?tipo=x
 * Listar partes, con filtro opcional por tipo
 */
const listar = async (event) => {
  console.log('[Lambda:listar] Evento recibido:', JSON.stringify(event, null, 2));

  try {
    const tipo = event.queryStringParameters?.tipo || null;
    const resultado = await partesService.listarPartes(tipo);

    const mensaje = tipo
      ? `Se encontraron ${resultado.total} partes de tipo "${tipo}"`
      : `Se encontraron ${resultado.total} partes en el marketplace`;

    return ok(resultado, mensaje);
  } catch (error) {
    console.error('[Lambda:listar] Error:', error);

    if (error.code === 'VALIDATION_ERROR') {
      return badRequest(error.message);
    }

    return serverError('No se pudieron listar las partes. Intente nuevamente.');
  }
};

/**
 * GET /partes/{id}
 * Obtener una parte específica
 */
const obtener = async (event) => {
  console.log('[Lambda:obtener] Evento recibido:', JSON.stringify(event, null, 2));

  try {
    const { id } = event.pathParameters || {};
    const parte = await partesService.obtenerParte(id);

    return ok(parte, `Parte "${parte.nombre}" encontrada`);
  } catch (error) {
    console.error('[Lambda:obtener] Error:', error);

    if (error.code === 'NOT_FOUND') {
      return notFound(error.message);
    }

    if (error.code === 'VALIDATION_ERROR') {
      return badRequest(error.message);
    }

    return serverError('No se pudo obtener la parte. Intente nuevamente.');
  }
};

/**
 * DELETE /partes/{id}
 * Eliminar una parte del marketplace
 */
const eliminar = async (event) => {
  console.log('[Lambda:eliminar] Evento recibido:', JSON.stringify(event, null, 2));

  try {
    const { id } = event.pathParameters || {};
    await partesService.eliminarParte(id);

    return ok({ id }, `Parte con ID "${id}" eliminada del marketplace`);
  } catch (error) {
    console.error('[Lambda:eliminar] Error:', error);

    if (error.code === 'NOT_FOUND') {
      return notFound(error.message);
    }

    if (error.code === 'VALIDATION_ERROR') {
      return badRequest(error.message);
    }

    return serverError('No se pudo eliminar la parte. Intente nuevamente.');
  }
};

module.exports = { crear, listar, obtener, eliminar };
