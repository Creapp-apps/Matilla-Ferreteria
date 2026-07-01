import React, { useState, useEffect } from 'react';
import { db, type BoxSession, type Sale } from '@/services/localDb';
import { StockAlerts } from '@/components/Backoffice/StockAlerts';
import { DollarSign, ShieldAlert, BarChart3, Clock, ArrowRightLeft, ListCollapse } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [activeSession, setActiveSession] = useState<BoxSession | null>(null);
  const [pastSessions, setPastSessions] = useState<BoxSession[]>([]);
  const [criticalCount, setCriticalCount] = useState(0);

  const fetchDashboardData = async () => {
    // 1. Get open session
    const openSession = await db.boxSessions.where('status').equals('open').first();
    setActiveSession(openSession || null);

    // 2. Get past sessions (max 5)
    const listSessions = await db.boxSessions
      .where('status')
      .equals('closed')
      .reverse()
      .limit(5)
      .toArray();
    setPastSessions(listSessions);

    // 3. Get sales of active session (if open)
    if (openSession?.id) {
      const activeSales = await db.sales.where('box_session_id').equals(openSession.id).toArray();
      setSales(activeSales.reverse());
    } else {
      setSales([]);
    }

    // 4. Get counts

    const allProducts = await db.products.toArray();
    const countCritical = allProducts.filter((p) => p.stock <= p.min_stock).length;
    setCriticalCount(countCritical);
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 8000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleString('es-AR');
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Welcome Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={24} style={{ color: 'var(--color-primary)' }} />
          <span>Panel de Control</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Métricas operativas del turno activo de caja y alertas de inventario en tiempo real.
        </p>
      </div>

      {/* Numerical Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Metric 1: Open session state */}
        <div className="glass-panel" style={{ padding: '20px', background: 'var(--bg-surface-solid)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: activeSession ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', color: activeSession ? 'var(--color-success)' : 'var(--color-danger)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ESTADO DE CAJA</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {activeSession ? 'Operando Turno' : 'Turno Cerrado'}
            </span>
          </div>
        </div>

        {/* Metric 2: Cashier Drawer Total */}
        <div className="glass-panel" style={{ padding: '20px', background: 'var(--bg-surface-solid)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>EFECTIVO ESTIMADO</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-success)' }}>
              {activeSession ? formatCurrency(activeSession.expected_balance) : '$0'}
            </span>
          </div>
        </div>

        {/* Metric 3: Total sales in active session */}
        <div className="glass-panel" style={{ padding: '20px', background: 'var(--bg-surface-solid)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-primary)' }}>
            <ArrowRightLeft size={24} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>VENTAS DEL TURNO</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {sales.length}
            </span>
          </div>
        </div>

        {/* Metric 4: Catalog products */}
        <div className="glass-panel" style={{ padding: '20px', background: 'var(--bg-surface-solid)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: criticalCount > 0 ? 'var(--color-warning-bg)' : 'rgba(255,255,255,0.03)', color: criticalCount > 0 ? 'var(--color-warning)' : 'var(--text-secondary)' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ALERTAS DE STOCK</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: criticalCount > 0 ? 'var(--color-warning)' : 'inherit' }}>
              {criticalCount}
            </span>
          </div>
        </div>

      </div>

      {/* Main dashboard content grids */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Recent sales history in current session */}
          <div className="glass-panel" style={{ padding: '20px', background: 'var(--bg-surface-solid)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: 'var(--color-primary)' }} />
              <span>Ventas Recientes del Turno</span>
            </h3>
            
            <div className="table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>ID Transac.</th>
                    <th>Medio Pago</th>
                    <th style={{ textAlign: 'right' }}>Importe Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {new Date(sale.timestamp).toLocaleTimeString('es-AR')}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        #{sale.id?.toString().padStart(6, '0')}
                      </td>
                      <td style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>
                        {sale.payment_method}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(sale.total_amount)}
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                        No se registraron ventas en el turno actual de caja.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Past sessions list showing discrepancy audits */}
          <div className="glass-panel" style={{ padding: '20px', background: 'var(--bg-surface-solid)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListCollapse size={18} style={{ color: 'var(--color-primary)' }} />
              <span>Auditoría de Cierres Anteriores</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '14px' }}>
              Comparativa de arqueos para detección rápida de desvíos de caja.
            </p>

            <div className="table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Apertura</th>
                    <th>Cierre</th>
                    <th style={{ textAlign: 'right' }}>Teórico (Sistema)</th>
                    <th style={{ textAlign: 'right' }}>Real (Arqueo)</th>
                    <th style={{ textAlign: 'right' }}>Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {pastSessions.map((session) => {
                    const teórico = session.expected_balance;
                    const real = session.actual_balance || 0;
                    const dif = real - teórico;

                    return (
                      <tr key={session.id}>
                        <td>{formatDate(session.opened_at)}</td>
                        <td>{session.closed_at ? formatDate(session.closed_at) : 'N/A'}</td>
                        <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCurrency(teórico)}</td>
                        <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCurrency(real)}</td>
                        <td 
                          style={{ 
                            textAlign: 'right', 
                            fontWeight: 700, 
                            color: dif === 0 ? 'var(--color-success)' : dif > 0 ? 'var(--color-success)' : 'var(--color-danger)'
                          }}
                        >
                          {dif > 0 ? '+' : ''}{formatCurrency(dif)}
                        </td>
                      </tr>
                    );
                  })}
                  {pastSessions.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                        No hay registros de arqueos pasados finalizados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Side Column: Stock Alerts Panel */}
        <StockAlerts onStockUpdated={fetchDashboardData} />

      </div>

    </div>
  );
};

export default Dashboard;
