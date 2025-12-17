'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useImportFile } from '@/features/inventory/hooks/useImportFile';
import { useCategories } from '@/features/inventory/hooks/useCategories';
import { useCategoryDetection } from '@/features/inventory/hooks/useCategoryDetection';
import { useImportPreview } from '@/features/inventory/hooks/useImportPreview';
import { useImportConfirm } from '@/features/inventory/hooks/useImportConfirm';
import { FileUploadStep } from './_steps/FileUploadStep';
import { PreviewStep } from './_steps/PreviewStep';
import { ResultStep } from './_steps/ResultStep';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

/**
 * Modal de importación masiva de productos
 * Componente refactorizado con separación de responsabilidades
 */
export default function ImportModal({
  isOpen,
  onClose,
  onImportSuccess,
}: ImportModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');

  // Hooks
  const fileHook = useImportFile();
  const { categories } = useCategories(isOpen);
  const detection = useCategoryDetection(categories);
  const preview = useImportPreview();
  const confirm = useImportConfirm();

  const isUploading = preview.loading || confirm.loading;
  const error = fileHook.error || preview.error || confirm.error;

  const detectedCategory = fileHook.selectedFile
    ? detection.detectCategoryFromFilename(fileHook.selectedFile.name)
    : null;

  // Manejar selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    fileHook.handleFileSelect(file);
    preview.clearPreview();
    confirm.clearResult();
    setStep('upload');
  };

  // Manejar vista previa
  const handlePreview = async () => {
    if (!fileHook.selectedFile) return;

    const success = await preview.loadPreview(fileHook.selectedFile);
    if (success && preview.previewData.length > 0) {
      // Aplicar detección inteligente
      preview.enhancePreviewData(
        preview.previewData,
        detectedCategory,
        detection.detectCategoryFromProduct,
        detection.hasSize,
        detection.getCategoryId
      );
      setStep('preview');
    }
  };

  // Manejar confirmación
  const handleConfirm = async () => {
    const success = await confirm.confirmImport(preview.previewData);
    if (success) {
      setStep('result');
      onImportSuccess();
    }
  };

  // Resetear modal
  const resetModal = () => {
    fileHook.clearFile();
    preview.clearPreview();
    confirm.clearResult();
    setStep('upload');
  };

  // Cerrar modal
  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Importar Productos Masivamente
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-md">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                <div className="text-sm text-red-800">{error}</div>
              </div>
            </div>
          )}

          {/* Step Components */}
          {step === 'upload' && (
            <FileUploadStep
              selectedFile={fileHook.selectedFile}
              isUploading={isUploading}
              detectedCategory={detectedCategory}
              onFileSelect={handleFileSelect}
              onPreview={handlePreview}
              onCancel={handleClose}
            />
          )}

          {step === 'preview' && (
            <PreviewStep
              previewData={preview.previewData}
              categories={categories}
              stats={preview.stats}
              isUploading={isUploading}
              onUpdateProduct={preview.updateProduct}
              onBack={() => setStep('upload')}
              onConfirm={handleConfirm}
            />
          )}

          {step === 'result' && confirm.result && (
            <ResultStep
              result={confirm.result}
              onReset={resetModal}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
