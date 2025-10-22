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
import { Store } from "./StoreType"; 


interface StoreColumnsProps {
  onEdit: (store: Store) => void; 
  onDelete: (store: Store) => void; 
}

/**
 * @param {StoreColumnsProps} props 
 * @returns {ColumnDef<Store>[]} 
 */
export const getColumns = ({ onEdit, onDelete }: StoreColumnsProps): ColumnDef<Store>[] => [
  {
    accessorKey: "name", 
    header: ({ column }) => ( 
      <Button
        variant="ghost" 
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} 
      >
        Name 
        <ArrowUpDown className="ml-2 h-4 w-4" /> {/* Sorting icon */}
      </Button>
    ),
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => row.getValue("address") || "N/A", 
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
  },
  {
    id: "actions", 
    cell: ({ row }) => { 
      const store = row.original; 
      const canDelete = store.id !== 1; 
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
            <DropdownMenuItem onClick={() => onEdit(store)}>
              Edit Store
            </DropdownMenuItem>
            {canDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(store)}
                className="text-red-500" 
              >
                Delete Store
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }, 
  }, 
]; 