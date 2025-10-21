"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge"; 
import { Sale } from "./SaleType";

// Define props for the function
interface SaleColumnsProps {
  onViewDetails: (saleId: number) => void;
  onRefund: (sale: Sale) => void;
}

// Function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
  }).format(amount);
};

export const getColumns = ({ onViewDetails, onRefund }: SaleColumnsProps): ColumnDef<Sale>[] => [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice #",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = status === "Completed" ? "default" : (status === "Refunded" ? "destructive" : "outline");
      return <Badge variant={variant}>{status}</Badge>;
    }, 
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => formatCurrency(row.getValue("totalAmount")),
  },
  {
    accessorKey: "profitTotal",
    header: "Profit",
    cell: ({ row }) => formatCurrency(row.getValue("profitTotal")),
  },
  {
    accessorKey: "user.fullName",
    header: "Cashier",
  },
  {
    accessorKey: "customer.name",
    header: "Customer",
    cell: ({ row }) => row.original.customer?.name || "N/A",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const sale = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewDetails(sale.id)}>
              View Details / Print Receipt
            </DropdownMenuItem>
            {sale.status === "Completed" && (
              <DropdownMenuItem
                onClick={() => onRefund(sale)}
                className="text-red-500"
              >
                Process Refund
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];