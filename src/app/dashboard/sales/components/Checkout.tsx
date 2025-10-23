"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronsUpDown, UserPlus } from "lucide-react";
import { Customer } from "@/app/dashboard/customers/components/CustomerType";
import api from "@/lib/api";
import { useCartStore } from "@/store/cart";

// --- FIX IS HERE ---
// Remove the broken import and define the enum locally.
// This must match your Prisma Schema.
enum PaymentMethod {
  Cash = "Cash",
  Card = "Card",
  Wallet = "Wallet",
  Split = "Split",
}
// --- END OF FIX ---

export default function Checkout() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash); // Use the local enum
  const [openCustomerSearch, setOpenCustomerSearch] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get cart state
  const { items, clearCart, getTotalPrice } = useCartStore();

  // Fetch customers for search
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get("/customers");
        setCustomers(response.data);
      } catch (error) {
        console.error("Failed to fetch customers", error);
      }
    };
    fetchCustomers();
  }, []);

  const handleFinalizeSale = async () => {
    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    
    setLoading(true);
    const saleData = {
      customerId: selectedCustomer?.id || null,
      paymentMethod,
      items: items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      await api.post("/sales", saleData);
      alert("Sale Completed Successfully!");
      clearCart();
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Failed to create sale:", error);
    const axiosError = error as import('axios').AxiosError;
    alert(`Sale failed: ${(axiosError.response?.data as { message?: string })?.message || "Check console."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Search */}
        <div>
          <label className="block text-sm font-medium mb-1">Customer (Optional)</label>
          <Popover open={openCustomerSearch} onOpenChange={setOpenCustomerSearch}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between">
                {selectedCustomer ? selectedCustomer.name : "Select a customer..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Search customer..." />
                <CommandList>
                  <CommandEmpty>No customer found.</CommandEmpty>
                  <CommandGroup>
                    {customers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        value={customer.name}
                        onSelect={() => {
                          setSelectedCustomer(customer);
                          setOpenCustomerSearch(false);
                        }}
                      >
                        {customer.name} ({customer.phone})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedCustomer && (
             <Button variant="link" size="sm" onClick={() => setSelectedCustomer(null)}>Clear selection</Button>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium mb-2">Payment Method</label>
          {/* Update Tabs to use the enum values */}
          <Tabs defaultValue={PaymentMethod.Cash} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value={PaymentMethod.Cash}>Cash</TabsTrigger>
              <TabsTrigger value={PaymentMethod.Card}>Card</TabsTrigger>
              {/* You can add Wallet and Split here if needed */}
            </TabsList>
          </Tabs>
        </div>

        {/* Total Display */}
        <div className="space-y-2">
          <div className="flex justify-between font-medium">
            <span>Subtotal</span>
            <span>{new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(getTotalPrice())}</span>
          </div>
          <div className="flex justify-between font-medium text-2xl">
            <span>Total</span>
            <span>{new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(getTotalPrice())}</span>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleFinalizeSale}
          disabled={loading || items.length === 0}
        >
          {loading ? "Processing..." : "Complete Sale"}
        </Button>
        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => {
            if (confirm("Are you sure you want to clear the cart?")) {
              clearCart();
              setSelectedCustomer(null);
            }
          }}
        >
          Clear Sale
        </Button>
      </CardContent>
    </Card>
  );
}