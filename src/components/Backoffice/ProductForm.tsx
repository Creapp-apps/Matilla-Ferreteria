import React, { useState, useEffect } from 'react';
import { type Product } from '@/types/product';
import { getPrice } from '@/services/mockData';
import { Save, X, Calculator, Tag, MapPin, Package } from 'lucide-react';

interface ProductFormProps {
  product: Product | null;
  onSubmit: (productData: Omit<Product, 'id'> & { id?: number }) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'Herramientas',
  'Bulonería',
  'Pinturas',
  'Electricidad',
  'Plomería',
  'Jardín',
  'Seguridad'
];

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [cost, setCost] = useState<number>(0);
  const [markupPercent, setMarkupPercent] = useState<number>(40);
  const [stock, setStock] = useState<number>(10);
  const [minStock, setMinStock] = useState<number>(5);
  const [location, setLocation] = useState('');

  // Auto-calculated retail price
  const calculatedPrice = getPrice(cost, markupPercent);

  // Load product fields if editing
  useEffect(() => {
    if (product) {
      setSku(product.sku);
      setName(product.name);
      setBrand(product.brand);
      setCategory(product.category);
      setCost(product.cost);
      setMarkupPercent(product.markup_percent);
      setStock(product.stock);
      setMinStock(product.min_stock);
      setLocation(product.location);
    } else {
      // Clear for new item creation
      setSku('');
      setName('');
      setBrand('');
      setCategory(CATEGORIES[0]);
      setCost(0);
      setMarkupPercent(40);
      setStock(10);
      setMinStock(5);
      setLocation('');
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name || !brand || !location) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    onSubmit({
      id: product?.id,
      sku,
      name,
      brand,
      category,
      cost,
      markup_percent: markupPercent,
      price: calculatedPrice,
      stock,
      min_stock: minStock,
      location
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title */}
      <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        {product ? 'Editar Producto' : 'Nuevo Producto'}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* SKU */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
            Código de Barras / SKU *
          </label>
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <Tag size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '36px' }}
              placeholder="7791234567890"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
            Categoría *
          </label>
          <select
            className="input-field"
            style={{ 
              background: 'var(--bg-surface-solid)', 
              color: 'var(--text-primary)',
              appearance: 'none',
              cursor: 'pointer'
            }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        {/* Name */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
            Nombre del Artículo *
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="Ej. Destornillador Philips 1/4x4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Brand */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
            Marca *
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="Stanley, Tacsa..."
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Warehouse location */}
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
          Ubicación Física en Depósito / Local *
        </label>
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <MapPin size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-primary)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '36px', borderColor: 'var(--border-color-glow)' }}
            placeholder="Ej: Pasillo 3, Estante 47"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
          Indica una única cadena indicando la coordenada exacta para despacho veloz.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        {/* Cost */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
            Costo de Compra ($)
          </label>
          <input
            type="number"
            className="input-field"
            value={cost === 0 ? '' : cost}
            placeholder="0"
            onChange={(e) => setCost(Math.max(0, Number(e.target.value)))}
          />
        </div>

        {/* Markup Percent */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
            Ganancia (%)
          </label>
          <input
            type="number"
            className="input-field"
            value={markupPercent}
            onChange={(e) => setMarkupPercent(Math.max(0, Number(e.target.value)))}
          />
        </div>

        {/* Calculated Retail Price */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
            Precio de Venta al Público
          </label>
          <div 
            style={{
              padding: '10px 16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Calculator size={16} style={{ opacity: 0.5 }} />
            <span>{formatCurrency(calculatedPrice)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        {/* Stock */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
            Stock Físico Inicial
          </label>
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <Package size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-tertiary)' }} />
            <input
              type="number"
              className="input-field"
              style={{ paddingLeft: '36px' }}
              value={stock}
              onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
            />
          </div>
        </div>

        {/* Stock Minimo */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
            Punto de Pedido (Stock Mínimo)
          </label>
          <input
            type="number"
            className="input-field"
            value={minStock}
            onChange={(e) => setMinStock(Math.max(0, Number(e.target.value)))}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '12px', marginTop: '10px' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          <X size={18} />
          <span>Cancelar</span>
        </button>
        <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', gap: '8px' }}>
          <Save size={18} />
          <span>Guardar Cambios</span>
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
