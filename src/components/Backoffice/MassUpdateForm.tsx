import React, { useState } from 'react';
import { Percent, TrendingUp, AlertTriangle } from 'lucide-react';

interface MassUpdateFormProps {
  onApplyAdjustment: (params: {
    category: string;
    adjustmentType: 'price_percent' | 'markup_percent';
    value: number;
  }) => Promise<number>;
}

const CATEGORIES = [
  'Todas',
  'Herramientas',
  'Bulonería',
  'Pinturas',
  'Electricidad',
  'Plomería',
  'Jardín',
  'Seguridad'
];

export const MassUpdateForm: React.FC<MassUpdateFormProps> = ({ onApplyAdjustment }) => {
  const [category, setCategory] = useState('Todas');
  const [adjustmentType, setAdjustmentType] = useState<'price_percent' | 'markup_percent'>('price_percent');
  const [valueText, setValueText] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(valueText);
    if (isNaN(value) || value <= 0) {
      alert('Por favor ingrese un valor de porcentaje válido mayor a 0.');
      return;
    }

    const message = adjustmentType === 'price_percent'
      ? `¿Está seguro de incrementar un ${value}% el PRECIO FINAL de todos los artículos en la categoría "${category}"?`
      : `¿Está seguro de ajustar el MARGEN DE GANANCIA al ${value}% en todos los artículos en la categoría "${category}"?`;

    if (!window.confirm(message)) return;

    setIsSubmitting(true);
    setSuccessCount(null);

    try {
      const updatedCount = await onApplyAdjustment({
        category,
        adjustmentType,
        value
      });
      setSuccessCount(updatedCount);
      setTimeout(() => setSuccessCount(null), 5000);
    } catch (err) {
      console.error('Error applying mass adjustment:', err);
      alert('Ocurrió un error al procesar la actualización masiva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '24px', 
        background: 'var(--bg-surface-solid)',
        border: '1px solid var(--border-color-glow)'
      }}
    >
      <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <TrendingUp size={20} style={{ color: 'var(--color-primary)' }} />
        <span>Actualización Masiva de Precios</span>
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
        Ajuste precios rápidamente por categoría para responder a listas de proveedores o inflación en segundos.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Category Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
              Filtrar por Categoría
            </label>
            <select
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ background: 'var(--bg-surface-solid)', color: 'var(--text-primary)' }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Adjustment Type */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
              Tipo de Ajuste
            </label>
            <select
              className="input-field"
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as any)}
              style={{ background: 'var(--bg-surface-solid)', color: 'var(--text-primary)' }}
            >
              <option value="price_percent">Aumentar Precio Actual (%)</option>
              <option value="markup_percent">Cambiar Margen de Ganancia (%)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', alignItems: 'flex-end' }}>
          {/* Adjustment Value */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
              Valor del Porcentaje (%)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Percent size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-tertiary)' }} />
              <input
                type="number"
                className="input-field"
                style={{ paddingLeft: '36px' }}
                placeholder="10"
                value={valueText}
                onChange={(e) => setValueText(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', padding: '12px' }}
          >
            {isSubmitting ? 'Procesando...' : 'Aplicar Ajuste'}
          </button>
        </div>
      </form>

      {/* Warnings & Feedback alerts */}
      <div 
        style={{ 
          marginTop: '16px', 
          padding: '12px', 
          borderRadius: '4px', 
          background: 'rgba(235, 94, 40, 0.05)', 
          border: '1px solid rgba(235, 94, 40, 0.2)',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start'
        }}
      >
        <AlertTriangle size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          <strong>Atención:</strong> Esta acción modificará permanentemente los precios de los productos en la base de datos local. No se puede deshacer de forma automática.
        </span>
      </div>

      {successCount !== null && (
        <div 
          style={{ 
            marginTop: '16px', 
            padding: '12px', 
            borderRadius: '4px', 
            background: 'rgba(46, 196, 182, 0.1)', 
            border: '1px solid var(--color-success)',
            color: 'var(--color-success)',
            fontSize: '0.85rem',
            fontWeight: 600,
            textAlign: 'center'
          }}
        >
          ¡Éxito! Se actualizaron correctamente {successCount} productos.
        </div>
      )}
    </div>
  );
};

export default MassUpdateForm;
