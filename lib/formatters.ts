/**
 * Format a number as Indian Rupee currency with lakh/crore abbreviations.
 * - >= 1 Cr (10,000,000): "₹1.2 Cr"
 * - >= 1 L (100,000): "₹18.5 L"
 * - < 1 L: "₹12,000" (with commas)
 */
export function formatCurrency(n: number): string {
  if (n >= 10_000_000) {
    const crore = n / 10_000_000;
    return `₹${parseFloat(crore.toFixed(2))} Cr`;
  }
  if (n >= 100_000) {
    const lakh = n / 100_000;
    return `₹${parseFloat(lakh.toFixed(2))} L`;
  }
  return `₹${n.toLocaleString('en-IN')}`;
}

/**
 * Format a number as square feet with comma formatting.
 * Example: 1450 → "1,450 sq ft"
 */
export function formatArea(n: number): string {
  return `${n.toLocaleString('en-IN')} sq ft`;
}

/**
 * Format an ISO date string as a human-readable relative or absolute date.
 * - Within 7 days: "Today" or "X days ago"
 * - Within 30 days: "X weeks ago"
 * - Older: "DD MMM YYYY" (e.g. "15 Nov 2024")
 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}
