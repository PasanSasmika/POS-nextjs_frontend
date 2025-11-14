"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronsUpDown, UserPlus } from "lucide-react";
import { Customer } from "@/app/dashboard/customers/components/CustomerType";
import api from "@/lib/api";
import { useCartStore } from "@/store/cart";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QuickAddCustomerForm from "./QuickAddCustomerForm";
import { AxiosError } from "axios";
import { useSalesTerminalStore } from "@/store/salesTerminal";
import CashTenderedDialog from "./CashTenderedDialog"; // <-- IMPORT THE NEW DIALOG

// Define PaymentMethod enum locally
enum PaymentMethod {
  Cash = "Cash",
  Card = "Card",
  Wallet = "Wallet",
  Split = "Split",
}

export default function Checkout() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { selectedCustomer, setSelectedCustomer } = useSalesTerminalStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
  const [openCustomerSearch, setOpenCustomerSearch] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // --- NEW: State for the Cash Dialog ---
  const [isCashDialogOpen, setIsCashDialogOpen] = useState(false);
  // ------------------------------------

  const { items, clearCart, getTotalPrice } = useCartStore();
  const currentTotalPrice = getTotalPrice(); // Get the total price

  // Fetch customers for search
  const fetchCustomers = async () => { /* ... (no change) ... */ };
  useEffect(() => { fetchCustomers(); }, []);

  // Filter customers based on search query (no change)
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.phone.includes(customerSearchQuery)
  );
  
  // --- UPDATED: This function is now called by the dialog OR the pay button ---
  const handleFinalizeSale = async () => {
    if (items.length === 0) {
      alert("Cannot complete sale: Your cart is empty.");
      return;
    }

    setLoading(true); // Set loading state for the main "Pay" button

    const saleData = {
      customerId: selectedCustomer?.id || null,
      paymentMethod,
      items: items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    console.log("Submitting sale data:", saleData);

    try {
      await api.post("/sales", saleData);
      alert("Sale Completed Successfully!");
      clearCart();
      setSelectedCustomer(null);
      setCustomerSearchQuery("");
      setIsCashDialogOpen(false); // <-- IMPORTANT: Close dialog on success
    } catch (error) {
      console.error("Failed to create sale:", error);
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      let errorMessage = "Sale failed. Please check the console for details.";
      if (axiosError.response?.data?.message) {
        errorMessage = Array.isArray(axiosError.response.data.message)
                       ? axiosError.response.data.message.join(', ')
                       : axiosError.response.data.message;
      }
      alert(`Sale Failed: ${errorMessage}`);
    } finally {
      setLoading(false); // Clear loading state
    }
  };

  // Handler for successful Quick Add (no change)
  const handleQuickAddSuccess = (newCustomer: Customer) => { /* ... (no change) ... */ };

  // Format price helper (no change)
  const formatPrice = (amount: number): string =>
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount);

  // --- NEW: Click handler for the main "Pay" button ---
  const handlePayButtonPress = () => {
    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // Check payment method
    if (paymentMethod === PaymentMethod.Cash) {
      // If Cash, open the "Tendered" dialog
      setIsCashDialogOpen(true);
    } else {
      // If Card (or other), finalize the sale immediately
      handleFinalizeSale();
    }
  };
  // ----------------------------------------------------

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-6">
        {/* Top Section: Customer & Payment (no change) */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Customer (Optional)</label>
            <div className="flex gap-2 items-center">
              {/* ... (Popover for customer search, no change) ... */}
              {/* ... (Dialog for quick add customer, no change) ... */}
            </div>
            {selectedCustomer && (
              <Button variant="link" size="sm" className="px-1 h-auto text-xs" onClick={() => setSelectedCustomer(null)}>
                Clear selection
              </Button>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <Tabs defaultValue={PaymentMethod.Cash} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value={PaymentMethod.Cash}>Cash</TabsTrigger>
                <TabsTrigger value={PaymentMethod.Card}>Card</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Bottom Section: Totals & Actions */}
        <div className="space-y-4 pt-4 border-t">
          {/* Total Display (no change) */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(currentTotalPrice)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
              <span>Total</span>
              <span>{formatPrice(currentTotalPrice)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              className="w-full"
              size="lg"
              // --- UPDATED: Use the new click handler ---
              onClick={handlePayButtonPress}
              // ----------------------------------------
              disabled={loading || items.length === 0}
            >
              {loading ? "Processing..." : `Pay ${formatPrice(currentTotalPrice)}`}
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                if (items.length > 0 && confirm("Are you sure you want to clear the current sale?")) {
                  clearCart();
                  setSelectedCustomer(null);
                  setCustomerSearchQuery("");
                }
              }}
              disabled={items.length === 0}
            >
              Clear Sale
            </Button>
          </div>
        </div>
      </CardContent>

      {/* --- ADD THE NEW DIALOG COMPONENT (it's hidden by default) --- */}
      <CashTenderedDialog
        isOpen={isCashDialogOpen}
        onOpenChange={setIsCashDialogOpen}
        totalPrice={currentTotalPrice}
        onConfirmSale={handleFinalizeSale}
      />
    </Card>
  );
}