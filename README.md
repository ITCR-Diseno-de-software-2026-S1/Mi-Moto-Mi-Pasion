# 🏍️ MiMotoMiPasión — Marketplace API Serverless

API serverless para intercambio de partes de motos, construida con Serverless Framework, AWS Lambda (local), DynamoDB Local y Node.js con arquitectura de capas.

---

## 🏗️ Arquitectura

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

---

## 🚀 Instalación y Ejecución

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar en modo desarrollo (todo en uno)

```bash
npm start
```

Este comando:
1. Inicializa la tabla DynamoDB local
2. Levanta `serverless offline` en `http://localhost:3000`

### 3. Inicializar DB y poblar con datos de ejemplo

```bash
npm run db:init    # Crea la tabla DynamoDB local
npm run db:seed    # Inserta 10 partes de ejemplo
```

### 4. Solo servidor de desarrollo

```bash
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

### Crear una parte
```bash
curl -X POST http://localhost:3000/partes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carburador Keihin CV40",
    "tipo": "motor",
    "categoria": "usada",
    "precio": 95.50,
    "descripcion": "Buen estado, probado",
    "vendedor": "MotoShop CR"
  }'
```

### Listar todas las partes
```bash
curl http://localhost:3000/partes
```

### Listar por tipo
```bash
curl "http://localhost:3000/partes?tipo=motor"
curl "http://localhost:3000/partes?tipo=frenos"
```

### Obtener por ID
```bash
curl http://localhost:3000/partes/{id}
```

### Eliminar
```bash
curl -X DELETE http://localhost:3000/partes/{id}
```

---

## 🧪 Pruebas

### Unitarias (Jest)
```bash
npm test           # Todas las pruebas con cobertura
npm run test:unit  # Solo unitarias
npm run test:watch # Modo watch
```

### Integración (curl / bash)
```bash
# Asegúrate de tener serverless offline corriendo
bash tests/integration/test-api.sh
```

### Postman
Importa `tests/integration/postman-collection.json` en Postman o Insomnia.

---

## 🌐 Frontend

Abre `frontend/index.html` en tu navegador (con la API corriendo):

```bash
open frontend/index.html
# o
npx serve frontend
```

---

## 🌍 Entornos

| Entorno | Comando | DynamoDB |
|---------|---------|----------|
| `dev` | `npm run dev` | Local (puerto 8000) |
| `prod` | `npm run deploy:prod` | AWS DynamoDB real |

Variables de entorno:
```bash
STAGE=dev                                              # dev | prod
DYNAMODB_TABLE=mimotomipasion-marketplace-api-partes-dev
DYNAMODB_ENDPOINT=http://localhost:8000               # solo dev
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

## 🏗️ Capas de Arquitectura

```
HTTP Request
     ↓
[Lambda Handler]     ← src/functions/partes.js
     ↓
[Business Logic]     ← src/business/PartesService.js
     ↓
[Repository]         ← src/repositories/PartesRepository.js
     ↓
[DynamoDB Local]     ← @aws-sdk/lib-dynamodb
```

---

*Repositorio: `miMotoMiPasion-marketplace-api`*
