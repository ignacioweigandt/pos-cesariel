'use client';

import { useState, useRef, useEffect } from 'react';
import { QrCodeIcon } from '@heroicons/react/24/outline';

interface BarcodeInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * BarcodeInput Component
 *
 * Specialized input for barcode entry that supports both:
 * - Manual keyboard entry
 * - Barcode scanner input (detected by rapid character input + Enter)
 *
 * Features:
 * - Auto-detects scanner input (fast typing + Enter key)
 * - Visual feedback when barcode is scanned
 * - Maintains full manual input capability
 * - Focus management for better UX
 */
export function BarcodeInput({
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = 'Escanea o ingresa el código',
}: BarcodeInputProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanSuccess, setLastScanSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scanBufferRef = useRef<string>('');
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastInputTimeRef = useRef<number>(0);

  // Scan detection threshold (ms) - scanner typically inputs faster than human typing
  const SCAN_SPEED_THRESHOLD = 50; // 50ms between characters indicates scanning
  const SCAN_COMPLETE_DELAY = 100; // Wait 100ms after last character to complete scan

  useEffect(() => {
    // Clear timeout on unmount
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const now = Date.now();
    const timeSinceLastInput = now - lastInputTimeRef.current;

    // Enter key completes the scan
    if (e.key === 'Enter') {
      e.preventDefault();

      if (scanBufferRef.current) {
        // This was a scan - apply the buffer
        onChange(scanBufferRef.current);
        setLastScanSuccess(true);
        setIsScanning(false);
        scanBufferRef.current = '';

        // Clear success indicator after 2 seconds
        setTimeout(() => setLastScanSuccess(false), 2000);
      }
      return;
    }

    // Detect if this is likely scanner input (rapid typing)
    if (timeSinceLastInput < SCAN_SPEED_THRESHOLD && timeSinceLastInput > 0) {
      setIsScanning(true);
    }

    lastInputTimeRef.current = now;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Update scan buffer
    scanBufferRef.current = newValue;

    // Reset scan timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    // If we're in scanning mode, wait for completion
    if (isScanning) {
      scanTimeoutRef.current = setTimeout(() => {
        setIsScanning(false);
        // If scan completes without Enter, still mark as success
        if (scanBufferRef.current.length >= 8) { // Minimum barcode length
          setLastScanSuccess(true);
          setTimeout(() => setLastScanSuccess(false), 2000);
        }
        scanBufferRef.current = '';
      }, SCAN_COMPLETE_DELAY);
    }
  };

  const handleBlur = () => {
    // Clear scanning state when input loses focus
    setIsScanning(false);
    scanBufferRef.current = '';
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
  };

  const handleFocus = () => {
    // Reset success indicator when field is focused again
    setLastScanSuccess(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Código de Barras (SKU) {required && '*'}
      </label>

      <div className="relative">
        {/* Scanner icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <QrCodeIcon
            className={`h-5 w-5 transition-colors ${
              isScanning
                ? 'text-indigo-600 animate-pulse'
                : lastScanSuccess
                ? 'text-green-600'
                : 'text-gray-400'
            }`}
          />
        </div>

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-2 transition-all ${
            isScanning
              ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50'
              : lastScanSuccess
              ? 'border-green-500 ring-2 ring-green-200 bg-green-50'
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
        />

        {/* Status indicator */}
        {isScanning && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs font-medium text-indigo-600">
              Escaneando...
            </span>
          </div>
        )}

        {lastScanSuccess && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs font-medium text-green-600">
              ✓ Escaneado
            </span>
          </div>
        )}
      </div>

      {/* Help text */}
      <p className="mt-1 text-xs text-gray-500">
        {isScanning
          ? 'Detectando escaneo del código de barras...'
          : 'Escanea con lector o escribe manualmente'}
      </p>
    </div>
  );
}
