export function formatVnd(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('vi-VN').format(rounded);
  return `${formatted} đ`;
}

export function formatDate(isoDateString?: string | null): string {
  if (!isoDateString) return '';
  const date = new Date(isoDateString);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(isoDateString?: string | null): string {
  if (!isoDateString) return '';
  const date = new Date(isoDateString);
  if (Number.isNaN(date.getTime())) return '';

  const datePart = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

  const timePart = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

  return `${datePart} ${timePart}`;
}

export function getImageUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl) return '';

  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }

  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  const origin = base.replace(/\/api\/?$/, '');
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;

  return `${origin}${cleanPath}`;
}
