import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, DollarSign, Send, Printer, X, CheckCircle, Users } from 'lucide-react';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import { db, type Customer } from '@/services/localDb';

interface PaymentModalProps {
  isOpen: boolean;
  subtotal: number;
  onClose: () => void;
  onConfirmPayment: (details: {
    paymentMethod: 'cash' | 'card' | 'transfer' | 'credit';
    discount: number;
    surcharge: number;
    total: number;
    amountPaid: number;
    customerId?: number;
  }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  subtotal,
  onClose,
  onConfirmPayment
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'credit'>('cash');
  const [amountPaidText, setAmountPaidText] = useState('');
  const [customDiscountText, setCustomDiscountText] = useState('');
  const [customSurchargeText, setCustomSurchargeText] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>(undefined);

  const paidInputRef = useRef<HTMLInputElement>(null);

  // Auto-calculated defaults:
  // - Cash: 10% discount
  // - Card: 10% surcharge
  // - Transfer: 0% adjustment
  const autoDiscount = paymentMethod === 'cash' ? Math.round(subtotal * 0.1) : 0;
  const autoSurcharge = paymentMethod === 'card' ? Math.round(subtotal * 0.1) : 0;

  // Custom adjustments (override defaults if typed)
  const discount = customDiscountText !== '' ? Number(customDiscountText) : autoDiscount;
  const surcharge = customSurchargeText !== '' ? Number(customSurchargeText) : autoSurcharge;

  const total = subtotal + surcharge - discount;
  const amountPaid = amountPaidText !== '' ? Number(amountPaidText) : total;
  const change = amountPaid - total;

  // Focus input and load customers when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset inputs
      setPaymentMethod('cash');
      setAmountPaidText('');
      setCustomDiscountText('');
      setCustomSurchargeText('');
      setSelectedCustomerId(undefined);
      
      db.customers.toArray().then((list) => {
        setCustomers(list);
        if (list.length > 0) {
          setSelectedCustomerId(list[0].id);
        }
      }).catch(err => console.error('Failed to load customers:', err));
      
      setTimeout(() => {
        if (paidInputRef.current) {
          paidInputRef.current.focus();
          paidInputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (paymentMethod !== 'credit' && amountPaid < total) {
      alert('El monto abonado es menor que el total de la venta.');
      return;
    }

    if (paymentMethod === 'credit' && !selectedCustomerId) {
      alert('Debe seleccionar un cliente para registrar la deuda.');
      return;
    }

    onConfirmPayment({
      paymentMethod,
      discount: paymentMethod === 'credit' ? 0 : discount,
      surcharge: paymentMethod === 'credit' ? 0 : surcharge,
      total: paymentMethod === 'credit' ? subtotal : total,
      amountPaid: paymentMethod === 'credit' ? 0 : amountPaid,
      customerId: paymentMethod === 'credit' ? selectedCustomerId : undefined
    });
  };

  // Keyboard shortcut: Escape to close modal, F5 to confirm/print
  useKeyboardShortcuts(
    {
      Escape: () => onClose(),
      F5: () => handleConfirm()
    },
    isOpen
  );

  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div 
        className="glass-panel" 
        style={{
          width: '540px',
          background: 'var(--bg-surface-solid)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div 
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
            <Printer size={20} style={{ color: 'var(--color-primary)' }} />
            <span>Cobro y Emisión de Ticket</span>
          </h3>
          <button onClick={onClose} style={{ color: 'var(--text-tertiary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Subtotal Display */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            <span>Subtotal de Artículos:</span>
            <span style={{ fontWeight: 600 }}>{formatCurrency(subtotal)}</span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
              Método de Pago
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <button
                type="button"
                onClick={() => { setPaymentMethod('cash'); setAmountPaidText(''); }}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${paymentMethod === 'cash' ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  background: paymentMethod === 'cash' ? 'var(--color-primary-bg)' : 'transparent',
                  color: paymentMethod === 'cash' ? 'var(--color-primary)' : 'var(--text-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontWeight: paymentMethod === 'cash' ? 700 : 500
                }}
              >
                <DollarSign size={20} />
                <span style={{ fontSize: '0.8rem' }}>Efectivo (-10%)</span>
              </button>

              <button
                type="button"
                onClick={() => { setPaymentMethod('card'); setAmountPaidText(''); }}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${paymentMethod === 'card' ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  background: paymentMethod === 'card' ? 'var(--color-primary-bg)' : 'transparent',
                  color: paymentMethod === 'card' ? 'var(--color-primary)' : 'var(--text-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontWeight: paymentMethod === 'card' ? 700 : 500
                }}
              >
                <CreditCard size={20} />
                <span style={{ fontSize: '0.8rem' }}>Tarjeta (+10%)</span>
              </button>

              <button
                type="button"
                onClick={() => { setPaymentMethod('transfer'); setAmountPaidText(''); }}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${paymentMethod === 'transfer' ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  background: paymentMethod === 'transfer' ? 'var(--color-primary-bg)' : 'transparent',
                  color: paymentMethod === 'transfer' ? 'var(--color-primary)' : 'var(--text-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontWeight: paymentMethod === 'transfer' ? 700 : 500
                }}
              >
                <Send size={20} />
                <span style={{ fontSize: '0.8rem' }}>Transferencia</span>
              </button>

              <button
                type="button"
                onClick={() => { setPaymentMethod('credit'); setAmountPaidText('0'); }}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${paymentMethod === 'credit' ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  background: paymentMethod === 'credit' ? 'var(--color-primary-bg)' : 'transparent',
                  color: paymentMethod === 'credit' ? 'var(--color-primary)' : 'var(--text-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontWeight: paymentMethod === 'credit' ? 700 : 500
                }}
              >
                <Users size={20} />
                <span style={{ fontSize: '0.8rem' }}>Cta. Cte</span>
              </button>
            </div>
          </div>

          {/* Adjustments row */}
          {paymentMethod !== 'credit' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                  Descuento ($)
                </label>
                <input
                  type="number"
                  className="input-field"
                  style={{ padding: '8px 12px' }}
                  placeholder={autoDiscount > 0 ? `${autoDiscount} (10%)` : '0'}
                  value={customDiscountText}
                  onChange={(e) => setCustomDiscountText(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                  Recargo ($)
                </label>
                <input
                  type="number"
                  className="input-field"
                  style={{ padding: '8px 12px' }}
                  placeholder={autoSurcharge > 0 ? `${autoSurcharge} (10%)` : '0'}
                  value={customSurchargeText}
                  onChange={(e) => setCustomSurchargeText(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Amount Paid Input or Customer Selector */}
          {paymentMethod === 'credit' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Seleccionar Cliente Deudor
              </label>
              <select
                className="input-field"
                style={{ padding: '10px 12px', fontSize: '0.95rem' }}
                value={selectedCustomerId || ''}
                onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
              >
                <option value="">-- Seleccionar Cliente --</option>
                {customers.map((c) => {
                  const rem = c.max_credit - c.current_debt;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} (CUIT: {c.cuit_dni}) — Disponible: {formatCurrency(rem)}
                    </option>
                  );
                })}
              </select>
              {(() => {
                const client = customers.find((c) => c.id === selectedCustomerId);
                if (!client) return null;
                const rem = client.max_credit - client.current_debt;
                const isOverLimit = subtotal > rem;

                return (
                  <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-tertiary)' }}>
                      <span>Límite de Crédito:</span>
                      <span>{formatCurrency(client.max_credit)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-tertiary)' }}>
                      <span>Deuda Acumulada:</span>
                      <span style={{ color: client.current_debt > 0 ? 'var(--color-danger)' : 'inherit' }}>
                        {formatCurrency(client.current_debt)}
                      </span>
                    </div>
                    {isOverLimit && (
                      <span style={{ color: 'var(--color-danger)', fontWeight: 700, marginTop: '4px' }}>
                        ⚠️ ¡ADVERTENCIA! El total ({formatCurrency(subtotal)}) supera el límite disponible ({formatCurrency(rem)}).
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                Monto Entregado por Cliente
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>$</span>
                <input
                  ref={paidInputRef}
                  type="number"
                  className="input-field"
                  style={{ paddingLeft: '32px', fontSize: '1.25rem', fontWeight: 700 }}
                  placeholder={total.toString()}
                  value={amountPaidText}
                  onChange={(e) => setAmountPaidText(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Financial Totals Breakdown */}
          <div 
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {paymentMethod !== 'credit' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Ajustes aplicados:</span>
                <span style={{ color: surcharge > 0 ? 'var(--color-danger)' : discount > 0 ? 'var(--color-success)' : 'inherit' }}>
                  {surcharge > 0 ? `+ ${formatCurrency(surcharge)}` : discount > 0 ? `- ${formatCurrency(discount)}` : '$0'}
                </span>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span>Total a Cobrar:</span>
              <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(paymentMethod === 'credit' ? subtotal : total)}</span>
            </div>

            {paymentMethod === 'credit' ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', paddingTop: '4px', color: 'var(--color-danger)' }}>
                <span>A Registrar en Cta. Cte:</span>
                <span style={{ fontWeight: 700 }}>
                  {formatCurrency(subtotal)}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', paddingTop: '4px', color: change >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                <span>Vuelto:</span>
                <span style={{ fontWeight: 700 }}>
                  {change >= 0 ? formatCurrency(change) : 'Falta abonar'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div 
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-color)',
            background: 'rgba(0,0,0,0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            <span className="keycap">F5</span>
            <span>Confirmar y Emitir Ticket</span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleConfirm}
              disabled={paymentMethod !== 'credit' ? (amountPaid < total) : (!selectedCustomerId)}
              style={{ gap: '8px' }}
            >
              <CheckCircle size={18} />
              <span>Completar Cobro [F5]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
