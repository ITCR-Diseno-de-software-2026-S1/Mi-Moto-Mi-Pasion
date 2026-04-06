/**
 * Tests unitarios para utilidades y modelos
 */

const { ok, creado, badRequest, notFound, serverError } = require('../../src/utils/response');
const { Parte, TIPOS_VALIDOS, CATEGORIAS_VALIDAS } = require('../../src/models/Parte');

// ─── response.js ────────────────────────────────────────────────────────────
describe('response helpers', () => {
  test('ok retorna 200 con success true y data', () => {
    const r = ok({ id: '1' }, 'Perfecto');
    expect(r.statusCode).toBe(200);
    const body = JSON.parse(r.body);
    expect(body.success).toBe(true);
    expect(body.mensaje).toBe('Perfecto');
    expect(body.data).toEqual({ id: '1' });
  });

  test('ok funciona sin mensaje explícito', () => {
    const r = ok([]);
    expect(r.statusCode).toBe(200);
    expect(JSON.parse(r.body).success).toBe(true);
  });

  test('creado retorna 201 con success true', () => {
    const r = creado({ id: '2' }, 'Parte creada');
    expect(r.statusCode).toBe(201);
    expect(JSON.parse(r.body).success).toBe(true);
  });

  test('badRequest retorna 400 con success false', () => {
    const r = badRequest('Error de validación', ['nombre requerido']);
    expect(r.statusCode).toBe(400);
    const body = JSON.parse(r.body);
    expect(body.success).toBe(false);
    expect(body.detalles).toEqual(['nombre requerido']);
  });

  test('badRequest sin detalles no incluye la key detalles', () => {
    const r = badRequest('Error simple');
    const body = JSON.parse(r.body);
    expect(body.detalles).toBeUndefined();
  });

  test('notFound retorna 404', () => {
    const r = notFound('No existe');
    expect(r.statusCode).toBe(404);
    expect(JSON.parse(r.body).success).toBe(false);
  });

  test('serverError retorna 500', () => {
    const r = serverError('Fallo interno');
    expect(r.statusCode).toBe(500);
  });

  test('todas las respuestas incluyen headers CORS', () => {
    [ok({}), creado({}), badRequest('x'), notFound(), serverError()].forEach(r => {
      expect(r.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(r.headers['Content-Type']).toBe('application/json');
    });
  });

  test('el body siempre es JSON válido', () => {
    [ok({ a: 1 }), creado({ b: 2 }), badRequest('err'), notFound(), serverError()].forEach(r => {
      expect(() => JSON.parse(r.body)).not.toThrow();
    });
  });
});

// ─── Parte model ─────────────────────────────────────────────────────────────
describe('Parte model', () => {
  const datosBase = {
    id: 'test-uuid',
    nombre: 'Carburador Honda',
    tipo: 'motor',
    precio: 100,
  };

  test('crea una instancia con valores por defecto correctos', () => {
    const p = new Parte(datosBase);
    expect(p.id).toBe('test-uuid');
    expect(p.nombre).toBe('Carburador Honda');
    expect(p.categoria).toBe('usada');
    expect(p.vendedor).toBe('Anónimo');
    expect(p.estado).toBe('disponible');
    expect(p.descripcion).toBe('');
  });

  test('respeta los valores provistos explícitamente', () => {
    const p = new Parte({ ...datosBase, categoria: 'nueva', vendedor: 'Test Moto', estado: 'vendida' });
    expect(p.categoria).toBe('nueva');
    expect(p.vendedor).toBe('Test Moto');
    expect(p.estado).toBe('vendida');
  });

  test('toJSON retorna un objeto plano con todos los campos', () => {
    const p = new Parte(datosBase);
    const json = p.toJSON();
    expect(json).toHaveProperty('id');
    expect(json).toHaveProperty('nombre');
    expect(json).toHaveProperty('tipo');
    expect(json).toHaveProperty('precio');
    expect(json).toHaveProperty('createdAt');
    expect(json).toHaveProperty('updatedAt');
    expect(json).not.toBeInstanceOf(Parte);
  });

  test('getTiposValidos retorna array no vacío', () => {
    const tipos = Parte.getTiposValidos();
    expect(Array.isArray(tipos)).toBe(true);
    expect(tipos.length).toBeGreaterThan(0);
    expect(tipos).toContain('motor');
    expect(tipos).toContain('frenos');
  });

  test('getCategoriasValidas retorna array con las 3 categorías', () => {
    const cats = Parte.getCategoriasValidas();
    expect(cats).toContain('nueva');
    expect(cats).toContain('usada');
    expect(cats).toContain('reacondicionada');
    expect(cats).toHaveLength(3);
  });

  test('asigna createdAt si no se provee', () => {
    const p = new Parte(datosBase);
    expect(p.createdAt).toBeDefined();
    expect(() => new Date(p.createdAt)).not.toThrow();
  });

  test('usa createdAt existente si se provee', () => {
    const fecha = '2024-01-01T00:00:00.000Z';
    const p = new Parte({ ...datosBase, createdAt: fecha });
    expect(p.createdAt).toBe(fecha);
  });

  test('TIPOS_VALIDOS y CATEGORIAS_VALIDAS son arrays exportados', () => {
    expect(Array.isArray(TIPOS_VALIDOS)).toBe(true);
    expect(Array.isArray(CATEGORIAS_VALIDAS)).toBe(true);
  });
});
