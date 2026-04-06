/**
 * Script: seedDb.js
 * Pobla la base de datos local con datos de ejemplo
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'mimotomipasion-marketplace-api-partes-dev';
const ENDPOINT = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';

const client = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: ENDPOINT,
  credentials: { accessKeyId: 'LOCAL', secretAccessKey: 'LOCAL' },
});
const docClient = DynamoDBDocumentClient.from(client);

const partesSemilla = [
  {
    nombre: 'Carburador Honda CBR 600',
    tipo: 'motor',
    categoria: 'usada',
    precio: 85.00,
    descripcion: 'Carburador en buen estado, limpiado recientemente',
    vendedor: 'MotoPartes CR',
  },
  {
    nombre: 'Pastillas de freno Brembo Racing',
    tipo: 'frenos',
    categoria: 'nueva',
    precio: 45.00,
    descripcion: 'Pastillas de alto rendimiento para pista y calle',
    vendedor: 'SpeedShop SJO',
  },
  {
    nombre: 'Amortiguador trasero YSS G-Sport',
    tipo: 'suspension',
    categoria: 'nueva',
    precio: 220.00,
    descripcion: 'Amortiguador ajustable de alta calidad, compatible con 125-250cc',
    vendedor: 'SuspensionPro',
  },
  {
    nombre: 'Cadena y piñones RK520',
    tipo: 'transmision',
    categoria: 'nueva',
    precio: 95.00,
    descripcion: 'Kit completo cadena + corona + piñón, paso 520',
    vendedor: 'TransMoto Heredia',
  },
  {
    nombre: 'Batería Yuasa YTX14-BS',
    tipo: 'electrico',
    categoria: 'nueva',
    precio: 75.00,
    descripcion: 'Batería sellada sin mantenimiento, 12V 12Ah',
    vendedor: 'ElectroMoto CR',
  },
  {
    nombre: 'Carenado lateral izquierdo Yamaha R6 2019',
    tipo: 'carroceria',
    categoria: 'usada',
    precio: 60.00,
    descripcion: 'Carenado original con pequeño rasguño en borde inferior',
    vendedor: 'YamaPartes',
  },
  {
    nombre: 'Escape Akrapovic Slip-On Honda CBR500',
    tipo: 'escape',
    categoria: 'reacondicionada',
    precio: 185.00,
    descripcion: 'Escape de titanio, sonido agresivo, ganancia en potencia',
    vendedor: 'TuningMoto SJO',
  },
  {
    nombre: 'Llanta trasera Michelin Pilot Road 5',
    tipo: 'ruedas',
    categoria: 'nueva',
    precio: 140.00,
    descripcion: '190/55/17, ideal para turismo y deporte',
    vendedor: 'LlantasTica',
  },
  {
    nombre: 'Manubrio clip-on CNC Racing',
    tipo: 'accesorios',
    categoria: 'nueva',
    precio: 55.00,
    descripcion: 'Aluminio anodizado negro, diámetro 41mm',
    vendedor: 'MotoStyle CR',
  },
  {
    nombre: 'Pistón y aros Honda XR200',
    tipo: 'motor',
    categoria: 'nueva',
    precio: 40.00,
    descripcion: 'Kit completo STD, incluye pin y seguro',
    vendedor: 'MotorPartes CR',
  },
];

async function seedDb() {
  console.log(`\n🌱 MiMotoMiPasion - Sembrando datos de ejemplo`);
  console.log(`📋 Tabla: ${TABLE_NAME}\n`);

  // Verificar si ya hay datos
  const existing = await docClient.send(new ScanCommand({
    TableName: TABLE_NAME,
    Select: 'COUNT',
  }));

  if (existing.Count > 0) {
    console.log(`⚠️  La tabla ya tiene ${existing.Count} registros. Saltando seed.`);
    console.log('   (Ejecuta primero: aws dynamodb delete-table para limpiar)\n');
    return;
  }

  console.log(`📦 Insertando ${partesSemilla.length} partes de ejemplo...\n`);

  const now = new Date();
  for (let i = 0; i < partesSemilla.length; i++) {
    const parte = partesSemilla[i];
    const createdAt = new Date(now.getTime() - (i * 3600000)).toISOString();

    const item = {
      id: uuidv4(),
      ...parte,
      estado: 'disponible',
      createdAt,
      updatedAt: createdAt,
    };

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    console.log(`  ✅ ${parte.nombre} (${parte.tipo}) - $${parte.precio}`);
  }

  console.log(`\n🎉 Se insertaron ${partesSemilla.length} partes exitosamente.\n`);
}

seedDb().catch((err) => {
  console.error('❌ Error al sembrar datos:', err.message);
  process.exit(1);
});
