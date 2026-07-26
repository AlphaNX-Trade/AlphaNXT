export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRWithSign(amount: number): string {
  const sign = amount >= 0 ? '+' : '';
  return sign + formatINR(Math.abs(amount)).replace('₹', amount < 0 ? '-₹' : '₹');
}
