import React, { useState, useEffect } from 'react';
import { db, type BoxSession, type Sale } from '@/services/localDb';
import { ShieldCheck, ShieldAlert, Calendar, History, Search } from 'lucide-react';

export const CashBox: React.FC = () => {
  const [sessions, setSessions] = useState<BoxSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionSales, setSelectedSessionSales] = useState<Sale[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  const fetchSessions = async () => {
    const list = await db.boxSessions.reverse().toArray();
    setSessions(list);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSelectSession = async (id: number) => {
    setSelectedSessionId(id);
    const salesList = await db.sales.where('box_session_id').equals(id).toArray();
    setSelectedSessionSales(salesList.reverse());
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleString('es-AR');
  };

  const filteredSessions = sessions.filter((s) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    const dateStr = new Date(s.opened_at).toLocaleDateString('es-AR').toLowerCase();
    const statusStr = s.status === 'open' ? 'abierto' : 'cerrado';
    return (
      dateStr.includes(term) ||
      statusStr.includes(term) ||
      s.id?.toString().includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={24} style={{ color: 'var(--color-primary)' }} />
          <span>Historial de Arqueos y Caja</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Consulte los turnos de caja anteriores, arqueos contados y desvíos de dinero.
        </p>
      </div>

      {/* Grid: Shift List (left) + Shift Details/Sales Audit (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side: Session list */}
        <div className="glass-panel" style={{ background: 'var(--bg-surface-solid)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '2px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', marginBottom: '16px' }}>
            <Search size={18} style={{ color: 'var(--text-tertiary)', marginRight: '10px' }} />
            <input
              type="text"
              className="input-field"
              style={{ border: 'none', padding: '8px 0', fontSize: '0.95rem' }}
              placeholder="Buscar por fecha de apertura o estado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="table-container" style={{ maxHeight: '550px', overflowY: 'auto' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Turno ID</th>
                  <th>Apertura</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Teórico</th>
                  <th style={{ textAlign: 'right' }}>Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((s) => {
                  const isSelected = selectedSessionId === s.id;
                  const real = s.actual_balance ?? s.expected_balance;
                  const diff = real - s.expected_balance;
                  const isClosed = s.status === 'closed';

                  return (
                    <tr 
                      key={s.id} 
                      onClick={() => handleSelectSession(s.id!)}
                      style={{ 
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(235, 94, 40, 0.05)' : 'transparent',
                        borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-color)'
                      }}
                    >
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        #{s.id?.toString().padStart(5, '0')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{formatDate(s.opened_at)}</span>
                        </div>
                      </td>
                      <td>
                        <span 
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            background: isClosed ? 'rgba(255,255,255,0.03)' : 'var(--color-success-bg)',
                            color: isClosed ? 'var(--text-secondary)' : 'var(--color-success)',
                            border: isClosed ? '1px solid var(--border-color)' : '1px solid var(--color-success)'
                          }}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {formatCurrency(s.expected_balance)}
                      </td>
                      <td 
                        style={{ 
                          textAlign: 'right', 
                          fontWeight: 700,
                          color: diff === 0 ? 'var(--color-success)' : diff > 0 ? 'var(--color-success)' : 'var(--color-danger)'
                        }}
                      >
                        {!isClosed ? 'N/A' : (diff > 0 ? '+' : '') + formatCurrency(diff)}
                      </td>
                    </tr>
                  );
                })}
                {filteredSessions.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                      No se encontraron registros de turnos de caja.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Selected session audit details */}
        <div>
          {selectedSessionId === null ? (
            <div 
              className="glass-panel" 
              style={{ 
                padding: '40px 20px', 
                background: 'var(--bg-surface-solid)', 
                textAlign: 'center', 
                color: 'var(--text-tertiary)',
                fontSize: '0.9rem'
              }}
            >
              Seleccione un turno de caja de la lista para auditar el flujo de fondos detallado y ventas registradas.
            </div>
          ) : (
            (() => {
              const session = sessions.find((s) => s.id === selectedSessionId);
              if (!session) return null;

              const real = session.actual_balance ?? session.expected_balance;
              const diff = real - session.expected_balance;
              const isAuditClean = diff === 0;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Summary audit status card */}
                  <div 
                    className="glass-panel" 
                    style={{ 
                      padding: '24px', 
                      background: 'var(--bg-surface-solid)',
                      border: `1px solid ${session.status === 'open' ? 'var(--color-success)' : isAuditClean ? 'var(--border-color)' : 'var(--color-danger)'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Auditoría Turno #{session.id}</h3>
                      {session.status === 'open' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontSize: '0.8rem', fontWeight: 600 }}>
                          <span style={{ width: '8px', height: '8px', background: 'var(--color-success)', borderRadius: '50%' }}></span>
                          <span>EN CURSO</span>
                        </div>
                      ) : isAuditClean ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', fontSize: '0.8rem', fontWeight: 600 }}>
                          <ShieldCheck size={16} />
                          <span>ARQUEO CORRECTO</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-danger)', fontSize: '0.8rem', fontWeight: 600 }}>
                          <ShieldAlert size={16} />
                          <span>DESVÍO DETECTADO</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                        <span>Apertura:</span>
                        <span>{formatDate(session.opened_at)}</span>
                      </div>
                      {session.closed_at && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span>Cierre:</span>
                          <span>{formatDate(session.closed_at)}</span>
                        </div>
                      )}
                      <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Saldo Inicial Apertura:</span>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(session.initial_balance)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Ventas en Efectivo:</span>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(session.expected_balance - session.initial_balance)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '6px' }}>
                        <span>Saldo Esperado (Sistema):</span>
                        <span style={{ fontWeight: 700 }}>{formatCurrency(session.expected_balance)}</span>
                      </div>
                      {session.status === 'closed' && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Arqueo Físico Contado:</span>
                            <span style={{ fontWeight: 700 }}>{formatCurrency(session.actual_balance || 0)}</span>
                          </div>
                          <div 
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              borderTop: '1px solid var(--border-color)', 
                              paddingTop: '6px',
                              color: diff >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                              fontWeight: 800
                            }}
                          >
                            <span>Diferencia de Caja:</span>
                            <span>{diff > 0 ? '+' : ''}{formatCurrency(diff)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Transaction breakdown during session */}
                  <div className="glass-panel" style={{ padding: '20px', background: 'var(--bg-surface-solid)' }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} style={{ color: 'var(--color-primary)' }} />
                      <span>Transacciones del Turno ({selectedSessionSales.length})</span>
                    </h4>

                    <div className="table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                      <table className="premium-table">
                        <thead>
                          <tr>
                            <th>Hora</th>
                            <th>Medio Pago</th>
                            <th style={{ textAlign: 'right' }}>Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSessionSales.map((sale) => (
                            <tr key={sale.id}>
                              <td style={{ color: 'var(--text-secondary)' }}>
                                {new Date(sale.timestamp).toLocaleTimeString('es-AR')}
                              </td>
                              <td style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                {sale.payment_method}
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                {formatCurrency(sale.total_amount)}
                              </td>
                            </tr>
                          ))}
                          {selectedSessionSales.length === 0 && (
                            <tr>
                              <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                No se registraron ventas en este turno de caja.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              );
            })()
          )}
        </div>

      </div>

    </div>
  );
};

export default CashBox;
