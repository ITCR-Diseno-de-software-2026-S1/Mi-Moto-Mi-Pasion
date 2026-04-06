/**
 * Model: Parte
 * Representa una parte de moto en el marketplace
 */

const TIPOS_VALIDOS = [
  'motor',
  'frenos',
  'suspension',
  'transmision',
  'electrico',
  'carroceria',
  'escape',
  'ruedas',
  'accesorios',
  'otro'
];

const CATEGORIAS_VALIDAS = [
  'nueva',
  'usada',
  'reacondicionada'
];

class Parte {
  constructor({ id, nombre, tipo, categoria, precio, descripcion, vendedor, estado, createdAt, updatedAt }) {
    this.id = id;
    this.nombre = nombre;
    this.tipo = tipo;
    this.categoria = categoria || 'usada';
    this.precio = precio;
    this.descripcion = descripcion || '';
    this.vendedor = vendedor || 'Anónimo';
    this.estado = estado || 'disponible';
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      tipo: this.tipo,
      categoria: this.categoria,
      precio: this.precio,
      descripcion: this.descripcion,
      vendedor: this.vendedor,
      estado: this.estado,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static getTiposValidos() {
    return TIPOS_VALIDOS;
  }

  static getCategoriasValidas() {
    return CATEGORIAS_VALIDAS;
  }
}

module.exports = { Parte, TIPOS_VALIDOS, CATEGORIAS_VALIDAS };
