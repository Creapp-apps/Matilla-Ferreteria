import React, { useState, useEffect } from 'react';
import { db } from '@/services/localDb';
import { type Product } from '@/types/product';
import { AlertTriangle, Plus, Check } from 'lucide-react';

interface StockAlertsProps {
  onStockUpdated?: () => void;
}

export const StockAlerts: React.FC<StockAlertsProps> = ({ onStockUpdated }) => {
  const [criticalItems, setCriticalItems] = useState<Product[]>([]);
  const [replenishedSku, setReplenishedSku] = useState<string | null>(null);

  const fetchCriticalItems = async () => {
    const all = await db.products.toArray();
    // Filter items where stock <= min_stock
    const filtered = all.filter((p) => p.stock <= p.min_stock);
    
    // Sort out-of-stock items first, then lowest stock
    filtered.sort((a, b) => {
      if (a.stock === 0 && b.stock > 0) return -1;
      if (a.stock > 0 && b.stock === 0) return 1;
      return a.stock - b.stock;
    });

    setCriticalItems(filtered.slice(0, 10)); // Display max 10 alerts on dashboard
  };

  useEffect(() => {
    fetchCriticalItems();
    
    // Set up database polling or listener
    const interval = setInterval(fetchCriticalItems, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickReplenish = async (id: number, currentStock: number, sku: string) => {
    try {
      const addedQuantity = 10;
      await db.products.update(id, { stock: currentStock + addedQuantity });
      setReplenishedSku(sku);
      await fetchCriticalItems();
      if (onStockUpdated) onStockUpdated();

      // Reset feedback icon after 2 seconds
      setTimeout(() => {
        setReplenishedSku(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to quick replenish stock:', err);
    }
  };

  return (
    <div 
      className="glass-panel"
      style={{
        padding: '20px',
        background: 'var(--bg-surface-solid)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />
        <span>Alertas de Stock Crítico ({criticalItems.length})</span>
      </h3>

      <div 
        className="custom-scrollbar"
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          maxHeight: '340px',
          overflowY: 'auto'
        }}
      >
        {criticalItems.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
            No hay alertas de stock. Todos los niveles están normales.
          </div>
        ) : (
          criticalItems.map((item) => {
            const isOutOfStock = item.stock === 0;
            const isReplenishing = replenishedSku === item.sku;

            return (
              <div
                key={item.sku}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isOutOfStock ? 'rgba(240, 113, 103, 0.2)' : 'var(--border-color)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: isOutOfStock ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                    {item.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    <span>SKU: {item.sku}</span>
                    <span>•</span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>{item.location}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isOutOfStock ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                      Stock: {item.stock}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                      Límite: {item.min_stock}
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickReplenish(item.id!, item.stock, item.sku)}
                    disabled={isReplenishing}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '4px',
                      background: isReplenishing ? 'var(--color-success-bg)' : 'var(--color-primary-bg)',
                      color: isReplenishing ? 'var(--color-success)' : 'var(--color-primary)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isReplenishing ? 'default' : 'pointer'
                    }}
                    title="Añadir +10 unidades"
                  >
                    {isReplenishing ? <Check size={16} /> : <Plus size={16} />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StockAlerts;
