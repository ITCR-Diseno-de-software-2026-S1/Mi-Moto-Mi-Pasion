# 🏍️ MiMotoMiPasión — Marketplace API Serverless

API serverless para intercambio de partes de motos, construida con Serverless Framework, AWS Lambda (local), DynamoDB Local y Node.js con arquitectura de capas.

---

## 💡 Tecnología, Paradigma y Topología

### Tecnología

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Runtime | Node.js | >= 18 |
| Framework serverless | Serverless Framework | v4 |
| Emulación local | serverless-offline | v14 |
| Base de datos | Amazon DynamoDB Local | (vía Java) |
| SDK AWS | @aws-sdk v3 (DynamoDBDocumentClient) | ^3.540 |
| Testing unitario | Jest | ^29 |
| CI/CD | GitHub Actions | — |
| Frontend | HTML/CSS/JS (SPA vanilla) | — |

### Paradigma

El proyecto aplica el paradigma **serverless orientado a eventos**: cada operación de negocio es una función Lambda independiente, desencadenada por un evento HTTP. No existe un servidor persistente; el proceso arranca, ejecuta y termina por cada invocación. Localmente esto se simula con `serverless-offline`, que emula el runtime de AWS Lambda y API Gateway en un proceso Node.js.

La lógica interna sigue el paradigma **orientado a objetos con separación de responsabilidades**, usando clases de servicio (`PartesService`), repositorio (`PartesRepository`) y modelo (`Parte`) que se comunican de forma unidireccional a través de la arquitectura de capas.

### Topología

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                              │
│          Browser SPA  /  curl  /  Postman                   │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP REST
┌───────────────────────────▼─────────────────────────────────┐
│               API GATEWAY (simulado localmente)             │
│                    serverless-offline :3000                  │
├──────────┬──────────────┬───────────────┬───────────────────┤
│ POST     │ GET          │ GET           │ DELETE            │
│ /partes  │ /partes      │ /partes/{id}  │ /partes/{id}      │
├──────────┴──────────────┴───────────────┴───────────────────┤
│                   LAMBDA HANDLERS                            │
│              src/functions/partes.js                        │
│         (crear · listar · obtener · eliminar)               │
├─────────────────────────────────────────────────────────────┤
│                   BUSINESS LOGIC                            │
│              src/business/PartesService.js                  │
│         (validaciones · reglas de negocio · UUIDs)          │
├─────────────────────────────────────────────────────────────┤
│                     REPOSITORY                              │
│           src/repositories/PartesRepository.js              │
│         (PutCommand · QueryCommand · ScanCommand)           │
├─────────────────────────────────────────────────────────────┤
│                   DYNAMODB LOCAL                            │
│            Puerto 8000 · In-memory · GSI por tipo           │
└─────────────────────────────────────────────────────────────┘
```

Cada Lambda es **stateless**: no comparte memoria entre invocaciones. El estado persiste únicamente en DynamoDB. En producción, cada función se desplegaría como una unidad aislada en AWS, escalando de forma independiente.

---

## 🏗️ Estructura del Proyecto

```
miMotoMiPasion-marketplace-api/
├── src/
│   ├── functions/          # Lambda Handlers (capa de entrada)
│   │   └── partes.js       # crear, listar, obtener, eliminar
│   ├── business/           # Lógica de Negocio
│   │   └── PartesService.js
│   ├── repositories/       # Acceso a Datos (DynamoDB)
│   │   └── PartesRepository.js
│   ├── models/             # Modelos de dominio
│   │   └── Parte.js
│   └── utils/
│       ├── dynamoClient.js # Cliente DynamoDB configurado
│       └── response.js     # Helpers de respuesta HTTP
├── tests/
│   ├── unit/               # Jest — lógica de negocio aislada
│   └── integration/        # Scripts bash + colección Postman
├── scripts/
│   ├── initDb.js           # Crear tabla DynamoDB local
│   ├── seedDb.js           # Datos de ejemplo
│   └── seed-data.json
├── frontend/
│   └── index.html          # SPA para interactuar con la API
├── .github/workflows/
│   └── ci.yml              # CI/CD: tests → validate → deploy simulado
└── serverless.yml          # Configuración Serverless Framework
```

---

## ⚙️ Requisitos Previos

- **Node.js** >= 18
- **Java** (para DynamoDB Local — [descargar JRE](https://adoptium.net/))
- **npm** o **yarn**
- **PowerShell** (en Windows, todos los comandos deben ejecutarse desde PowerShell)

---

## 🚀 Instalación y Ejecución

> ⚠️ **Windows**: todos los comandos deben ejecutarse desde **PowerShell**. No uses CMD ni Git Bash para este proyecto.

### 1. Instalar dependencias

```powershell
npm install
```

### 2. Descargar DynamoDB Local (solo la primera vez)

```powershell
npx serverless dynamodb install
```

### 3. Iniciar en modo desarrollo

```powershell
npm start
```

Este comando levanta `serverless-offline` junto con DynamoDB Local en `http://localhost:3000`.

