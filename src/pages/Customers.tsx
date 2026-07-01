import React, { useState, useEffect } from 'react';
import { db, type Customer, type CreditPayment } from '@/services/localDb';
import { 
  Users, 
  Search, 
  DollarSign, 
  X, 
  CheckCircle, 
  UserPlus, 
  Phone, 
  TrendingDown,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<(CreditPayment & { customerName?: string })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // Form states
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    cuit_dni: '',
    max_credit: 100000,
    current_debt: 0
  });

  const [paymentForm, setPaymentForm] = useState({
    customerId: '',
    amount: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const customersList = await db.customers.toArray();
      setCustomers(customersList);

      const paymentsList = await db.creditPayments.reverse().toArray();
      // Join customer name
      const paymentsWithNames = await Promise.all(
        paymentsList.map(async (p) => {
          const cust = await db.customers.get(p.customer_id);
          return {
            ...p,
            customerName: cust ? cust.name : `Cliente #${p.customer_id}`
          };
        })
      );
      setPayments(paymentsWithNames);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      c.name.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term)) ||
      (c.cuit_dni && c.cuit_dni.includes(term))
    );
  });

  // Handle open Customer Form modal
  const openNewCustomerModal = () => {
    setEditingCustomer(null);
    setCustomerForm({
      name: '',
      phone: '',
      cuit_dni: '',
      max_credit: 150000,
      current_debt: 0
    });
    setIsCustomerModalOpen(true);
  };

  const openEditCustomerModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      name: customer.name,
      phone: customer.phone,
      cuit_dni: customer.cuit_dni || '',
      max_credit: customer.max_credit,
      current_debt: customer.current_debt
    });
    setIsCustomerModalOpen(true);
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name.trim()) {
      alert('El nombre es requerido.');
      return;
    }

    try {
      const customerData = {
        name: customerForm.name.trim(),
        phone: customerForm.phone.trim(),
        cuit_dni: customerForm.cuit_dni.trim() || undefined,
        max_credit: Number(customerForm.max_credit) || 0,
        current_debt: Number(customerForm.current_debt) || 0,
        created_at: editingCustomer ? editingCustomer.created_at : new Date().toISOString()
      };

      if (editingCustomer?.id) {
        await db.customers.update(editingCustomer.id, customerData);
      } else {
        await db.customers.add(customerData as Customer);
      }

      await fetchData();
      setIsCustomerModalOpen(false);
      setEditingCustomer(null);
    } catch (err) {
      console.error('Error saving customer:', err);
      alert('Error al guardar el cliente.');
    }
  };

  // Handle debt payment
  const openPaymentModal = (customerId?: number) => {
    setPaymentForm({
      customerId: customerId ? customerId.toString() : '',
      amount: '',
      notes: 'Abono de cuenta corriente'
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const custId = Number(paymentForm.customerId);
    const payAmount = Number(paymentForm.amount);
    
    if (!custId) {
      alert('Por favor seleccione un cliente.');
      return;
    }
    if (!payAmount || payAmount <= 0) {
      alert('Por favor ingrese un monto válido mayor a 0.');
      return;
    }

    try {
      // 1. Verify cash session is active
      const openSession = await db.boxSessions.where('status').equals('open').first();
      if (!openSession) {
        alert('⚠️ No hay una sesión de caja abierta. Primero debe abrir la caja desde la pantalla de Caja Rápida o Arqueos para ingresar dinero físico.');
        return;
      }

      const client = await db.customers.get(custId);
      if (!client) {
        alert('Cliente no encontrado.');
        return;
      }

      // 2. Add payment record
      await db.creditPayments.add({
        customer_id: custId,
        box_session_id: openSession.id!,
        amount: payAmount,
        timestamp: new Date().toISOString(),
        notes: paymentForm.notes.trim() || 'Abono de cuenta corriente'
      });

      // 3. Subtract from customer current debt
      const nextDebt = Math.max(0, client.current_debt - payAmount);
      await db.customers.update(custId, { current_debt: nextDebt });

      // 4. Update box session expected balance
      await db.boxSessions.update(openSession.id!, {
        expected_balance: openSession.expected_balance + payAmount
      });

      await fetchData();
      setIsPaymentModalOpen(false);
      alert(`Cobro registrado con éxito para ${client.name}. Deuda anterior: ${formatCurrency(client.current_debt)} -> Nueva deuda: ${formatCurrency(nextDebt)}. Se ingresaron ${formatCurrency(payAmount)} a la caja abierta.`);
    } catch (err) {
      console.error('Payment registration failed:', err);
      alert('Error al registrar el pago de deuda.');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={24} style={{ color: 'var(--color-primary)' }} />
            <span>Gestión de Cuentas Corrientes</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Administre las fichas de clientes recurrentes, saldos deudores, líneas de crédito y abonos de caja.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => openPaymentModal()}
            style={{ gap: '8px', border: '1px solid var(--border-color)' }}
          >
            <DollarSign size={18} />
            <span>Registrar Cobro</span>
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={openNewCustomerModal}
            style={{ gap: '8px' }}
          >
            <UserPlus size={18} />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Grid: Clients list (left) + Payment logs (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left: Customer profiles list */}
        <div className="glass-panel" style={{ background: 'var(--bg-surface-solid)', padding: '20px' }}>
          
          {/* Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '2px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', marginBottom: '16px' }}>
            <Search size={18} style={{ color: 'var(--text-tertiary)', marginRight: '10px' }} />
            <input
              type="text"
              className="input-field"
              style={{ border: 'none', padding: '8px 0', fontSize: '0.95rem' }}
              placeholder="Buscar por nombre, teléfono, DNI o CUIT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>DNI / CUIT</th>
                  <th style={{ textAlign: 'right' }}>Deuda Actual</th>
                  <th style={{ textAlign: 'right' }}>Límite de Crédito</th>
                  <th style={{ textAlign: 'center' }}>Disponible</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => {
                  const rem = c.max_credit - c.current_debt;
                  const usagePercent = Math.min(100, Math.round((c.current_debt / c.max_credit) * 100)) || 0;
                  const isNearLimit = usagePercent >= 80;

                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>{c.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Phone size={12} /> {c.phone || 'Sin número'}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        {c.cuit_dni || 'N/A'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: c.current_debt > 0 ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                        {formatCurrency(c.current_debt)}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {formatCurrency(c.max_credit)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.8rem', color: rem <= 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                            {formatCurrency(rem)}
                          </span>
                          {/* Credit Bar */}
                          <div style={{ width: '80px', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                width: `${usagePercent}%`, 
                                height: '100%', 
                                background: isNearLimit ? 'var(--color-danger)' : 'var(--color-primary)',
                                borderRadius: '3px'
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                          <button
                            onClick={() => openPaymentModal(c.id)}
                            style={{ 
                              color: 'var(--color-success)', 
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                            title="Cobrar Deuda"
                          >
                            <DollarSign size={14} />
                            <span>Cobrar</span>
                          </button>
                          
                          <button
                            onClick={() => openEditCustomerModal(c)}
                            style={{ 
                              color: 'var(--color-primary)', 
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                            title="Editar Datos"
                          >
                            <span>Editar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                      No se encontraron clientes registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Payment Records */}
        <div className="glass-panel" style={{ background: 'var(--bg-surface-solid)', padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <TrendingDown size={18} style={{ color: 'var(--color-success)' }} />
            <span>Abonos Recientes</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
            {payments.map((p) => (
              <div 
                key={p.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.customerName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    {formatDate(p.timestamp)}
                  </div>
                  {p.notes && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '2px' }}>
                      💬 {p.notes}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <ArrowUpRight size={14} />
                    <span>{formatCurrency(p.amount)}</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    Turno #{p.box_session_id}
                  </div>
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                No se registraron abonos en cuenta corriente recientemente.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Customer Create/Edit Modal */}
      {isCustomerModalOpen && (
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
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="glass-panel"
            style={{ 
              width: '460px', 
              padding: '24px', 
              background: 'var(--bg-surface-solid)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={18} style={{ color: 'var(--color-primary)' }} />
                <span>{editingCustomer ? 'Editar Ficha del Cliente' : 'Registrar Nuevo Cliente'}</span>
              </h3>
              <button onClick={() => setIsCustomerModalOpen(false)} style={{ color: 'var(--text-tertiary)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCustomerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                  Nombre y Apellido / Razón Social *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="Ej. Juan Gómez - Plomero"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                    Teléfono
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    placeholder="Ej. 261-5556677"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                    DNI o CUIT
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={customerForm.cuit_dni}
                    onChange={(e) => setCustomerForm({ ...customerForm, cuit_dni: e.target.value })}
                    placeholder="Ej. 20-34556677-9"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                    Límite Crédito ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={customerForm.max_credit}
                    onChange={(e) => setCustomerForm({ ...customerForm, max_credit: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                    Deuda Inicial ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={customerForm.current_debt}
                    onChange={(e) => setCustomerForm({ ...customerForm, current_debt: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCustomerModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <span>Guardar Ficha</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay down Debt Modal */}
      {isPaymentModalOpen && (
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
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="glass-panel"
            style={{ 
              width: '440px', 
              padding: '24px', 
              background: 'var(--bg-surface-solid)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} style={{ color: 'var(--color-success)' }} />
                <span>Registrar Pago de Cliente</span>
              </h3>
              <button onClick={() => setIsPaymentModalOpen(false)} style={{ color: 'var(--text-tertiary)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                  Seleccionar Cliente *
                </label>
                <select
                  required
                  className="input-field"
                  value={paymentForm.customerId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, customerId: e.target.value })}
                >
                  <option value="">-- Seleccionar --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Deuda: {formatCurrency(c.current_debt)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                  Monto Recibido en Efectivo ($) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="input-field"
                  placeholder="Ingrese el importe cobrado..."
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                  Notas de Referencia
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Ej. Entrega a cuenta en efectivo"
                />
              </div>

              {(() => {
                const client = customers.find((c) => c.id === Number(paymentForm.customerId));
                if (!client) return null;
                const payVal = Number(paymentForm.amount) || 0;
                const nextVal = Math.max(0, client.current_debt - payVal);

                return (
                  <div style={{ fontSize: '0.8rem', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-tertiary)' }}>
                      <span>Deuda Actual:</span>
                      <span>{formatCurrency(client.current_debt)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontWeight: 600, marginTop: '2px' }}>
                      <span>Monto Recibido:</span>
                      <span>- {formatCurrency(payVal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '6px' }}>
                      <span>Saldo Deudor Restante:</span>
                      <span>{formatCurrency(nextVal)}</span>
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsPaymentModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} />
                  <span>Confirmar Cobro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Customers;
