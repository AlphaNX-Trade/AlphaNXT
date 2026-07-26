export type AssetType = 'stock' | 'index';

export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  open: number;
  prevClose: number;
  volume: string;
  marketCap: string;
  sector: string;
  type: AssetType;
}

export const STOCKS: Asset[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries',
    price: 2847.50,
    change: 34.20,
    changePercent: 1.22,
    dayHigh: 2865.00,
    dayLow: 2810.30,
    open: 2813.00,
    prevClose: 2813.30,
    volume: '8.4M',
    marketCap: '₹19.3L Cr',
    sector: 'Energy',
    type: 'stock',
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    price: 3892.15,
    change: -18.45,
    changePercent: -0.47,
    dayHigh: 3930.00,
    dayLow: 3875.50,
    open: 3910.60,
    prevClose: 3910.60,
    volume: '2.1M',
    marketCap: '₹14.1L Cr',
    sector: 'Information Technology',
    type: 'stock',
  },
  {
    symbol: 'INFY',
    name: 'Infosys',
    price: 1623.80,
    change: 12.30,
    changePercent: 0.76,
    dayHigh: 1635.00,
    dayLow: 1607.20,
    open: 1611.50,
    prevClose: 1611.50,
    volume: '5.3M',
    marketCap: '₹6.8L Cr',
    sector: 'Information Technology',
    type: 'stock',
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank',
    price: 1734.60,
    change: 22.15,
    changePercent: 1.29,
    dayHigh: 1742.00,
    dayLow: 1708.80,
    open: 1712.45,
    prevClose: 1712.45,
    volume: '6.7M',
    marketCap: '₹13.2L Cr',
    sector: 'Banking',
    type: 'stock',
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank',
    price: 1089.40,
    change: 8.75,
    changePercent: 0.81,
    dayHigh: 1095.00,
    dayLow: 1076.30,
    open: 1080.65,
    prevClose: 1080.65,
    volume: '9.2M',
    marketCap: '₹7.7L Cr',
    sector: 'Banking',
    type: 'stock',
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    price: 812.30,
    change: -4.20,
    changePercent: -0.51,
    dayHigh: 820.00,
    dayLow: 808.10,
    open: 816.50,
    prevClose: 816.50,
    volume: '14.1M',
    marketCap: '₹7.3L Cr',
    sector: 'Banking',
    type: 'stock',
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors',
    price: 924.75,
    change: 15.60,
    changePercent: 1.72,
    dayHigh: 931.00,
    dayLow: 905.20,
    open: 909.15,
    prevClose: 909.15,
    volume: '11.6M',
    marketCap: '₹3.4L Cr',
    sector: 'Automobile',
    type: 'stock',
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro',
    price: 3456.20,
    change: -28.90,
    changePercent: -0.83,
    dayHigh: 3500.00,
    dayLow: 3440.60,
    open: 3485.10,
    prevClose: 3485.10,
    volume: '1.8M',
    marketCap: '₹4.8L Cr',
    sector: 'Infrastructure',
    type: 'stock',
  },
];

export const INDICES: Asset[] = [
  {
    symbol: 'NIFTY50',
    name: 'NIFTY 50',
    price: 24856.50,
    change: 104.30,
    changePercent: 0.42,
    dayHigh: 24920.00,
    dayLow: 24720.30,
    open: 24752.20,
    prevClose: 24752.20,
    volume: '—',
    marketCap: '—',
    sector: 'Index',
    type: 'index',
  },
  {
    symbol: 'BANKNIFTY',
    name: 'BANK NIFTY',
    price: 53440.25,
    change: 356.80,
    changePercent: 0.67,
    dayHigh: 53600.00,
    dayLow: 53020.50,
    open: 53083.45,
    prevClose: 53083.45,
    volume: '—',
    marketCap: '—',
    sector: 'Index',
    type: 'index',
  },
  {
    symbol: 'SENSEX',
    name: 'SENSEX',
    price: 81920.30,
    change: 310.15,
    changePercent: 0.38,
    dayHigh: 82100.00,
    dayLow: 81550.20,
    open: 81610.15,
    prevClose: 81610.15,
    volume: '—',
    marketCap: '—',
    sector: 'Index',
    type: 'index',
  },
];

export const ALL_ASSETS: Asset[] = [...STOCKS, ...INDICES];

export function getAssetBySymbol(symbol: string): Asset | undefined {
  return ALL_ASSETS.find((a) => a.symbol === symbol);
}
