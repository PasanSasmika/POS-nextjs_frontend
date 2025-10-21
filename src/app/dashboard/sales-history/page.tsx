"use client";

import { useEffect, useState, useMemo } from "react";
import { getColumns } from "./components/columns";
import { Sale } from "./components/SaleType";
import { DataTable } from "@/components/shared/DataTable";
import api from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// We'll need a Dialog to show sale details, but we'll add it later.
// For now, the handler will just log to the console.

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for refund dialog
  const [isRefundAlertOpen, setIsRefundAlertOpen] = useState(false);
  const [saleToRefund, setSaleToRefund] = useState<Sale | null>(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await api.get("/sales");
      setSales(response.data);
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // --- Event Handlers ---

  const handleViewDetails = (saleId: number) => {
    console.log("View details for sale:", saleId);
    // TODO: We will build a pop-up dialog for this later.
    alert("Viewing details for sale ID: " + saleId);
  };

  const handleRefundClick = (sale: Sale) => {
    setSaleToRefund(sale);
    setIsRefundAlertOpen(true);
  };

  const confirmRefund = async () => {
    if (!saleToRefund) return;
    try {
      // Use the refund endpoint you built in the backend
      await api.post(`/sales/${saleToRefund.id}/refund`);
      alert("Sale refunded successfully!");
      fetchSales(); // Refresh the sales list
    } catch (error: any) {
      console.error("Failed to process refund:", error);
      alert(`Refund failed: ${error.response?.data?.message || "Error"}`);
    } finally {
      setIsRefundAlertOpen(false);
      setSaleToRefund(null);
    }
  };

  // Memoize columns
  const columns = useMemo(() => getColumns({
    onViewDetails: handleViewDetails,
    onRefund: handleRefundClick,
  }), [sales]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sales History</h1>
      </div>

      {/* Sales Table */}
      <DataTable columns={columns} data={sales} />

      {/* Refund Confirmation Dialog */}
      <AlertDialog open={isRefundAlertOpen} onOpenChange={setIsRefundAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to refund this sale?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will refund the sale
              <strong> {saleToRefund?.invoiceNumber}</strong> and add all items back to stock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRefund} className="bg-red-600 hover:bg-red-700">
              Confirm Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}