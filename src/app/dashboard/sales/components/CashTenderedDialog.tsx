"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define the props this component will accept
interface CashTenderedDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  totalPrice: number;
  onConfirmSale: () => Promise<void>; // The async finalize sale function
}

export default function CashTenderedDialog({
  isOpen,
  onOpenChange,
  totalPrice,
  onConfirmSale,
}: CashTenderedDialogProps) {
  // State for the amount customer gives (as string to allow typing)
  const [amountTenderedStr, setAmountTenderedStr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format price helper
  const formatPrice = (amount: number): string =>
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount);

  // Calculate tendered amount and change due
  const { tenderedAmountNum, changeDue, isConfirmDisabled } = useMemo(() => {
    const tendered = parseFloat(amountTenderedStr) || 0;
    const change = tendered - totalPrice;
    return {
      tenderedAmountNum: tendered,
      changeDue: change,
      isConfirmDisabled: tendered < totalPrice, // Disable if not paid enough
    };
  }, [amountTenderedStr, totalPrice]);

  // Reset input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setAmountTenderedStr("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle the final confirmation
  const handleConfirm = async () => {
    if (isConfirmDisabled) return;
    
    setIsSubmitting(true);
    try {
      await onConfirmSale(); // Call the finalize sale function
    } catch (error) {
      // Error is already handled by onConfirmSale, just stop loading
      console.error("Sale confirmation failed in dialog", error);
      setIsSubmitting(false); // Stop loading on fail
    }
    // On success, onConfirmSale will close the dialog
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cash Payment</DialogTitle>
          <DialogDescription>
            Enter the amount received from the customer.
          </DialogDescription>
        </DialogHeader>

        {/* Total Due */}
        <div className="flex justify-between items-center text-2xl font-bold">
          <Label>Total Due:</Label>
          <span>{formatPrice(totalPrice)}</span>
        </div>

        {/* Amount Tendered Input */}
        <div className="space-y-2">
          <Label htmlFor="amount-tendered">Amount Tendered</Label>
          <Input
            id="amount-tendered"
            type="number"
            value={amountTenderedStr}
            onChange={(e) => setAmountTenderedStr(e.target.value)}
            className="text-lg h-12"
            autoFocus
          />
        </div>

        {/* Change Due */}
        <div className={`flex justify-between items-center text-xl font-medium ${
          changeDue < 0 ? 'text-red-600' : 'text-green-600'
        }`}>
          <Label>Change Due:</Label>
          {/* Show 0.00 change if not enough money is tendered */}
          <span>{formatPrice(changeDue < 0 ? 0 : changeDue)}</span>
        </div>

        <DialogFooter>
          <Button
            type="button"
            className="w-full"
            size="lg"
            onClick={handleConfirm}
            disabled={isConfirmDisabled || isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Confirm Sale"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}