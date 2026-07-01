import React from 'react';
import { Trash2, Plus, Minus, ShoppingCart, MapPin } from 'lucide-react';
import { type Product } from '@/types/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (sku: string, change: number) => void;
  onRemoveItem: (sku: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export const Cart: React.FC<CartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      {/* Active cart header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem' }}>
          <ShoppingCart size={22} style={{ color: 'var(--color-primary)' }} />
          <span>Detalle de la Venta</span>
          <span style={{ fontSize: '0.8rem', padding: '2px 8px', background: 'var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
            {totalItemsCount} {totalItemsCount === 1 ? 'artículo' : 'artículos'}
          </span>
        </h2>
        {items.length > 0 && (
          <button 
            onClick={onClearCart} 
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.85rem', color: 'var(--color-danger)' }}
          >
            <Trash2 size={15} />
            <span>Vaciar [F3]</span>
          </button>
        )}
      </div>

      {/* Cart items list */}
      <div 
        className="glass-panel custom-scrollbar" 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          background: 'var(--bg-surface-solid)', 
          minHeight: '280px',
          borderRadius: 'var(--radius-sm)'
        }}
      >
        {items.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px', color: 'var(--text-tertiary)' }}>
            <ShoppingCart size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '8px' }}>El carrito está vacío</p>
            <p style={{ fontSize: '0.85rem', textAlign: 'center', maxWidth: '300px', marginBottom: '20px' }}>
              Escanee un código de barras o use el buscador para comenzar la venta.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                <span className="keycap">F2</span>
                <span>Buscar productos</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                <span className="keycap">Scanner</span>
                <span>Lectura rápida</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Producto</th>
                  <th style={{ width: '20%', textAlign: 'center' }}>Cantidad</th>
                  <th style={{ width: '15%' }}>Ubicación</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Subtotal</th>
                  <th style={{ width: '5%', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.product.sku}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{item.product.name}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                          <span>SKU: {item.product.sku}</span>
                          <span>•</span>
                          <span>Marca: {item.product.brand}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <button
                          onClick={() => onUpdateQuantity(item.product.sku, -1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '4px',
                            background: 'var(--bg-surface-hover)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.sku, 1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '4px',
                            background: 'var(--bg-surface-hover)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px', 
                          fontSize: '0.8rem', 
                          color: 'var(--color-primary)',
                          background: 'var(--color-primary-bg)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 500
                        }}
                      >
                        <MapPin size={12} />
                        <span>{item.product.location}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '1rem' }}>
                      {formatCurrency(item.product.price * item.quantity)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => onRemoveItem(item.product.sku)}
                        style={{ color: 'var(--color-danger)', cursor: 'pointer', opacity: 0.8 }}
                        title="Eliminar producto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cart Summary & Trigger Checkout */}
      {items.length > 0 && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '20px', 
            background: 'var(--bg-surface-solid)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monto Total Estimado</span>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {formatCurrency(getSubtotal())}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <span className="keycap">F4</span>
                <span>Iniciar cobro</span>
              </div>
            </div>
            <button 
              onClick={onCheckout} 
              className="btn btn-primary" 
              style={{ padding: '14px 28px', fontSize: '1.1rem', gap: '12px' }}
            >
              <span>Cobrar Venta</span>
              <Plus size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
