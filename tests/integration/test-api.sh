# 🏍️ MiMotoMiPasion - Pruebas de Integración
# Ejecutar con: bash tests/integration/test-api.sh
# Prerequisito: serverless offline corriendo en puerto 3000

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0
PARTE_ID=""

log_test() { echo -e "\n${BLUE}▶ TEST: $1${NC}"; }
log_pass() { echo -e "${GREEN}  ✅ PASS: $1${NC}"; PASS=$((PASS+1)); }
log_fail() { echo -e "${RED}  ❌ FAIL: $1${NC}"; FAIL=$((FAIL+1)); }
log_info() { echo -e "${YELLOW}  ℹ  $1${NC}"; }

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🏍️  MiMotoMiPasion - Integration Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# ─── TEST 1: POST /partes - Crear parte válida ────────────────────────────────
log_test "POST /partes - Crear parte válida"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/partes" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carburador Keihin CV40",
    "tipo": "motor",
    "categoria": "usada",
    "precio": 95.50,
    "descripcion": "Carburador en buen estado, probado",
    "vendedor": "MotoTest CR"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

if [ "$HTTP_CODE" = "201" ]; then
  log_pass "Status 201 Created"
  PARTE_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  log_info "ID creado: $PARTE_ID"
else
  log_fail "Esperado 201, recibido: $HTTP_CODE"
  log_info "Body: $BODY"
fi

# ─── TEST 2: POST /partes - Datos inválidos ───────────────────────────────────
log_test "POST /partes - Datos inválidos (nombre corto, tipo inválido)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/partes" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "AB", "tipo": "cocina", "precio": -10}')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "400" ]; then
  log_pass "Status 400 Bad Request correcto"
else
  log_fail "Esperado 400, recibido: $HTTP_CODE"
fi

# ─── TEST 3: GET /partes - Listar todas ──────────────────────────────────────
log_test "GET /partes - Listar todas las partes"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/partes")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

if [ "$HTTP_CODE" = "200" ]; then
  log_pass "Status 200 OK"
  TOTAL=$(echo "$BODY" | grep -o '"total":[0-9]*' | cut -d':' -f2)
  log_info "Total partes: $TOTAL"
else
  log_fail "Esperado 200, recibido: $HTTP_CODE"
fi

# ─── TEST 4: GET /partes?tipo=motor ──────────────────────────────────────────
log_test "GET /partes?tipo=motor - Filtrar por tipo"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/partes?tipo=motor")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

if [ "$HTTP_CODE" = "200" ]; then
  log_pass "Status 200 OK con filtro tipo=motor"
else
  log_fail "Esperado 200, recibido: $HTTP_CODE"
fi

# ─── TEST 5: GET /partes?tipo=invalido ───────────────────────────────────────
log_test "GET /partes?tipo=invalido - Tipo inválido"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/partes?tipo=cocina")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "400" ]; then
  log_pass "Status 400 Bad Request correcto para tipo inválido"
else
  log_fail "Esperado 400, recibido: $HTTP_CODE"
fi

# ─── TEST 6: GET /partes/{id} - Obtener parte creada ─────────────────────────
if [ -n "$PARTE_ID" ]; then
  log_test "GET /partes/$PARTE_ID - Obtener parte por ID"
  RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/partes/$PARTE_ID")
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)

  if [ "$HTTP_CODE" = "200" ]; then
    log_pass "Status 200 OK"
  else
    log_fail "Esperado 200, recibido: $HTTP_CODE"
  fi
else
  log_info "Skipping GET /partes/{id} - no se creó parte en TEST 1"
fi

# ─── TEST 7: GET /partes/no-existe ───────────────────────────────────────────
log_test "GET /partes/no-existe - ID inexistente"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/partes/id-que-no-existe-xyz")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "404" ]; then
  log_pass "Status 404 Not Found correcto"
else
  log_fail "Esperado 404, recibido: $HTTP_CODE"
fi

# ─── TEST 8: DELETE /partes/{id} ─────────────────────────────────────────────
if [ -n "$PARTE_ID" ]; then
  log_test "DELETE /partes/$PARTE_ID - Eliminar parte"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/partes/$PARTE_ID")
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)

  if [ "$HTTP_CODE" = "200" ]; then
    log_pass "Status 200 OK - Parte eliminada"
  else
    log_fail "Esperado 200, recibido: $HTTP_CODE"
  fi
fi

# ─── RESUMEN ─────────────────────────────────────────────────────────────────
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  📊 RESUMEN: ${GREEN}$PASS PASS${NC} | ${RED}$FAIL FAIL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

[ $FAIL -eq 0 ] && exit 0 || exit 1
