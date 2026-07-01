import { useEffect, useRef } from 'react';

/**
 * Custom React Hook to listen to global barcode scanning events.
 * Intercepts rapid sequential inputs (typical of keyboard-emulating scanners)
 * and fires a callback with the scanned barcode string.
 * 
 * @param onScan - Callback function triggered with the barcode value.
 * @param active - Boolean indicating if the scanner listener is enabled.
 */
export function useBarcodeScanner(onScan: (barcode: string) => void, active: boolean = true) {
  const buffer = useRef<string>('');
  const lastKeyTime = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore modifier keys
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      const now = Date.now();
      const delay = now - lastKeyTime.current;
      lastKeyTime.current = now;

      // USB/Bluetooth scanners emulate standard keyboards but type extremely fast.
      // A threshold of 45ms safely distinguishes human typing from automatic scanning.
      if (delay > 45) {
        buffer.current = '';
      }

      if (event.key === 'Enter') {
        // Barcodes are typically numeric and at least 4 digits (like short SKUs or EAN-13s)
        if (buffer.current.length >= 4) {
          event.preventDefault();
          onScan(buffer.current);
          buffer.current = '';
        } else {
          // Reset if enter was pressed on a short text sequence (e.g. manual cashier enter)
          buffer.current = '';
        }
      } else if (event.key.length === 1) {
        // Append input characters
        buffer.current += event.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onScan, active]);
}

export default useBarcodeScanner;
