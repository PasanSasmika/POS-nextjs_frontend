"use client";

import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import ProductLookup from "./components/ProductLookup";

export default function SalesPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      
      {/* Left Column (Product & Cart) */}
      <div className="lg:w-2/3 flex flex-col gap-4">
        {/* Product Lookup Component */}
        <ProductLookup />
        
        {/* Cart Component */}
        <Cart />
      </div>

      {/* Right Column (Checkout) */}
      <div className="lg:w-1/3">
        <Checkout />
      </div>

    </div>
  );
}