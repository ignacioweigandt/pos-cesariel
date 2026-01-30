/** Utilidades de impresión de tickets térmicos usando browser print API */

/** Imprimir ticket térmico (usa thermal-ticket.css para estilos de impresión) */
export const printThermalTicket = (
  onBeforePrint?: () => void,
  onAfterPrint?: () => void
): void => {
  if (onBeforePrint) {
    onBeforePrint();
  }

  if (onAfterPrint) {
    const handleAfterPrint = () => {
      onAfterPrint();
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    window.addEventListener('afterprint', handleAfterPrint);
  }

  setTimeout(() => {
    window.print();
  }, 100);
};

/** Verificar si la impresión está soportada */
export const isPrintSupported = (): boolean => {
  return typeof window !== 'undefined' && 'print' in window;
};

/** Imprimir ticket con estado de loading */
export const printTicketWithLoading = (
  setLoading: (loading: boolean) => void,
  onComplete?: () => void
): void => {
  setLoading(true);

  printThermalTicket(
    undefined,
    () => {
      setLoading(false);
      if (onComplete) {
        onComplete();
      }
    }
  );
};
