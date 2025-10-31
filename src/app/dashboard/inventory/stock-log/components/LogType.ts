export type StockInLog = {
  id: number;
  quantityReceived: number;
  costPrice: number;
  createdAt: string;
  product: {
    name: string;
    sku: string;
  };
  user: {
    fullName: string;
  };
  vendor: {
    name: string;
  } | null;
};