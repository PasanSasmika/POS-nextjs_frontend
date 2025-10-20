// This is the complete content for ProductType.ts

export type Product = {
  id: number;
  sku: string;
  name: string;
  category: string;
  stockQuantity: number;
  sellingPrice: number;
  costPrice: number;
  supplierId: number;
  reorderLevel: number;
  expiryDate?: string | null;
};