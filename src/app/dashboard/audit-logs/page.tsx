"use client";

import { useEffect, useState, useMemo } from "react";
import { columns } from "./components/columns";
import { AuditLog } from "./components/AuditLogType";
import { DataTable } from "@/components/shared/DataTable";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const loggedInUser = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await api.get("/audit-logs");
        setLogs(response.data);
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        alert("Could not load audit logs.");
      } finally {
        setLoading(false);
      }
    };

    if (loggedInUser?.role === 'ADMIN') {
        fetchLogs();
    } else {
        setLoading(false);
    }
  }, [loggedInUser]); 

  const memoizedColumns = useMemo(() => columns, []);

  if (loading) return <div className="container mx-auto py-10">Loading audit logs...</div>;

  if (loggedInUser?.role !== 'ADMIN') {
     return <div className="container mx-auto py-10 text-red-500">Access Denied: Only Admins can view audit logs.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        {/* Add filtering options here later if needed */}
      </div>

      <DataTable columns={memoizedColumns} data={logs} />
    </div>
  );
}