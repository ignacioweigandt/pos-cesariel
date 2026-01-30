/** Utilidades de formateo de fechas y horas */

/** Formatear fecha y hora tratando el tiempo del servidor como local (DD/MM/YYYY HH:mm) */
export function formatDate(date: string | Date): string {
  let dateStr: string;

  if (typeof date === 'string') {
    dateStr = date;
  } else {
    dateStr = date.toISOString();
  }

  // Parseo manual para evitar conversiones de timezone
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);

  if (match) {
    const [, year, month, day, hours, minutes] = match;
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  }

  const dateObj = new Date(dateStr);
  const dayNum = dateObj.getDate().toString().padStart(2, '0');
  const monthNum = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const yearNum = dateObj.getFullYear();
  const hoursNum = dateObj.getHours().toString().padStart(2, '0');
  const minutesNum = dateObj.getMinutes().toString().padStart(2, '0');

  return `${dayNum}/${monthNum}/${yearNum}, ${hoursNum}:${minutesNum}`;
}

/** Formatear solo fecha sin hora (DD/MM/YYYY) */
export function formatDateOnly(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj);
}

/** Formatear solo hora sin fecha (HH:mm) */
export function formatTimeOnly(date: string | Date): string {
  let dateStr: string;

  if (typeof date === 'string') {
    dateStr = date;
  } else {
    dateStr = date.toISOString();
  }

  const match = dateStr.match(/T(\d{2}):(\d{2})/);

  if (match) {
    const [, hours, minutes] = match;
    return `${hours}:${minutes}`;
  }

  const dateObj = new Date(dateStr);
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/** Formatear fecha y hora con segundos (DD/MM/YYYY HH:mm:ss) */
export function formatDateTime(date: string | Date): string {
  let dateStr: string;

  if (typeof date === 'string') {
    dateStr = date;
  } else {
    dateStr = date.toISOString();
  }

  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);

  if (match) {
    const [, year, month, day, hours, minutes, seconds] = match;
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  }

  const dateObj = new Date(dateStr);
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const seconds = dateObj.getSeconds().toString().padStart(2, '0');

  return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
}

/** Formatear tiempo relativo (ej: "hace 2 horas", "en 3 días") */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat('es-AR', { numeric: 'auto' });

  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (Math.abs(diffInSeconds) < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (Math.abs(diffInSeconds) < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (Math.abs(diffInSeconds) < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (Math.abs(diffInSeconds) < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  }
}

/** Parsear string a objeto Date (retorna null si es inválido) */
export function parseDate(dateString: string): Date | null {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}
