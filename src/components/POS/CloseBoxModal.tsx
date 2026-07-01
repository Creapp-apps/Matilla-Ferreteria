import React, { useState, useEffect, useRef } from 'react';
import { Power, X } from 'lucide-react';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';

interface CloseBoxModalProps {
  isOpen: boolean;
  expectedBalance: number;
  onClose: () => void;
  onConfirmClose: (actualBalance: number) => void;
}

export const CloseBoxModal: React.FC<CloseBoxModalProps> = ({
  isOpen,
  expectedBalance,
  onClose,
  onConfirmClose
}) => {
  const [actualBalanceText, setActualBalanceText] = useState(expectedBalance.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActualBalanceText(expectedBalance.toString());
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, expectedBalance]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const actual = Number(actualBalanceText);
    if (isNaN(actual) || actual < 0) {
      alert('Por favor ingrese un monto contado de arqueo válido.');
      return;
    }
    onConfirmClose(actual);
  };

  // Bind shortcut key Enter to submit or Escape to close
  useKeyboardShortcuts(
    {
      Escape: () => onClose()
    },
    isOpen
  );

  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);
  };

  const actualBalance = Number(actualBalanceText) || 0;
  const difference = actualBalance - expectedBalance;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div 
        className="glass-panel" 
        style={{ width: '420px', padding: '24px', background: 'var(--bg-surface-solid)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
            <Power size={20} style={{ color: 'var(--color-danger)' }} />
            <span>Arqueo y Cierre de Caja</span>
          </h3>
          <button onClick={onClose} style={{ color: 'var(--text-tertiary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '18px', lineHeight: 1.4 }}>
          Por favor cuente el efectivo total en el cajón físico y regístrelo a continuación para calcular posibles diferencias de caja.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Real-time stats */}
          <div 
            style={{ 
              padding: '12px 16px', 
              borderRadius: '4px', 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <span>Esperado en Sistema:</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(expectedBalance)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <span>Contado Real:</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(actualBalance)}</span>
            </div>
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.9rem', 
                borderTop: '1px solid var(--border-color)',
                paddingTop: '6px',
                color: difference === 0 ? 'var(--color-success)' : difference > 0 ? 'var(--color-success)' : 'var(--color-danger)',
                fontWeight: 700
              }}
            >
              <span>Diferencia:</span>
              <span>
                {difference > 0 ? '+' : ''}
                {formatCurrency(difference)}
              </span>
            </div>
          </div>

          {/* Amount Paid input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
              Efectivo Contado Real ($)
            </label>
            <input
              ref={inputRef}
              type="number"
              className="input-field"
              style={{ fontSize: '1.25rem', fontWeight: 700 }}
              value={actualBalanceText}
              onChange={(e) => setActualBalanceText(e.target.value)}
              required
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-danger" style={{ flex: 1 }}>
              Confirmar y Cerrar Caja
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CloseBoxModal;
