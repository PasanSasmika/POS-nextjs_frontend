"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StockInLog } from "./LogType";

// Function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
  }).format(amount);
};

export const columns: ColumnDef<StockInLog>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    accessorKey: "product.name",
    header: "Product",
    cell: ({ row }) => (
      <div>
        <div>{row.original.product.name}</div>
        <div className="text-xs text-muted-foreground">{row.original.product.sku}</div>
      </div>
    ),
  },
  {
    accessorKey: "quantityReceived",
    header: "Quantity Received",
    cell: ({ row }) => <div className="text-green-600 font-medium text-right">+{row.original.quantityReceived}</div>,
  },
  {
    accessorKey: "costPrice",
    header: "Cost Price (per item)",
    cell: ({ row }) => formatCurrency(row.original.costPrice),
  },
  {
    accessorKey: "vendor.name",
    header: "Vendor",
    cell: ({ row }) => row.original.vendor?.name || "N/A",
  },
  {
    accessorKey: "user.fullName",
    header: "Received By",
  },
];