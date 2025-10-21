export type Sale = {
  id: number;
  invoiceNumber: string;
  status: string;
  totalAmount: number;
  profitTotal: number;
  createdAt: string;
  user: {
    fullName: string;
  };
  customer: {
    name: string;
  } | null;
};