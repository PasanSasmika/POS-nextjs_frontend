"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Customer } from "@/app/dashboard/customers/components/CustomerType";
import { User } from "@/app/dashboard/users/components/UserType";

// --- THIS IS THE CORRECTED TYPE DEFINITION ---
// This defines the shape of the data coming from GET /sales/:id

// This is the shape of ONE item in the `items` array
interface SaleDetailItem {
  id: number;
  quantity: number;
  price: number; // Price at time of sale
  product: { // The nested product object
    name: string;
    sku: string;
  };
}

// This is the full Sale object
interface SaleDetails {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  createdAt: string;
  customer: Customer | null;
  user: User;
  items: SaleDetailItem[]; // <-- Use the correct item type
}
// --- END OF TYPE DEFINITION ---

// Format price helper
const formatPrice = (amount: number): string =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount);

interface SaleDetailsDialogProps {
  saleId: number | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function SaleDetailsDialog({ saleId, isOpen, onOpenChange }: SaleDetailsDialogProps) {
  const [sale, setSale] = useState<SaleDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch details when the dialog opens and a valid saleId is provided
    if (isOpen && saleId) {
      setLoading(true);
      setSale(null); // Clear previous data
      
      const fetchSaleDetails = async () => {
        try {
          // The response data should match the SaleDetails interface
          const response = await api.get<SaleDetails>(`/sales/${saleId}`);
          setSale(response.data);
        } catch (error) {
          console.error("Failed to fetch sale details:", error);
          // Optionally set an error state to display in the dialog
        } finally {
          setLoading(false);
        }
      };
      
      fetchSaleDetails();
    }
  }, [saleId, isOpen]); // Rerun when saleId or isOpen changes

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sale Details</DialogTitle>
          {sale && <DialogDescription>Invoice #: {sale.invoiceNumber}</DialogDescription>}
        </DialogHeader>

        {loading && <p className="text-center py-8">Loading details...</p>}

        {!loading && !sale && (
          <p className="text-center py-8 text-red-500">Could not load sale details.</p>
        )}

        {!loading && sale && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Customer & Cashier Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Customer:</span>
                <p>{sale.customer?.name || "Walk-in Customer"}</p>
                <p className="text-muted-foreground">{sale.customer?.phone}</p>
              </div>
              <div>
                <span className="font-semibold">Cashier:</span>
                <p>{sale.user.fullName}</p>
                <p className="text-muted-foreground">@{sale.user.username}</p>
              </div>
            </div>

            {/* Items Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* --- THIS IS THE FIX --- */}
                {/* We now access item.product.name, which is correct */}
                {sale.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                    <TableCell className="text-right">{formatPrice(item.price * item.quantity)}</TableCell>
                  </TableRow>
                ))}
                {/* --- END OF FIX --- */}
              </TableBody>
            </Table>
            
            {/* Totals */}
            <div className="space-y-1 text-right font-medium">
              <div className="flex justify-end gap-4">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatPrice(sale.totalAmount)}</span>
              </div>
              <div className="flex justify-end gap-4 text-lg font-bold">
                <span>TOTAL:</span>
                <span>{formatPrice(sale.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}