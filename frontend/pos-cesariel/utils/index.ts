/**
 * Legacy utilities export for backward compatibility
 *
 * This file has been refactored into categorized utility modules.
 * All exports are maintained for backward compatibility.
 *
 * @deprecated Import from specific utility files instead:
 * - import { formatCurrency } from '@/shared/utils/format/currency'
 * - import { formatDate } from '@/shared/utils/format/date'
 * - import { validateEmail } from '@/shared/utils/validation/validators'
 * - import { cn } from '@/shared/utils/helpers/classNames'
 * - import { getLocalStorage } from '@/shared/utils/helpers/storage'
 * - import { USER_ROLES } from '@/shared/utils/constants/roles'
 *
 * Or import from the barrel export:
 * - import { formatCurrency, formatDate, validateEmail } from '@/shared/utils'
 */

// Re-export all utilities from shared/utils
export * from '@/shared/utils';
