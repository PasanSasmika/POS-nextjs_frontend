"use client";

import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function Cart() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();

  const formatPrice = (amount: number) => 
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount);

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>Current Sale</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">{formatPrice(item.sellingPrice)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                  <Input 
                    type="number" 
                    className="w-16 text-center" 
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                  />
                  <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeItem(item.id)}><X className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xl font-bold border-t pt-4">
        <p>Total</p>
        <p>{formatPrice(getTotalPrice())}</p>
      </CardFooter>
    </Card>
  );
}