/**
 * ExportButton Component
 * 
 * Reusable export button with loading state.
 * Supports CSV and PDF export (PDF coming soon).
 */

import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface ExportButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  variant?: "primary" | "secondary";
}

export function ExportButton({
  onClick,
  loading = false,
  disabled = false,
  label = "Exportar CSV",
  variant = "primary",
}: ExportButtonProps) {
  const baseClasses = "inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400",
    secondary: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500 disabled:bg-gray-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} disabled:cursor-not-allowed`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Exportando...
        </>
      ) : (
        <>
          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
          {label}
        </>
      )}
    </button>
  );
}
