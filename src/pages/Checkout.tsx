import React, { useState, useEffect, useRef } from 'react';
import { db, type BoxSession, type Sale, type SaleItem } from '@/services/localDb';
import { type Product } from '@/types/product';
import { searchProducts } from '@/services/productSearchService';
import { ProductSearch, type ProductSearchRef } from '@/components/POS/ProductSearch';
import { Cart, type CartItem } from '@/components/POS/Cart';
import { PaymentModal } from '@/components/POS/PaymentModal';
import { OpenBoxModal } from '@/components/POS/OpenBoxModal';
import { CloseBoxModal } from '@/components/POS/CloseBoxModal';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import useBarcodeScanner from '@/hooks/useBarcodeScanner';
import { Power } from 'lucide-react';

export const Checkout: React.FC = () => {
  const [activeSession, setActiveSession] = useState<BoxSession | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCloseSessionOpen, setIsCloseSessionOpen] = useState(false);
  
  // Last printed ticket cache for render template
  const [lastSaleDetails, setLastSaleDetails] = useState<{
    id?: number;
    items: CartItem[];
    paymentMethod: string;
    subtotal: number;
    discount: number;
    surcharge: number;
    total: number;
    amountPaid: number;
    change: number;
    timestamp: string;
    customerName?: string;
  } | null>(null);

  // References
  const searchRef = useRef<ProductSearchRef>(null);

  // Sound generator for scanner beep (Web Audio API)
  const playScanBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(950, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.08); // 80ms beep
    } catch (e) {
      console.warn('Web Audio playback blocked by browser security policy.', e);
    }
  };

  // Load active shift session on mount
  useEffect(() => {
    const fetchSession = async () => {
      const openSession = await db.boxSessions.where('status').equals('open').first();
      if (openSession) {
        setActiveSession(openSession);
      }
    };
    fetchSession();
  }, []);

  // Open cashier register session
  const handleOpenSession = async (balance: number) => {
    const newSession: BoxSession = {
      opened_at: new Date().toISOString(),
      initial_balance: balance,
      expected_balance: balance,
      status: 'open'
    };

    const id = await db.boxSessions.add(newSession);
    newSession.id = id;
    setActiveSession(newSession);
  };

  // Close cashier register session
  const handleCloseSession = async (actualBalance: number) => {
    if (!activeSession?.id) return;

    await db.boxSessions.update(activeSession.id, {
      closed_at: new Date().toISOString(),
      actual_balance: actualBalance,
      status: 'closed'
    });

    setActiveSession(null);
    setIsCloseSessionOpen(false);
  };

  // Add product to cart
  const handleSelectProduct = (product: Product) => {
    if (product.stock === 0) {
      alert(`El artículo "${product.name}" no cuenta con stock disponible.`);
      return;
    }

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.sku === product.sku);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Límite alcanzado. Solo hay ${product.stock} unidades en stock.`);
          return prevItems;
        }
        return prevItems.map((item) =>
          item.product.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { product, quantity: 1 }];
    });
  };

  // Barcode scanner trigger
  useBarcodeScanner(async (barcode) => {
    if (!activeSession) return;
    const matches = await searchProducts(barcode);
    const exactMatch = matches.find(p => p.sku === barcode);
    if (exactMatch) {
      playScanBeep();
      handleSelectProduct(exactMatch);
    } else {
      console.warn('Scanned SKU not found in database:', barcode);
    }
  }, !!activeSession);

  // Cart quantity controls
  const handleUpdateQuantity = (sku: string, change: number) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.product.sku === sku) {
            const nextQuantity = item.quantity + change;
            if (nextQuantity > item.product.stock) {
              alert(`Stock insuficiente. Solo quedan ${item.product.stock} unidades.`);
              return item;
            }
            return { ...item, quantity: nextQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleRemoveItem = (sku: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.sku !== sku));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  // Finalize Checkout and save records
  const handleConfirmPayment = async (details: {
    paymentMethod: 'cash' | 'card' | 'transfer' | 'credit';
    discount: number;
    surcharge: number;
    total: number;
    amountPaid: number;
    customerId?: number;
  }) => {
    if (!activeSession?.id) return;

    try {
      const timestamp = new Date().toISOString();

      // 1. Save Sale to database
      const newSale: Sale = {
        box_session_id: activeSession.id,
        customer_id: details.customerId,
        timestamp,
        payment_method: details.paymentMethod,
        total_amount: details.total,
        discount_amount: details.discount,
        surcharge_amount: details.surcharge
      };

      const saleId = await db.sales.add(newSale);

      // 2. Save Sale Items and deduct stock
      for (const item of cartItems) {
        const newItem: SaleItem = {
          sale_id: saleId,
          product_id: item.product.id!,
          product_name: item.product.name,
          product_sku: item.product.sku,
          quantity: item.quantity,
          unit_price: item.product.price,
          subtotal: item.product.price * item.quantity
        };

        await db.saleItems.add(newItem);

        // Stock deduction (Stock Inteligente)
        const currentProduct = await db.products.get(item.product.id!);
        if (currentProduct) {
          const nextStock = Math.max(0, currentProduct.stock - item.quantity);
          await db.products.update(item.product.id!, { stock: nextStock });
        }
      }

      // Update customer outstanding debt in DB
      if (details.paymentMethod === 'credit' && details.customerId) {
        const client = await db.customers.get(details.customerId);
        if (client) {
          await db.customers.update(details.customerId, {
            current_debt: client.current_debt + details.total
          });
        }
      }

      // 3. Update BoxSession expected cash balance (only cash payments affect physical drawer balance)
      const cashAddition = details.paymentMethod === 'cash' ? details.total : 0;
      await db.boxSessions.update(activeSession.id, {
        expected_balance: activeSession.expected_balance + cashAddition
      });

      // Reload session object to display updated balances
      const updatedSession = await db.boxSessions.get(activeSession.id);
      if (updatedSession) {
        setActiveSession(updatedSession);
      }

      // 4. Cache sale details for thermal print rendering
      let customerName = undefined;
      if (details.paymentMethod === 'credit' && details.customerId) {
        const client = await db.customers.get(details.customerId);
        if (client) {
          customerName = client.name;
        }
      }

      const saleDetails = {
        id: saleId,
        items: [...cartItems],
        paymentMethod: details.paymentMethod === 'credit' ? 'cuenta corriente' : details.paymentMethod,
        subtotal: getSubtotal(),
        discount: details.discount,
        surcharge: details.surcharge,
        total: details.total,
        amountPaid: details.amountPaid,
        change: Math.max(0, details.amountPaid - details.total),
        timestamp,
        customerName
      };
      
      setLastSaleDetails(saleDetails);
      setIsPaymentModalOpen(false);
      setCartItems([]);

      // 5. Trigger physical thermal printer
      setTimeout(() => {
        window.print();
      }, 200);

    } catch (err) {
      console.error('Failed to complete sale transaction:', err);
      alert('Error crítico guardando la venta en la base de datos local.');
    }
  };

  // Keyboard binds
  useKeyboardShortcuts({
    F2: () => {
      if (activeSession && searchRef.current) {
        searchRef.current.focusInput();
      }
    },
    F3: () => {
      if (activeSession && cartItems.length > 0) {
        handleClearCart();
      }
    },
    F4: () => {
      if (activeSession && cartItems.length > 0) {
        setIsPaymentModalOpen(true);
      }
    },
    F6: () => {
      if (activeSession) {
        setIsCloseSessionOpen(true);
      }
    }
  }, !!activeSession);

  // Formatter helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleString('es-AR');
  };

  // ----------------------------------------------------
  // SCREEN 1: Blocker for CLOSED cash register sessions
  // ----------------------------------------------------
  if (!activeSession) {
    return <OpenBoxModal onOpenSession={handleOpenSession} />;
  }

  // ----------------------------------------------------
  // SCREEN 2: Cashier checkout POS operational panel
  // ----------------------------------------------------
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      {/* Session top information card */}
      <div 
        className="glass-panel"
        style={{ 
          padding: '12px 20px', 
          background: 'var(--bg-surface-solid)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>CAJA ABIERTA DESDE</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{formatDate(activeSession.opened_at)}</span>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>SALDO EFECTIVO ESTIMADO</span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-success)' }}>
              {formatCurrency(activeSession.expected_balance)}
            </span>
          </div>
        </div>

        <button 
          onClick={() => setIsCloseSessionOpen(true)}
          className="btn btn-secondary"
          style={{ padding: '8px 16px', fontSize: '0.85rem', color: 'var(--color-danger)', gap: '8px' }}
        >
          <Power size={16} />
          <span>Cerrar Turno de Caja [F6]</span>
        </button>
      </div>

      {/* Main interface layout: Search (top) + Cart Details (middle) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        <ProductSearch ref={searchRef} onSelectProduct={handleSelectProduct} />
        
        <div style={{ flex: 1 }}>
          <Cart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckout={() => setIsPaymentModalOpen(true)}
          />
        </div>
      </div>

      {/* Payment checkout modal overlay */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        subtotal={getSubtotal()}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Close Cash Session Modal Overlay */}
      <CloseBoxModal
        isOpen={isCloseSessionOpen}
        expectedBalance={activeSession.expected_balance}
        onClose={() => setIsCloseSessionOpen(false)}
        onConfirmClose={handleCloseSession}
      />

      {/* -------------------------------------------------- */}
      {/* PRINT-ONLY THERMAL TICKET TEMPLATE OVERLAY SECTION */}
      {/* -------------------------------------------------- */}
      {lastSaleDetails && (
        <div className="print-ticket-wrapper">
          <div className="ticket-header">
            <div className="ticket-title">MATILLA FERRETERIA</div>
            <div className="ticket-subtitle">VENTA Y DISTRIBUCION DE MATERIALES</div>
            <div className="ticket-subtitle">Dirección Local Matilla - Mendoza</div>
            <div className="ticket-subtitle">Tel: +54 261 456-7890</div>
          </div>

          <div className="ticket-divider"></div>

          <div className="ticket-info-row">
            <span>Ticket Nro:</span>
            <span>#{lastSaleDetails.id?.toString().padStart(6, '0')}</span>
          </div>
          <div className="ticket-info-row">
            <span>Fecha y Hora:</span>
            <span>{formatDate(lastSaleDetails.timestamp)}</span>
          </div>
          <div className="ticket-info-row">
            <span>Pago:</span>
            <span style={{ textTransform: 'uppercase' }}>{lastSaleDetails.paymentMethod}</span>
          </div>
          {lastSaleDetails.customerName && (
            <div className="ticket-info-row">
              <span>Cliente (Dda):</span>
              <span>{lastSaleDetails.customerName}</span>
            </div>
          )}

          <div className="ticket-divider"></div>

          <table className="ticket-table">
            <thead>
              <tr>
                <th>Descrip. x Cant</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {lastSaleDetails.items.map((item) => (
                <tr key={item.product.sku}>
                  <td>
                    {item.product.name} <br/>
                    <small>{item.quantity} u x {formatCurrency(item.product.price)}</small>
                  </td>
                  <td className="text-right" style={{ verticalAlign: 'bottom' }}>
                    {formatCurrency(item.product.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ticket-divider"></div>

          <div className="ticket-totals">
            <div className="ticket-total-row">
              <span>Suma de Artículos:</span>
              <span>{formatCurrency(lastSaleDetails.subtotal)}</span>
            </div>
            
            {lastSaleDetails.discount > 0 && (
              <div className="ticket-total-row">
                <span>Descuento Aplicado:</span>
                <span>- {formatCurrency(lastSaleDetails.discount)}</span>
              </div>
            )}

            {lastSaleDetails.surcharge > 0 && (
              <div className="ticket-total-row">
                <span>Recargo Tarjeta:</span>
                <span>+ {formatCurrency(lastSaleDetails.surcharge)}</span>
              </div>
            )}

            <div className="ticket-total-row ticket-grand-total">
              <span>TOTAL A PAGAR:</span>
              <span>{formatCurrency(lastSaleDetails.total)}</span>
            </div>

            {lastSaleDetails.paymentMethod === 'cuenta corriente' ? (
              <div className="ticket-total-row" style={{ marginTop: '2mm', fontWeight: 600, color: 'var(--color-danger)' }}>
                <span>REGISTRADO EN CTA. CTE</span>
              </div>
            ) : (
              <>
                <div className="ticket-total-row" style={{ marginTop: '2mm' }}>
                  <span>Abonado:</span>
                  <span>{formatCurrency(lastSaleDetails.amountPaid)}</span>
                </div>
                <div className="ticket-total-row">
                  <span>Vuelto Entregado:</span>
                  <span>{formatCurrency(lastSaleDetails.change)}</span>
                </div>
              </>
            )}
          </div>

          <div className="ticket-divider"></div>

          <div className="ticket-footer">
            <div>*** GRACIAS POR SU COMPRA ***</div>
            <div style={{ marginTop: '1mm' }}>Matilla Ferretería - Local Comercial</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
