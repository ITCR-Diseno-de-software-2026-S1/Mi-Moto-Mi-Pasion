/**
 * Script: initDb.js
 * Inicializa la tabla DynamoDB local para el entorno de desarrollo
 */

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'mimotomipasion-marketplace-api-partes-dev';
const ENDPOINT = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';

const client = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: ENDPOINT,
  credentials: { accessKeyId: 'LOCAL', secretAccessKey: 'LOCAL' },
});

const tableParams = {
  TableName: TABLE_NAME,
  BillingMode: 'PAY_PER_REQUEST',
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'tipo', AttributeType: 'S' },
    { AttributeName: 'createdAt', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH' },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'tipo-createdAt-index',
      KeySchema: [
        { AttributeName: 'tipo', KeyType: 'HASH' },
        { AttributeName: 'createdAt', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
  ],
};

async function tableExists() {
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    return true;
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') return false;
    throw err;
  }
}

async function initDb() {
  console.log(`\n🏍️  MiMotoMiPasion - Inicializando base de datos local`);
  console.log(`📍 Endpoint: ${ENDPOINT}`);
  console.log(`📋 Tabla: ${TABLE_NAME}\n`);

  const exists = await tableExists();

  if (exists) {
    console.log('✅ La tabla ya existe. No es necesario crearla.');
    return;
  }

  console.log('📦 Creando tabla DynamoDB...');
  await client.send(new CreateTableCommand(tableParams));
  console.log('✅ Tabla creada exitosamente con GSI para consultas por tipo.\n');
}

initDb().catch((err) => {
  console.error('❌ Error al inicializar la base de datos:', err.message);
  process.exit(1);
});
