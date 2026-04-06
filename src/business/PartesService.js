const { v4: uuidv4 } = require('uuid');
const { Parte, TIPOS_VALIDOS, CATEGORIAS_VALIDAS } = require('../models/Parte');
const partesRepository = require('../repositories/PartesRepository');

/**
 * Business Logic: PartesService
 * Contiene la lógica de negocio para el marketplace de partes de motos
 */

class PartesService {
  /**
   * Valida los datos de una parte
   * @param {Object} datos - Datos de la parte a validar
   * @returns {{ valido: boolean, errores: string[] }}
   */
  validarDatos(datos) {
    const errores = [];

    if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim().length < 3) {
      errores.push('El nombre es requerido y debe tener al menos 3 caracteres');
    }

    if (!datos.tipo || !TIPOS_VALIDOS.includes(datos.tipo)) {
      errores.push(`El tipo es requerido y debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`);
    }

    if (datos.precio === undefined || datos.precio === null) {
      errores.push('El precio es requerido');
    } else {
      const precio = Number(datos.precio);
      if (isNaN(precio) || precio < 0) {
        errores.push('El precio debe ser un número positivo');
      }
    }

    if (datos.categoria && !CATEGORIAS_VALIDAS.includes(datos.categoria)) {
      errores.push(`La categoría debe ser una de: ${CATEGORIAS_VALIDAS.join(', ')}`);
    }

    return {
      valido: errores.length === 0,
      errores,
    };
  }

  /**
   * Registra una nueva parte en el marketplace
   * @param {Object} datos - Datos de la parte
   * @returns {Object} La parte creada
   */
  async registrarParte(datos) {
    const { valido, errores } = this.validarDatos(datos);
    if (!valido) {
      const error = new Error('Datos inválidos');
      error.code = 'VALIDATION_ERROR';
      error.errores = errores;
      throw error;
    }

    const parte = new Parte({
      id: uuidv4(),
      nombre: datos.nombre.trim(),
      tipo: datos.tipo,
      categoria: datos.categoria || 'usada',
      precio: Number(datos.precio),
      descripcion: datos.descripcion ? datos.descripcion.trim() : '',
      vendedor: datos.vendedor ? datos.vendedor.trim() : 'Anónimo',
      estado: 'disponible',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const parteGuardada = await partesRepository.guardar(parte);

    console.log(`[PartesService] Parte registrada: ${parte.id} - ${parte.nombre}`);
    return parteGuardada;
  }

  /**
   * Lista partes del marketplace, con filtro opcional por tipo
   * @param {string|null} tipo - Tipo de parte para filtrar
   * @returns {Object} Lista de partes y metadatos
   */
  async listarPartes(tipo = null) {
    if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
      const error = new Error(`Tipo inválido. Tipos válidos: ${TIPOS_VALIDOS.join(', ')}`);
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    const partes = await partesRepository.listar(tipo);

    return {
      total: partes.length,
      filtro: tipo ? { tipo } : null,
      partes,
    };
  }

  /**
   * Obtiene una parte por su ID
   * @param {string} id - ID de la parte
   * @returns {Object} La parte encontrada
   */
  async obtenerParte(id) {
    if (!id) {
      const error = new Error('El ID es requerido');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    const parte = await partesRepository.buscarPorId(id);

    if (!parte) {
      const error = new Error(`Parte con ID ${id} no encontrada`);
      error.code = 'NOT_FOUND';
      throw error;
    }

    return parte;
  }

  /**
   * Elimina una parte del marketplace
   * @param {string} id - ID de la parte a eliminar
   * @returns {boolean} true si fue eliminada
   */
  async eliminarParte(id) {
    if (!id) {
      const error = new Error('El ID es requerido');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    const eliminada = await partesRepository.eliminar(id);

    if (!eliminada) {
      const error = new Error(`Parte con ID ${id} no encontrada`);
      error.code = 'NOT_FOUND';
      throw error;
    }

    console.log(`[PartesService] Parte eliminada: ${id}`);
    return true;
  }

  /**
   * Retorna la metadata del catálogo
   * @returns {Object} Tipos y categorías válidas
   */
  getCatalogo() {
    return {
      tipos: TIPOS_VALIDOS,
      categorias: CATEGORIAS_VALIDAS,
    };
  }
}

module.exports = new PartesService();
