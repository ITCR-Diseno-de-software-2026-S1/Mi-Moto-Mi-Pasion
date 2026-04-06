/**
 * Tests unitarios para PartesService
 * Valida la lógica de negocio de forma aislada (sin DynamoDB)
 */

// Mock del repositorio para aislar la capa de negocio
jest.mock('../../src/repositories/PartesRepository', () => ({
  guardar: jest.fn(),
  buscarPorId: jest.fn(),
  listar: jest.fn(),
  eliminar: jest.fn(),
  listarTipos: jest.fn(),
}));

const partesService = require('../../src/business/PartesService');
const partesRepository = require('../../src/repositories/PartesRepository');

describe('PartesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── validarDatos ───────────────────────────────────────────────────────────
  describe('validarDatos', () => {
    test('debería retornar válido con datos completos y correctos', () => {
      const datos = { nombre: 'Carburador Honda', tipo: 'motor', precio: 150 };
      const resultado = partesService.validarDatos(datos);
      expect(resultado.valido).toBe(true);
      expect(resultado.errores).toHaveLength(0);
    });

    test('debería fallar si falta el nombre', () => {
      const datos = { tipo: 'motor', precio: 150 };
      const resultado = partesService.validarDatos(datos);
      expect(resultado.valido).toBe(false);
      expect(resultado.errores).toContain(
        'El nombre es requerido y debe tener al menos 3 caracteres'
      );
    });

    test('debería fallar si el nombre tiene menos de 3 caracteres', () => {
      const datos = { nombre: 'AB', tipo: 'motor', precio: 150 };
      const resultado = partesService.validarDatos(datos);
      expect(resultado.valido).toBe(false);
    });

    test('debería fallar si el tipo no es válido', () => {
      const datos = { nombre: 'Carburador', tipo: 'cocina', precio: 150 };
      const resultado = partesService.validarDatos(datos);
      expect(resultado.valido).toBe(false);
      expect(resultado.errores.some(e => e.includes('tipo'))).toBe(true);
    });

    test('debería fallar si el precio es negativo', () => {
      const datos = { nombre: 'Carburador Honda', tipo: 'motor', precio: -10 };
      const resultado = partesService.validarDatos(datos);
      expect(resultado.valido).toBe(false);
      expect(resultado.errores.some(e => e.includes('precio'))).toBe(true);
    });

    test('debería fallar si falta el precio', () => {
      const datos = { nombre: 'Carburador Honda', tipo: 'motor' };
      const resultado = partesService.validarDatos(datos);
      expect(resultado.valido).toBe(false);
    });

    test('debería fallar si la categoría no es válida', () => {
      const datos = { nombre: 'Carburador Honda', tipo: 'motor', precio: 100, categoria: 'destruida' };
      const resultado = partesService.validarDatos(datos);
      expect(resultado.valido).toBe(false);
    });

    test('debería aceptar precio cero', () => {
      const datos = { nombre: 'Carburador Honda', tipo: 'motor', precio: 0 };
      const resultado = partesService.validarDatos(datos);
      expect(resultado.valido).toBe(true);
    });

    test('debería acumular múltiples errores', () => {
      const datos = {};
      const resultado = partesService.validarDatos(datos);
      expect(resultado.valido).toBe(false);
      expect(resultado.errores.length).toBeGreaterThan(1);
    });
  });

  // ─── registrarParte ─────────────────────────────────────────────────────────
  describe('registrarParte', () => {
    const datosValidos = {
      nombre: 'Pastillas de freno Brembo',
      tipo: 'frenos',
      precio: 75.50,
      categoria: 'nueva',
      vendedor: 'MotoShop CR',
    };

    test('debería registrar una parte válida y retornarla', async () => {
      const parteGuardada = { ...datosValidos, id: 'uuid-test-123', estado: 'disponible' };
      partesRepository.guardar.mockResolvedValue(parteGuardada);

      const resultado = await partesService.registrarParte(datosValidos);

      expect(partesRepository.guardar).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(parteGuardada);
    });

    test('debería generar un ID único para la parte', async () => {
      partesRepository.guardar.mockImplementation(async (parte) => {
        const item = typeof parte.toJSON === 'function' ? parte.toJSON() : parte;
        return item;
      });

      const resultado = await partesService.registrarParte(datosValidos);
      expect(resultado.id).toBeDefined();
      expect(typeof resultado.id).toBe('string');
      expect(resultado.id.length).toBeGreaterThan(0);
    });

    test('debería lanzar VALIDATION_ERROR con datos inválidos', async () => {
      await expect(
        partesService.registrarParte({ nombre: 'AB', tipo: 'motor' })
      ).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        errores: expect.any(Array),
      });

      expect(partesRepository.guardar).not.toHaveBeenCalled();
    });

    test('debería asignar "Anónimo" si no se provee vendedor', async () => {
      partesRepository.guardar.mockImplementation(async (parte) => {
        const item = typeof parte.toJSON === 'function' ? parte.toJSON() : parte;
        return item;
      });

      const { vendedor: _, ...sinVendedor } = datosValidos;
      const resultado = await partesService.registrarParte(sinVendedor);
      expect(resultado.vendedor).toBe('Anónimo');
    });

    test('debería propagar errores del repositorio', async () => {
      partesRepository.guardar.mockRejectedValue(new Error('DynamoDB connection error'));

      await expect(partesService.registrarParte(datosValidos)).rejects.toThrow(
        'DynamoDB connection error'
      );
    });
  });

  // ─── listarPartes ───────────────────────────────────────────────────────────
  describe('listarPartes', () => {
    const partesEjemplo = [
      { id: '1', nombre: 'Freno delantero', tipo: 'frenos', precio: 50 },
      { id: '2', nombre: 'Freno trasero', tipo: 'frenos', precio: 45 },
    ];

    test('debería listar todas las partes sin filtro', async () => {
      partesRepository.listar.mockResolvedValue(partesEjemplo);

      const resultado = await partesService.listarPartes();

      expect(partesRepository.listar).toHaveBeenCalledWith(null);
      expect(resultado.total).toBe(2);
      expect(resultado.partes).toEqual(partesEjemplo);
      expect(resultado.filtro).toBeNull();
    });

    test('debería filtrar partes por tipo válido', async () => {
      partesRepository.listar.mockResolvedValue(partesEjemplo);

      const resultado = await partesService.listarPartes('frenos');

      expect(partesRepository.listar).toHaveBeenCalledWith('frenos');
      expect(resultado.filtro).toEqual({ tipo: 'frenos' });
    });

    test('debería lanzar VALIDATION_ERROR con tipo inválido', async () => {
      await expect(partesService.listarPartes('volantin')).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      });

      expect(partesRepository.listar).not.toHaveBeenCalled();
    });

    test('debería retornar lista vacía si no hay partes', async () => {
      partesRepository.listar.mockResolvedValue([]);

      const resultado = await partesService.listarPartes();
      expect(resultado.total).toBe(0);
      expect(resultado.partes).toEqual([]);
    });
  });

  // ─── obtenerParte ───────────────────────────────────────────────────────────
  describe('obtenerParte', () => {
    test('debería retornar una parte existente', async () => {
      const parte = { id: 'abc-123', nombre: 'Amortiguador YSS', tipo: 'suspension', precio: 200 };
      partesRepository.buscarPorId.mockResolvedValue(parte);

      const resultado = await partesService.obtenerParte('abc-123');
      expect(resultado).toEqual(parte);
    });

    test('debería lanzar NOT_FOUND si la parte no existe', async () => {
      partesRepository.buscarPorId.mockResolvedValue(null);

      await expect(partesService.obtenerParte('no-existe')).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    test('debería lanzar VALIDATION_ERROR si no se provee ID', async () => {
      await expect(partesService.obtenerParte(null)).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      });
    });
  });

  // ─── eliminarParte ──────────────────────────────────────────────────────────
  describe('eliminarParte', () => {
    test('debería eliminar una parte existente', async () => {
      partesRepository.eliminar.mockResolvedValue(true);

      const resultado = await partesService.eliminarParte('abc-123');
      expect(resultado).toBe(true);
      expect(partesRepository.eliminar).toHaveBeenCalledWith('abc-123');
    });

    test('debería lanzar NOT_FOUND si la parte no existe', async () => {
      partesRepository.eliminar.mockResolvedValue(false);

      await expect(partesService.eliminarParte('no-existe')).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    test('debería lanzar VALIDATION_ERROR si no se provee ID', async () => {
      await expect(partesService.eliminarParte('')).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      });
    });
  });

  // ─── getCatalogo ────────────────────────────────────────────────────────────
  describe('getCatalogo', () => {
    test('debería retornar los tipos y categorías válidas', () => {
      const catalogo = partesService.getCatalogo();
      expect(catalogo.tipos).toBeInstanceOf(Array);
      expect(catalogo.categorias).toBeInstanceOf(Array);
      expect(catalogo.tipos.length).toBeGreaterThan(0);
      expect(catalogo.categorias.length).toBeGreaterThan(0);
    });

    test('debería incluir tipos comunes de partes de motos', () => {
      const catalogo = partesService.getCatalogo();
      expect(catalogo.tipos).toContain('motor');
      expect(catalogo.tipos).toContain('frenos');
      expect(catalogo.tipos).toContain('suspension');
    });
  });
});
