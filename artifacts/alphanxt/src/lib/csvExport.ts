import type { TransactionRow } from '@/hooks/useTransactionHistory';

/** Converts trade history into a CSV file and triggers a browser download. */
export function exportTransactionsToCsv(transactions: TransactionRow[]): void {
  const headers = [
    'Date',
    'Symbol',
    'Company',
    'Side',
    'Quantity',
    'Price',
    'Total Amount',
    'Realized P/L',
  ];

  const rows = transactions.map((t) => {
    const date = t.timestamp?.toDate ? t.timestamp.toDate().toISOString() : '';
    return [
      date,
      t.symbol,
      t.companyName,
      t.side === 'BUY' ? 'UP' : 'DOWN',
      String(t.quantity),
      t.price.toFixed(2),
      t.totalAmount.toFixed(2),
      t.realizedPL !== undefined ? t.realizedPL.toFixed(2) : '',
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `alphanxt-trade-history-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
