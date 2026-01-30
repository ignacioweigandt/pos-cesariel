'use client';

import { useEffect, useRef, useState } from 'react';

interface BarcodeScannerOptions {
  onBarcodeDetected: (barcode: string) => void;
  minLength?: number;
  maxLength?: number;
  timeout?: number;
  enabled?: boolean;
}

export const useBarcodeScanner = ({
  onBarcodeDetected,
  minLength = 3,
  maxLength = 50,
  timeout = 100,
  enabled = true
}: BarcodeScannerOptions) => {
  const [buffer, setBuffer] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastKeypressTime = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeypressTime.current;

      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.contentEditable === 'true' ||
        activeElement.classList.contains('ProseMirror') ||
        activeElement.closest('[contenteditable="true"]') ||
        activeElement.closest('input') ||
        activeElement.closest('textarea') ||
        activeElement.closest('select')
      );

      if (isInputFocused) {
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        
        if (buffer.length >= minLength && buffer.length <= maxLength) {
          const validBarcodePattern = /^[0-9A-Za-z\-_.]+$/;
          if (validBarcodePattern.test(buffer)) {
            onBarcodeDetected(buffer.trim());
            setIsScanning(false);
          }
        }
        
        setBuffer('');
        return;
      }

      if (event.key === 'Escape') {
        setBuffer('');
        setIsScanning(false);
        return;
      }

      const validChars = /^[0-9A-Za-z\-_.]$/;
      if (!validChars.test(event.key)) {
        return;
      }

      if (timeDiff < timeout || isScanning) {
        event.preventDefault();
        setIsScanning(true);
        setBuffer(prev => prev + event.key);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          if (buffer.length >= minLength && buffer.length <= maxLength) {
            const finalBuffer = buffer + event.key;
            const validBarcodePattern = /^[0-9A-Za-z\-_.]+$/;
            if (validBarcodePattern.test(finalBuffer)) {
              onBarcodeDetected(finalBuffer.trim());
            }
          }
          setBuffer('');
          setIsScanning(false);
        }, timeout);
      } else {
        if (validChars.test(event.key)) {
          setBuffer(event.key);
          setIsScanning(true);
        }
      }

      lastKeypressTime.current = currentTime;
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, buffer, isScanning, minLength, maxLength, timeout, onBarcodeDetected]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isScanning,
    currentBuffer: buffer,
    clearBuffer: () => setBuffer('')
  };
};