### 4. Inicializar tabla y poblar con datos de ejemplo

Abre una segunda ventana de PowerShell y ejecuta:

```powershell
npm run db:init    # Crea la tabla DynamoDB local
npm run db:seed    # Inserta 10 partes de ejemplo
```

### 5. Solo servidor de desarrollo (sin inicializar DB)

```powershell
npm run dev
```

---

## 📡 Endpoints REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/partes` | Registrar una nueva parte |
| `GET` | `/partes` | Listar todas las partes |
| `GET` | `/partes?tipo=motor` | Listar partes por tipo |
| `GET` | `/partes/{id}` | Obtener una parte por ID |
| `DELETE` | `/partes/{id}` | Eliminar una parte |

### Tipos válidos
`motor` · `frenos` · `suspension` · `transmision` · `electrico` · `carroceria` · `escape` · `ruedas` · `accesorios` · `otro`

### Categorías válidas
`nueva` · `usada` · `reacondicionada`

---

## 📝 Ejemplos con curl

Ejecutar desde PowerShell:

### Crear una parte
```powershell
curl -X POST http://localhost:3000/partes `
  -H "Content-Type: application/json" `
  -d '{"nombre":"Carburador Keihin CV40","tipo":"motor","categoria":"usada","precio":95.50,"descripcion":"Buen estado, probado","vendedor":"MotoShop CR"}'
```

### Listar todas las partes
```powershell
curl http://localhost:3000/partes
```

### Listar por tipo
```powershell
curl "http://localhost:3000/partes?tipo=motor"
curl "http://localhost:3000/partes?tipo=frenos"
```

### Obtener por ID
```powershell
curl http://localhost:3000/partes/{id}
```

### Eliminar
```powershell
curl -X DELETE http://localhost:3000/partes/{id}
```

---

## 🧪 Pruebas

### Unitarias (Jest)
```powershell
npm test           # Todas las pruebas con cobertura
npm run test:unit  # Solo unitarias
npm run test:watch # Modo watch
```

### Integración (Postman)
Importa `tests/integration/postman-collection.json` en Postman o Insomnia con la API corriendo.

---

## 🌐 Frontend

Abre `frontend/index.html` directamente en el navegador, o sírvelo con:

```powershell
npx serve frontend
```

---

## 🌍 Entornos

| Entorno | Comando | DynamoDB |
|---------|---------|----------|
| `dev` | `npm run dev` | Local (puerto 8000) |
| `prod` | `npm run deploy:prod` | AWS DynamoDB real |

Variables de entorno relevantes:
```
STAGE=dev
DYNAMODB_TABLE=mimotomipasion-marketplace-api-partes-dev
DYNAMODB_ENDPOINT=http://localhost:8000
```

---

## 🔄 CI/CD (GitHub Actions)

El workflow `.github/workflows/ci.yml` ejecuta en cada push:

1. **🧪 Unit Tests** — Jest con cobertura mínima
2. **🔍 Validate** — `serverless print` para validar la config
3. **🚀 Deploy Simulado** — `serverless package --stage prod` (solo en `main`)

---

## 📊 Observabilidad

- Logs por consola del proceso `serverless offline`
- DynamoDB Local logs disponibles en la terminal
- Cada Lambda loguea el evento de entrada y el resultado

---

## 📦 Schema de una Parte

```json
{
  "id": "uuid-v4",
  "nombre": "Carburador Keihin CV40",
  "tipo": "motor",
  "categoria": "usada",
  "precio": 95.50,
  "descripcion": "Descripción opcional",
  "vendedor": "MotoShop CR",
  "estado": "disponible",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

---

*Repositorio: `miMotoMiPasion-marketplace-api`*
