import React, { useState } from 'react';
import { Play, ShieldAlert } from 'lucide-react';

interface OpenBoxModalProps {
  onOpenSession: (initialBalance: number) => void;
}

export const OpenBoxModal: React.FC<OpenBoxModalProps> = ({ onOpenSession }) => {
  const [balanceText, setBalanceText] = useState('10000');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = Number(balanceText);
    if (isNaN(balance) || balance < 0) {
      alert('Por favor ingrese un monto inicial válido.');
      return;
    }
    onOpenSession(balance);
  };

  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        padding: '24px'
      }}
    >
      <div 
        className="glass-panel"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '32px',
          background: 'var(--bg-surface-solid)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center'
        }}
      >
        <div 
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--color-primary-bg)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}
        >
          <ShieldAlert size={28} />
        </div>

        <h2 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>Turno de Caja Cerrado</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
          Para poder emitir tickets y procesar checkouts, registre el saldo inicial de efectivo del cajón físico.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
              Efectivo de Apertura ($)
            </label>
            <input
              type="number"
              className="input-field"
              style={{ fontSize: '1.2rem', fontWeight: 700, padding: '12px 16px' }}
              value={balanceText}
              onChange={(e) => setBalanceText(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '14px', width: '100%', fontSize: '1.1rem', gap: '10px' }}>
            <Play size={18} />
            <span>Abrir Turno de Caja</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default OpenBoxModal;
