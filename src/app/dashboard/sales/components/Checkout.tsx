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
import CashTenderedDialog from "./CashTenderedDialog";
import { CompletedSale } from "./Receipt"; 

enum PaymentMethod {
  Cash = "Cash",
  Card = "Card",
  Wallet = "Wallet",
  Split = "Split",
}

interface CheckoutProps {
  onSaleComplete: (saleData: CompletedSale) => void;
}

export default function Checkout({ onSaleComplete }: CheckoutProps) { 
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { selectedCustomer, setSelectedCustomer } = useSalesTerminalStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
  const [openCustomerSearch, setOpenCustomerSearch] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCashDialogOpen, setIsCashDialogOpen] = useState(false);

  const { items, clearCart, getTotalPrice } = useCartStore();
  const currentTotalPrice = getTotalPrice();

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.phone.includes(customerSearchQuery)
  );
  
  const handleFinalizeSale = async () => {
    if (items.length === 0) {
      alert("Cannot complete sale: Your cart is empty.");
      throw new Error("Empty cart"); 
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
      const response = await api.post("/sales", saleData);
      
    
      const backendSaleData = response.data;
      const completedSale: CompletedSale = {
        ...backendSaleData, 
        items: items,      
      };

      alert("Sale Completed Successfully!");
      
      onSaleComplete(completedSale);
      
      clearCart();
      setSelectedCustomer(null);
      setCustomerSearchQuery("");
      setIsCashDialogOpen(false); 
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
      throw error; 
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAddSuccess = (newCustomer: Customer) => {
    setIsAddCustomerDialogOpen(false);
    setCustomers(prev => [...prev, newCustomer]);
    setSelectedCustomer(newCustomer);
    setOpenCustomerSearch(false);
    setCustomerSearchQuery("");
  };

  const formatPrice = (amount: number): string =>
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount);

  const handlePayButtonPress = () => {
    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    if (paymentMethod === PaymentMethod.Cash) {
      setIsCashDialogOpen(true);
    } else {
      handleFinalizeSale(); 
    }
  };

  return (
    <> 
      <Card className="flex flex-col h-full">
         <CardHeader>
           <CardTitle>Checkout</CardTitle>
         </CardHeader>
         <CardContent className="flex-1 flex flex-col justify-between space-y-6">
           <div className="space-y-6">
             <div>
               <label className="block text-sm font-medium mb-1">Customer (Optional)</label>
               <div className="flex gap-2 items-center">
                 <Popover open={openCustomerSearch} onOpenChange={setOpenCustomerSearch}>
                   <PopoverTrigger asChild>
                     <Button variant="outline" role="combobox" className="flex-1 justify-between">
                       {selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.phone})` : "Search Name/Phone..."}
                       <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                     </Button>
                   </PopoverTrigger>
                   <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                     <Command>
                       <CommandInput
                         placeholder="Search name or phone..."
                         value={customerSearchQuery}
                         onValueChange={setCustomerSearchQuery}
                       />
                       <CommandList>
                         <CommandEmpty>
                           <div className="py-2 px-4 text-center text-sm">
                             No customer found.
                             <Button
                               variant="link"
                               className="h-auto p-1 ml-1 text-blue-600"
                               onClick={() => {
                                   setOpenCustomerSearch(false);
                                   setIsAddCustomerDialogOpen(true);
                               }}
                             >
                               Add New?
                             </Button>
                           </div>
                         </CommandEmpty>
                         <CommandGroup>
                           {filteredCustomers.map((customer) => (
                             <CommandItem
                               key={customer.id}
                               value={`${customer.name} ${customer.phone}`}
                               onSelect={() => {
                                 setSelectedCustomer(customer);
                                 setOpenCustomerSearch(false);
                                 setCustomerSearchQuery("");
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

                 <Dialog open={isAddCustomerDialogOpen} onOpenChange={setIsAddCustomerDialogOpen}>
                   <DialogTrigger asChild>
                     <Button variant="outline" size="icon" title="Add New Customer" className="shrink-0">
                       <UserPlus className="h-4 w-4"/>
                       <span className="sr-only">Add New Customer</span>
                     </Button>
                   </DialogTrigger>
                   <DialogContent className="sm:max-w-md">
                     <DialogHeader>
                       <DialogTitle>Add New Customer</DialogTitle>
                       <DialogDescription>Quickly add a new customer to the system.</DialogDescription>
                     </DialogHeader>
                     <QuickAddCustomerForm onSuccess={handleQuickAddSuccess} />
                   </DialogContent>
                 </Dialog>
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
           <div className="space-y-4 pt-4 border-t">
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
             <div className="space-y-2">
               <Button
                 className="w-full"
                 size="lg"
                 onClick={handlePayButtonPress} 
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
      </Card>

      <CashTenderedDialog
        isOpen={isCashDialogOpen}
        onOpenChange={setIsCashDialogOpen}
        totalPrice={currentTotalPrice}
        onConfirmSale={handleFinalizeSale}
      />
    </>
  );
}