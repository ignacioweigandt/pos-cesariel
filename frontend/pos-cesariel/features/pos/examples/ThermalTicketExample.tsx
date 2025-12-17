'use client';

/**
 * ThermalTicket Example Component
 *
 * Example usage and preview of the ThermalTicket component.
 * This file demonstrates how to use the thermal printing system.
 *
 * To preview the ticket on screen, add this component to any page:
 * import ThermalTicketExample from '@/features/pos/examples/ThermalTicketExample';
 */

import { useState } from 'react';
import ThermalTicket from '../components/ThermalTicket';
import { printThermalTicket } from '../utils/printTicket';
import '../styles/thermal-ticket.css';

export default function ThermalTicketExample() {
  const [previewMode, setPreviewMode] = useState(true);
  const [printing, setPrinting] = useState(false);

  // Sample sale data
  const sampleSaleData = {
    saleId: 123,
    saleNumber: 'V-2025-00123',
    customerName: 'María González',
    totalAmount: 45750,
    subtotal: 41500,
    tax: 4250,
    discount: 0,
    items: [
      {
        name: 'Remera Deportiva',
        quantity: 2,
        price: 8500,
        size: 'XL'
      },
      {
        name: 'Pantalón Jean',
        quantity: 1,
        price: 12500,
        size: 'M'
      },
      {
        name: 'Zapatillas Running',
        quantity: 1,
        price: 22000,
        size: '42'
      }
    ],
    paymentMethod: 'CARD',
    cardType: 'Visa',
    installments: 3,
    createdAt: new Date().toISOString()
  };

  const handlePrint = () => {
    setPrinting(true);
    printThermalTicket(
      () => console.log('Starting print...'),
      () => {
        console.log('Print completed');
        setPrinting(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sistema de Impresión Térmica
          </h1>
          <p className="text-gray-600">
            Preview del ticket térmico optimizado para impresoras de 80mm
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">Controles</h2>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={previewMode}
                  onChange={(e) => setPreviewMode(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  Modo Preview (ver ticket en pantalla)
                </span>
              </label>
            </div>

            <button
              onClick={handlePrint}
              disabled={printing}
              className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              <span>{printing ? 'Imprimiendo...' : 'Imprimir Ticket'}</span>
            </button>
          </div>
        </div>

        {/* Sale Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Datos de la Venta de Ejemplo
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Ticket N°:</span>
              <p className="text-gray-900">{sampleSaleData.saleNumber}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Cliente:</span>
              <p className="text-gray-900">{sampleSaleData.customerName}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total:</span>
              <p className="text-gray-900 font-semibold">
                ${sampleSaleData.totalAmount.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Forma de Pago:</span>
              <p className="text-gray-900">
                {sampleSaleData.cardType} {sampleSaleData.installments}x
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <span className="font-medium text-gray-700 block mb-2">
              Productos ({sampleSaleData.items.length}):
            </span>
            <ul className="space-y-1 text-sm text-gray-600">
              {sampleSaleData.items.map((item, index) => (
                <li key={index}>
                  • {item.quantity}x {item.name} ({item.size}) - $
                  {(item.quantity * item.price).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📋 Instrucciones
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>
              ✅ <strong>Modo Preview:</strong> Activa el checkbox para ver el
              ticket en pantalla
            </li>
            <li>
              ✅ <strong>Imprimir:</strong> Click en "Imprimir Ticket" para
              abrir el diálogo de impresión
            </li>
            <li>
              ✅ <strong>Configuración:</strong> Selecciona tu impresora térmica
              de 80mm
            </li>
            <li>
              ✅ <strong>Márgenes:</strong> Configura "Sin márgenes" o márgenes
              mínimos
            </li>
            <li>
              ✅ <strong>Tamaño:</strong> El ticket se ajusta automáticamente al
              contenido
            </li>
          </ul>
        </div>

        {/* Ticket Preview */}
        {previewMode ? (
          <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              👁️ Vista Previa del Ticket
            </h3>
            <div className="flex justify-center">
              <div className="preview-mode">
                <ThermalTicket
                  saleData={sampleSaleData}
                  branchName="POS Cesariel"
                  branchAddress="Av. Principal 1234, CABA"
                  branchPhone="Tel: (011) 4444-5555"
                  sellerName="Juan Pérez"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-12 border-2 border-dashed border-gray-300 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <p className="text-gray-600">
              Preview desactivado. Activa "Modo Preview" para ver el ticket.
            </p>
          </div>
        )}

        {/* Hidden ticket for printing */}
        {!previewMode && (
          <ThermalTicket
            saleData={sampleSaleData}
            branchName="POS Cesariel"
            branchAddress="Av. Principal 1234, CABA"
            branchPhone="Tel: (011) 4444-5555"
            sellerName="Juan Pérez"
          />
        )}

        {/* Features */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ✨ Características
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Formato 80mm estándar</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">42 caracteres por línea</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Fuente monoespaciada</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Alto contraste térmico</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Alineación perfecta</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Sin dependencias externas</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Responsive y adaptativo</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Cross-browser compatible</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
