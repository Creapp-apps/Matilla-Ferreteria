import React, { useState, useEffect } from 'react';
import { Dashboard } from '@/pages/Dashboard';
import { Checkout } from '@/pages/Checkout';
import { Catalog } from '@/pages/Catalog';
import { CashBox } from '@/pages/CashBox';
import { Customers } from '@/pages/Customers';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import { initializeDatabase } from '@/services/localDb';
import { 
  BarChart3, 
  ShoppingCart, 
  Settings, 
  History, 
  HardHat,
  Users
} from 'lucide-react';
import './App.css';

type TabView = 'dashboard' | 'checkout' | 'catalog' | 'cashbox' | 'customers';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>('checkout');

  useEffect(() => {
    initializeDatabase().catch(err => console.error('Database setup failed:', err));
  }, []);

  const triggerShortcutWithTabSwitch = (key: 'F2' | 'F4') => {
    if (activeTab === 'checkout') {
      window.dispatchEvent(new CustomEvent('trigger-shortcut', { detail: key }));
    } else {
      setActiveTab('checkout');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('trigger-shortcut', { detail: key }));
      }, 150);
    }
  };

  // Universal Navigation Shortcuts
  useKeyboardShortcuts({
    // F10 opens Cash Register / Checkout directly for instant sales
    F10: () => setActiveTab('checkout'),
    // F9 opens Dashboard
    F9: () => setActiveTab('dashboard'),
    // Route F2 and F4 through tab helper if not active
    F2: (e) => {
      if (activeTab !== 'checkout') {
        e.preventDefault();
        triggerShortcutWithTabSwitch('F2');
      }
    },
    F4: (e) => {
      if (activeTab !== 'checkout') {
        e.preventDefault();
        triggerShortcutWithTabSwitch('F4');
      }
    }
  });

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'checkout':
        return <Checkout />;
      case 'catalog':
        return <Catalog />;
      case 'cashbox':
        return <CashBox />;
      case 'customers':
        return <Customers />;
      default:
        return <Checkout />;
    }
  };

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        background: 'var(--bg-app)', 
        color: 'var(--text-primary)' 
      }}
    >
      {/* Top Premium Navbar */}
      <header 
        style={{ 
          background: 'var(--bg-surface-solid)', 
          borderBottom: '1px solid var(--border-color-glow)',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        {/* Brand identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '8px', 
              background: 'var(--color-primary-bg)', 
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <HardHat size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.5px', margin: 0, lineHeight: 1.2 }}>
              MATILLA
            </h1>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '2px', display: 'block' }}>
              FERRETERÍA
            </span>
          </div>
        </div>

        {/* Horizontal Navigation tabs */}
        <nav style={{ display: 'flex', height: '100%', gap: '4px' }}>
          
          {/* Dashboard Tab */}
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 16px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'dashboard' ? 'var(--color-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'dashboard' ? '3px solid var(--color-primary)' : '3px solid transparent',
              fontWeight: activeTab === 'dashboard' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.9rem'
            }}
            title="Panel de Control [F9]"
          >
            <BarChart3 size={18} />
            <span>Panel [F9]</span>
          </button>

          {/* Checkout Tab */}
          <button 
            onClick={() => setActiveTab('checkout')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 16px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'checkout' ? 'var(--color-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'checkout' ? '3px solid var(--color-primary)' : '3px solid transparent',
              fontWeight: activeTab === 'checkout' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.9rem'
            }}
            title="Caja Rápida [F10]"
          >
            <ShoppingCart size={18} />
            <span>Caja Rápida [F10]</span>
          </button>

          {/* Catalog Management Tab */}
          <button 
            onClick={() => setActiveTab('catalog')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 16px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'catalog' ? 'var(--color-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'catalog' ? '3px solid var(--color-primary)' : '3px solid transparent',
              fontWeight: activeTab === 'catalog' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.9rem'
            }}
          >
            <Settings size={18} />
            <span>Catálogo</span>
          </button>

          {/* Sessions & Audit History Tab */}
          <button 
            onClick={() => setActiveTab('cashbox')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 16px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'cashbox' ? 'var(--color-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'cashbox' ? '3px solid var(--color-primary)' : '3px solid transparent',
              fontWeight: activeTab === 'cashbox' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.9rem'
            }}
          >
            <History size={18} />
            <span>Arqueos</span>
          </button>

          {/* Customers Management Tab */}
          <button 
            onClick={() => setActiveTab('customers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 16px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'customers' ? 'var(--color-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'customers' ? '3px solid var(--color-primary)' : '3px solid transparent',
              fontWeight: activeTab === 'customers' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.9rem'
            }}
          >
            <Users size={18} />
            <span>Clientes</span>
          </button>

        </nav>

        {/* Small quick guide or action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
          <button 
            onClick={() => triggerShortcutWithTabSwitch('F2')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s',
              fontSize: '0.75rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            title="Buscar Producto [F2]"
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>F2</span>
            <span>Buscar</span>
          </button>

          <button 
            onClick={() => triggerShortcutWithTabSwitch('F4')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s',
              fontSize: '0.75rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            title="Cobrar Compra [F4]"
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>F4</span>
            <span>Cobrar</span>
          </button>
        </div>
      </header>

      {/* Main page content body */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {renderActiveView()}
      </main>

      {/* Footer bar */}
      <footer 
        style={{ 
          padding: '12px 24px', 
          background: 'rgba(0,0,0,0.2)', 
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)'
        }}
      >
        <span>Matilla Ferretería v1.0.0 (Offline Mode - Local Prototype) • Mendoza, Argentina</span>
      </footer>
    </div>
  );
};

export default App;
