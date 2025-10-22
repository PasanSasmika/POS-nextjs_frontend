"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditLog } from "./AuditLogType";
import { Badge } from "@/components/ui/badge"; 


export const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Timestamp <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleString(), 
  },
  {
    accessorKey: "user.username", 
    header: "User",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("action")}</Badge>, 
  },
  {
    accessorKey: "entity",
    header: "Entity",
     cell: ({ row }) => <Badge variant="outline">{row.getValue("entity")}</Badge>, 
  },
  {
    accessorKey: "entityId",
    header: "Entity ID",
  },
   {
    accessorKey: "details",
    header: "Details",
     cell: ({ row }) => ( 
       <pre className="text-xs max-w-xs overflow-x-auto bg-gray-100 p-1 rounded">
         {JSON.stringify(row.getValue("details"), null, 2)}
       </pre>
     ),
  },
];