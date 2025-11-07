"use client";

import { useEffect, useState, useRef } from "react";
import { useCartStore } from "@/store/cart";
import { useSalesTerminalStore } from "@/store/salesTerminal";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react"; 
import { Product } from "@/app/dashboard/inventory/components/ProductType";

interface Recommendation {
  productName: string | null;
  reason: string | null;
}

export default function AiRecommendationBox() {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);
  
  const cartItems = useCartStore((state) => state.items);
  const selectedCustomer = useSalesTerminalStore((state) => state.selectedCustomer);
  
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setRecommendation(null); 

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (cartItems.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true); 
    debounceTimer.current = setTimeout(async () => {
      try {
        const payload = {
          cartItemIds: cartItems.map(item => item.id),
          customerId: selectedCustomer?.id || null,
        };

        console.log("Calling AI with payload:", payload);
        const response = await api.post("/ai/recommendations", payload);
        
        if (response.data && response.data.productName) {
          setRecommendation(response.data);
        } else {
          setRecommendation(null); 
        }

      } catch (error) {
        console.error("Failed to fetch AI recommendation:", error);
        setRecommendation(null); 
      } finally {
        setLoading(false);
      }
    }, 2000); 

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [cartItems, selectedCustomer]);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
            <Sparkles className="h-4 w-4 mr-2" /> AI Advisor is thinking...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (recommendation && recommendation.productName) {
    return (
      <Card className="bg-yellow-50 border-yellow-200 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-base font-semibold text-yellow-900">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-600" /> AI Advisor Suggests:
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-bold text-lg text-gray-900">{recommendation.productName}</p>
          <p className="text-sm text-gray-700 italic">&quot;{recommendation.reason}&quot;</p>
        </CardContent>
      </Card>
    );
  }

  return null;
}