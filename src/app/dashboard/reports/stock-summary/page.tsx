"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/app/dashboard/inventory/components/ProductType"; // Reuse Product type

// Define the shape of the summary data from the backend
interface StockSummaryData {
  totalProducts: number;
  totalInventoryValue: number;
  lowStockItemsCount: number;
  lowStockItems: Pick<Product, 'id' | 'name' | 'sku' | 'stockQuantity' | 'reorderLevel'>[]; // Only need specific fields
  allProducts: Product[]; // Optional: if you want to display all products too
}

// Function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
  }).format(amount);
};

export default function StockSummaryPage() {
  const [summary, setSummary] = useState<StockSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const response = await api.get("/reports/stock-summary");
        setSummary(response.data);
      } catch (error) {
        console.error("Failed to fetch stock summary:", error);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <div className="container mx-auto py-10">Loading stock summary...</div>;
  }

  if (!summary) {
    return <div className="container mx-auto py-10 text-center text-red-500">Could not load stock summary.</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">Stock Summary Report</h1>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalInventoryValue)}</div>
          </CardContent>
        </Card>
         <Card className={summary.lowStockItemsCount > 0 ? "border-red-500" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Low on Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.lowStockItemsCount > 0 ? "text-red-600" : ""}`}>
              {summary.lowStockItemsCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Items Table */}
      {summary.lowStockItemsCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items (Below Reorder Level)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Reorder Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.lowStockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right text-red-600 font-bold">{item.stockQuantity}</TableCell>
                    <TableCell className="text-right">{item.reorderLevel}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}


    </div>
  );
}