"use client";

import React from "react";
import { useAuthStore } from "@/store/auth";
import { CartItem } from "@/store/cart";
import { Customer } from "@/app/dashboard/customers/components/CustomerType"; 

export interface CompletedSale {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  profitTotal: number;
  items: CartItem[];
  createdAt: string;
}

interface ReceiptProps {
  sale: CompletedSale | null;
  customer: Customer | null; 
}

const formatPrice = (amount: number): string =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount);

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(({ sale, customer }, ref) => { 
  const cashier = useAuthStore((state) => state.user);

  if (!sale) {
    return null;
  }

  return (
    <div ref={ref} className="p-4 bg-white text-black text-sm max-w-xs mx-auto">
      
      <div className="text-center space-y-1 mb-4">
        <h2 className="text-xl font-bold">POS System</h2>
        <p className="text-xs">123 Main Street, Negombo</p>
        <p className="text-xs">Tel: (011) 223-4567</p>
        <p className="text-xs border-t border-b border-dashed border-black py-1 mt-2">
          SALES RECEIPT
        </p>
      </div>

      <div className="mb-4 space-y-1 text-xs">
        <p>Invoice #: {sale.invoiceNumber}</p>
        <p>Date: {new Date(sale.createdAt).toLocaleString()}</p>
        <p>Cashier: {cashier?.fullName || cashier?.username || 'N/A'}</p>
        <p>Customer: {customer?.name || 'Walk-in Customer'}</p>
      </div>

      <table className="w-full text-xs mb-4">
        <thead>
          <tr className="border-b border-dashed border-black">
            <th className="text-left font-semibold pb-1">ITEM</th>
            <th className="text-center font-semibold pb-1">QTY</th>
            <th className="text-right font-semibold pb-1">PRICE</th>
            <th className="text-right font-semibold pb-1">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item) => (
            <tr key={item.id} className="align-top">
              <td className="pt-1">{item.name}</td>
              <td className="text-center pt-1">{item.quantity}</td>
              <td className="text-right pt-1">{formatPrice(item.sellingPrice)}</td>
              <td className="text-right pt-1">{formatPrice(item.sellingPrice * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 text-sm border-t border-dashed border-black pt-2">
        <div className="flex justify-between">
          <span className="font-semibold">Subtotal:</span>
          <span>{formatPrice(sale.totalAmount)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span className="font-semibold">TOTAL:</span>
          <span>{formatPrice(sale.totalAmount)}</span>
        </div>
      </div>

      <p className="text-center text-xs mt-4">
        Thank you for shopping with us!
      </p>
    </div>
  );
});

Receipt.displayName = "Receipt";