'use client';

import { useState, useRef, useEffect } from 'react';
import {
  CameraIcon,
  XMarkIcon,
  QrCodeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
  title?: string;
}

declare global {
  interface Window {
    BarcodeDetector?: any;
  }
}

export default function BarcodeScanner({ 
  isOpen, 
  onClose, 
  onBarcodeDetected, 
  title = "Escanear Código de Barras" 
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<string>('');
  const [supported, setSupported] = useState<boolean>(true);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for BarcodeDetector support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSupported('BarcodeDetector' in window);
    }
  }, []);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen && supported) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, supported]);

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(false);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setIsScanning(true);
          startBarcodeDetection();
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  const stopCamera = () => {
    // Limpiar stream de cámara
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        track.removeEventListener('ended', () => {});
      });
      setStream(null);
    }
    
    // Limpiar video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
    }
    
    setIsScanning(false);
    
    // Limpiar interval de detección
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  const startBarcodeDetection = () => {
    if (!supported || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const detector = new window.BarcodeDetector({
      formats: [
        'code_128',
        'code_39',
        'ean_13',
        'ean_8',
        'upc_a',
        'upc_e',
        'qr_code'
      ]
    });

    const detectBarcodes = async () => {
      if (!video || !context || video.readyState !== 4) return;

      try {
        // Draw current frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Detect barcodes
        const barcodes = await detector.detect(canvas);

        if (barcodes.length > 0) {
          const barcode = barcodes[0].rawValue;
          
          // Avoid duplicate scans
          if (barcode !== lastScan) {
            setLastScan(barcode);
            onBarcodeDetected(barcode);
            
            // Visual feedback
            drawBarcodeHighlight(context, barcodes[0]);
            
            // Close scanner after successful scan
            setTimeout(() => {
              onClose();
            }, 1000);
          }
        }
      } catch (err) {
        console.error('Error detecting barcode:', err);
      }
    };

    // Start detection loop
    detectionIntervalRef.current = setInterval(detectBarcodes, 100);
  };

  const drawBarcodeHighlight = (context: CanvasRenderingContext2D, barcode: any) => {
    const { boundingBox } = barcode;
    
    context.strokeStyle = '#10B981';
    context.lineWidth = 3;
    context.strokeRect(
      boundingBox.x,
      boundingBox.y,
      boundingBox.width,
      boundingBox.height
    );
  };

  const handleClose = () => {
    stopCamera();
    setError(null);
    setLastScan('');
    setSupported(true); // Reset support state
    onClose();
  };

  const handleManualInput = () => {
    const barcode = prompt('Ingrese el código de barras manualmente:');
    if (barcode && barcode.trim()) {
      onBarcodeDetected(barcode.trim());
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center">
              <QrCodeIcon className="h-6 w-6 mr-2" />
              {title}
            </h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {!supported ? (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <p className="text-gray-700 mb-4">
                Su navegador no soporta la detección automática de códigos de barras.
              </p>
              <button
                onClick={handleManualInput}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Ingresar Manualmente
              </button>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-700 mb-4">{error}</p>
              <div className="space-y-2">
                <button
                  onClick={startCamera}
                  className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Intentar de Nuevo
                </button>
                <button
                  onClick={handleManualInput}
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Ingresar Manualmente
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Camera View */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                  style={{ mixBlendMode: 'multiply' }}
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-white border-dashed w-48 h-32 flex items-center justify-center">
                    <div className="text-white text-center">
                      <QrCodeIcon className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Posicione el código aquí</p>
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="absolute top-2 right-2">
                  <div className={`flex items-center px-2 py-1 rounded text-xs font-medium ${
                    isScanning ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-1 ${
                      isScanning ? 'bg-white animate-pulse' : 'bg-gray-300'
                    }`}></div>
                    {isScanning ? 'Escaneando...' : 'Preparando...'}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-center text-sm text-gray-600">
                <p>Mantenga el código de barras dentro del área marcada</p>
                <p className="mt-1">La detección es automática</p>
              </div>

              {/* Manual input option */}
              <button
                onClick={handleManualInput}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
              >
                Ingresar código manualmente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}