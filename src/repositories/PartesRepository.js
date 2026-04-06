const { PutCommand, GetCommand, DeleteCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLE_NAME } = require('../utils/dynamoClient');

/**
 * Repository: PartesRepository
 * Capa de acceso a datos para partes de motos en DynamoDB
 */

class PartesRepository {
  /**
   * Guarda una parte en DynamoDB
   * @param {Object} parte - Objeto parte a guardar
   * @returns {Object} La parte guardada
   */
  async guardar(parte) {
    const item = typeof parte.toJSON === 'function' ? parte.toJSON() : parte;

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: 'attribute_not_exists(id)',
    }));

    return item;
  }

  /**
   * Busca una parte por ID
   * @param {string} id - ID de la parte
   * @returns {Object|null} La parte encontrada o null
   */
  async buscarPorId(id) {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    }));

    return result.Item || null;
  }

  /**
   * Lista partes, opcionalmente filtradas por tipo
   * @param {string|null} tipo - Tipo de parte para filtrar
   * @returns {Array} Lista de partes
   */
  async listar(tipo = null) {
    if (tipo) {
      // Usar GSI para consultar por tipo
      const result = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'tipo-createdAt-index',
        KeyConditionExpression: '#tipo = :tipo',
        ExpressionAttributeNames: { '#tipo': 'tipo' },
        ExpressionAttributeValues: { ':tipo': tipo },
        ScanIndexForward: false, // Más reciente primero
      }));

      return result.Items || [];
    }

    // Sin filtro: Scan completo
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
    }));

    const items = result.Items || [];
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Elimina una parte por ID
   * @param {string} id - ID de la parte a eliminar
   * @returns {boolean} true si fue eliminada, false si no existía
   */
  async eliminar(id) {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id },
        ConditionExpression: 'attribute_exists(id)',
      }));
      return true;
    } catch (err) {
      if (err.name === 'ConditionalCheckFailedException') {
        return false;
      }
      throw err;
    }
  }

  /**
   * Lista todos los tipos únicos de partes disponibles
   * @returns {Array<string>} Lista de tipos
   */
  async listarTipos() {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      ProjectionExpression: '#tipo',
      ExpressionAttributeNames: { '#tipo': 'tipo' },
    }));

    const tipos = [...new Set((result.Items || []).map(i => i.tipo))];
    return tipos.sort();
  }
}

module.exports = new PartesRepository();
