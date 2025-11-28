"use client";

import { useEffect, useState, useMemo } from "react";
import { columns } from "./components/columns";
import { StockInLog } from "./components/LogType";
import { DataTable } from "@/components/shared/DataTable";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { toast } from "react-toastify";

export default function StockLogPage() {
  const [logs, setLogs] = useState<StockInLog[]>([]);
  const [loading, setLoading] = useState(true);
  const loggedInUser = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await api.get("/products/stock-in/logs"); // Use the new endpoint
        setLogs(response.data);
      } catch (error) {
        console.error("Failed to fetch stock in logs:", error);
        toast.error("Could not load stock logs.");
      } finally {
        setLoading(false);
      }
    };

    if (loggedInUser?.role === 'ADMIN' || loggedInUser?.role === 'MANAGER' || loggedInUser?.role === 'STOCK') {
      fetchLogs();
    } else {
      setLoading(false); // Stop loading if user is not authorized
    }
  }, [loggedInUser]);

  const memoizedColumns = useMemo(() => columns, []);

  if (loading) return <div className="container mx-auto py-10">Loading stock history...</div>;

  // Render access denied if not authorized
  if (!['ADMIN', 'MANAGER', 'STOCK'].includes(loggedInUser?.role || '')) {
     return <div className="container mx-auto py-10 text-red-500">Access Denied.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Stock In History Log</h1>
      </div>
      <DataTable columns={memoizedColumns} data={logs} />
    </div>
  );
}