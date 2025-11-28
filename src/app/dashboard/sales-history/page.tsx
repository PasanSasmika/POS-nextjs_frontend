"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
import SaleDetailsDialog from "./components/SaleDetailsDialog"; // <-- IMPORT THE NEW DIALOG
import { toast } from "react-toastify";

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for refund dialog
  const [isRefundAlertOpen, setIsRefundAlertOpen] = useState(false);
  const [saleToRefund, setSaleToRefund] = useState<Sale | null>(null);

  // --- State for Details Dialog ---
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  
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

  // --- Event Handlers (wrapped in useCallback for stability) ---

  const handleViewDetails = useCallback((saleId: number) => {
    console.log("View details for sale:", saleId);
    setSelectedSaleId(saleId);
    setIsDetailsOpen(true);
  }, []); // Empty dependency array, this function is stable

  const handleRefundClick = useCallback((sale: Sale) => {
    setSaleToRefund(sale);
    setIsRefundAlertOpen(true);
  }, []); // Empty dependency array, this function is stable

  const confirmRefund = useCallback(async () => {
    if (!saleToRefund) return;
    try {
      // Use the refund endpoint you built in the backend
      // We assume your backend endpoint is POST /sales/:id/refund
      // And that it needs the userId, which we can get from the auth store
      // But for simplicity, let's assume the backend already has it from the token
      
      // We need to pass the userId to the refund endpoint
      // Let's modify this slightly - assuming your endpoint needs it
      // If your backend /refund endpoint gets user from token, this is fine:
      await api.post(`/sales/${saleToRefund.id}/refund`);

      toast.success("Sale refunded successfully!");
      fetchSales(); // Refresh the sales list
    } catch (error) {
      console.error("Failed to process refund:", error);
      const axiosError = error as import('axios').AxiosError;
      toast.error(`Refund failed: ${(axiosError.response?.data as { message?: string })?.message || "Check console."}`);
    } finally {
      setIsRefundAlertOpen(false);
      setSaleToRefund(null);
    }
  }, [saleToRefund, fetchSales]); // Add fetchSales dependency

  // Memoize columns
  const columns = useMemo(() => getColumns({
    onViewDetails: handleViewDetails,
    onRefund: handleRefundClick,
  }), [handleViewDetails, handleRefundClick]); // Use stable handlers as dependencies

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
      
      {/* --- Add the Details Dialog --- */}
      <SaleDetailsDialog
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        saleId={selectedSaleId}
      />
    </div>
  );
}