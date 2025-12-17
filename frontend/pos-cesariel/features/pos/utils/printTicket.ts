/**
 * Print Ticket Utility
 *
 * Handles thermal ticket printing using browser's print API
 */

/**
 * Print the thermal ticket
 *
 * This function triggers the browser's print dialog.
 * The thermal-ticket.css styles ensure only the ticket is printed.
 *
 * @param onBeforePrint - Optional callback before printing starts
 * @param onAfterPrint - Optional callback after printing completes/cancels
 */
export const printThermalTicket = (
  onBeforePrint?: () => void,
  onAfterPrint?: () => void
): void => {
  // Call before print callback
  if (onBeforePrint) {
    onBeforePrint();
  }

  // Set up after print callback
  if (onAfterPrint) {
    const handleAfterPrint = () => {
      onAfterPrint();
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    window.addEventListener('afterprint', handleAfterPrint);
  }

  // Small delay to ensure DOM is updated
  setTimeout(() => {
    window.print();
  }, 100);
};

/**
 * Check if printing is supported
 */
export const isPrintSupported = (): boolean => {
  return typeof window !== 'undefined' && 'print' in window;
};

/**
 * Print ticket with loading state
 *
 * @param setLoading - State setter for loading indicator
 * @param onComplete - Callback when print completes
 */
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
