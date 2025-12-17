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

      // Si es una tecla especial del sistema, ignorar
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      // Verificar si el usuario está escribiendo en un campo de entrada
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.contentEditable === 'true' ||
        activeElement.classList.contains('ProseMirror') || // Para editores rich text
        activeElement.closest('[contenteditable="true"]') ||
        activeElement.closest('input') ||
        activeElement.closest('textarea') ||
        activeElement.closest('select')
      );

      // Si hay un campo de entrada activo, no procesar como código de barras
      if (isInputFocused) {
        return;
      }

      // Si es Enter, procesar el código escaneado
      if (event.key === 'Enter') {
        event.preventDefault();
        
        if (buffer.length >= minLength && buffer.length <= maxLength) {
          // Verificar que el buffer contiene solo caracteres válidos para códigos de barras
          const validBarcodePattern = /^[0-9A-Za-z\-_.]+$/;
          if (validBarcodePattern.test(buffer)) {
            onBarcodeDetected(buffer.trim());
            setIsScanning(false);
          }
        }
        
        setBuffer('');
        return;
      }

      // Si es Escape, limpiar buffer
      if (event.key === 'Escape') {
        setBuffer('');
        setIsScanning(false);
        return;
      }

      // Solo procesar caracteres alfanuméricos y algunos símbolos
      const validChars = /^[0-9A-Za-z\-_.]$/;
      if (!validChars.test(event.key)) {
        return;
      }

      // Detectar si es entrada rápida de escáner (menos de 100ms entre teclas)
      // o si ya estamos en modo escaneo
      if (timeDiff < timeout || isScanning) {
        event.preventDefault();
        setIsScanning(true);
        setBuffer(prev => prev + event.key);

        // Reiniciar timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          // Si se acabó el tiempo y tenemos un código válido, procesarlo
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
        // Nueva secuencia de entrada rápida
        if (validChars.test(event.key)) {
          setBuffer(event.key);
          setIsScanning(true);
        }
      }

      lastKeypressTime.current = currentTime;
    };

    // Agregar listener global
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, buffer, isScanning, minLength, maxLength, timeout, onBarcodeDetected]);

  // Limpiar al desmontar
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