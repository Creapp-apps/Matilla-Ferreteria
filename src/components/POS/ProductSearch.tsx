import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Search, MapPin, Barcode, Package } from 'lucide-react';
import { searchProducts } from '@/services/productSearchService';
import { type Product } from '@/types/product';

interface ProductSearchProps {
  onSelectProduct: (product: Product) => void;
}

export interface ProductSearchRef {
  focusInput: () => void;
  clearInput: () => void;
}

export const ProductSearch = forwardRef<ProductSearchRef, ProductSearchProps>(
  ({ onSelectProduct }, ref) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Expose focus and clear operations to the parent container
    useImperativeHandle(ref, () => ({
      focusInput: () => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      },
      clearInput: () => {
        setQuery('');
        setResults([]);
        setIsDropdownOpen(false);
      }
    }));

    // Trigger lookup when query changes
    useEffect(() => {
      let isMounted = true;
      const executeSearch = async () => {
        try {
          const matched = await searchProducts(query);
          if (isMounted) {
            setResults(matched);
            setSelectedIndex(0);
            setIsDropdownOpen(query.length > 0 && matched.length > 0);
          }
        } catch (err) {
          console.error('Error executing lookup search:', err);
        }
      };

      const delayDebounce = setTimeout(() => {
        executeSearch();
      }, 100);

      return () => {
        isMounted = false;
        clearTimeout(delayDebounce);
      };
    }, [query]);

    // Handle clicks outside the dropdown to close it
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current &&
          !inputRef.current.contains(event.target as Node)
        ) {
          setIsDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation inside search list
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isDropdownOpen || results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          const selected = results[selectedIndex];
          if (selected) {
            onSelectProduct(selected);
            setQuery('');
            setIsDropdownOpen(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsDropdownOpen(false);
          if (inputRef.current) inputRef.current.blur();
          break;
      }
    };

    const handleItemClick = (product: Product) => {
      onSelectProduct(product);
      setQuery('');
      setIsDropdownOpen(false);
      if (inputRef.current) inputRef.current.focus();
    };

    // Format currency
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);
    };

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Search input container */}
        <div 
          className="glass-panel" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '4px 16px',
            background: 'var(--bg-surface-solid)',
            borderColor: isDropdownOpen ? 'var(--color-primary)' : 'var(--border-color)',
            boxShadow: isDropdownOpen ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <Search size={20} style={{ color: 'var(--text-tertiary)', marginRight: '12px' }} />
          <input
            ref={inputRef}
            type="text"
            className="input-field"
            style={{ 
              border: 'none', 
              padding: '10px 0', 
              fontSize: '1.1rem',
              background: 'transparent',
              boxShadow: 'none'
            }}
            placeholder="Buscar por nombre, código SKU, categoría o pasillo de depósito... [F2]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query.length > 0 && results.length > 0) {
                setIsDropdownOpen(true);
              }
            }}
          />
          {query && (
            <button 
              className="keycap" 
              style={{ padding: '2px 8px', fontSize: '0.65rem' }} 
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsDropdownOpen(false);
              }}
            >
              ESC
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {isDropdownOpen && results.length > 0 && (
          <div
            ref={dropdownRef}
            className="glass-panel custom-scrollbar"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              zIndex: 999,
              maxHeight: '380px',
              overflowY: 'auto',
              padding: '6px',
              background: 'var(--bg-surface-solid)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {results.map((product, index) => {
              const isSelected = index === selectedIndex;
              const isLowStock = product.stock <= product.min_stock;
              const isOutOfStock = product.stock === 0;

              return (
                <div
                  key={product.sku}
                  onClick={() => handleItemClick(product)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-xs)',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--bg-surface-hover)' : 'transparent',
                    border: isSelected ? '1px solid var(--border-color-hover)' : '1px solid transparent',
                    transition: 'all 100ms ease'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.98rem', color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                        {product.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', padding: '1px 6px', background: 'var(--border-color)', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                        {product.brand}
                      </span>
                    </div>

                    {/* Barcode and warehouse location row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <Barcode size={12} />
                        <span>{product.sku}</span>
                      </div>
                      
                      {/* Highlighted warehouse location */}
                      <div 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px', 
                          fontSize: '0.78rem', 
                          color: 'var(--color-primary)', 
                          fontWeight: 500,
                          backgroundColor: 'var(--color-primary-bg)',
                          padding: '1px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        <MapPin size={12} />
                        <span>{product.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock and pricing section */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isOutOfStock ? 'var(--color-danger)' : isLowStock ? 'var(--color-warning)' : 'var(--color-success)' }}>
                        <Package size={12} />
                        <span style={{ fontWeight: 600 }}>Stock: {product.stock}</span>
                      </div>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>Min: {product.min_stock}</span>
                    </div>

                    <div style={{ minWidth: '85px', textAlign: 'right' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

ProductSearch.displayName = 'ProductSearch';
