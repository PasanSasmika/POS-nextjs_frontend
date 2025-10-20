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

// Import the shared type
import { Product } from "./ProductType";

// Define the props for the function
interface ProductColumnsProps {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

// Convert 'columns' to a function 'getColumns'
export const getColumns = ({ onEdit, onDelete }: ProductColumnsProps): ColumnDef<Product>[] => [
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "stockQuantity",
    header: "Stock",
  },
  {
    accessorKey: "sellingPrice",
    header: "Price",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("sellingPrice"));
      const formatted = new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR", // You can change this to your currency
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product.sku)}>
              Copy SKU
            </DropdownMenuItem>
            
            {/* Wire up the click handlers */}
            <DropdownMenuItem onClick={() => onEdit(product)}>
              Edit Product
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(product)}
              className="text-red-500"
            >
              Delete Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];