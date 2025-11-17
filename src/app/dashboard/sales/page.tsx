"use client";

import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import ProductLookup from "./components/ProductLookup";
import AiRecommendationBox from "./components/AiRecommendationBox";
import { Receipt, CompletedSale } from "./components/Receipt";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useSalesTerminalStore } from "@/store/salesTerminal"; 
import { Customer } from "@/app/dashboard/customers/components/CustomerType"; 

export default function SalesPage() {
  const [lastCompletedSale, setLastCompletedSale] = useState<CompletedSale | null>(null);
  const [lastSaleCustomer, setLastSaleCustomer] = useState<Customer | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { selectedCustomer } = useSalesTerminalStore(); 

  const handlePrint = useReactToPrint({
    contentRef: receiptRef, 
    pageStyle: `
      @page { 
        size: 80mm auto; /* Common receipt paper width */
        margin: 5mm; 
      } 
      @media print { 
        body { 
          -webkit-print-color-adjust: exact; 
        } 
      }
    `,
  });

 
  const handleSaleComplete = (saleData: CompletedSale) => {
    console.log("Sale complete, setting data for receipt:", saleData);
    setLastCompletedSale(saleData); 
    setLastSaleCustomer(selectedCustomer);
    
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      
      <div className="lg:w-2/3 flex flex-col gap-4">
        <ProductLookup />
        <Cart />
        <AiRecommendationBox />
      </div>

      <div className="lg:w-1/3 flex flex-col gap-4">
        
        <Checkout onSaleComplete={handleSaleComplete} />

        {lastCompletedSale && (
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrint} 
            className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            <Printer className="mr-2 h-5 w-5" />
            Print Last Receipt (Inv: {lastCompletedSale.invoiceNumber})
          </Button>
        )}
      </div>
      <div className="hidden print:block">
        <Receipt 
          ref={receiptRef} 
          sale={lastCompletedSale} 
          customer={lastSaleCustomer}
        />
      </div>
    </div>
  );
}