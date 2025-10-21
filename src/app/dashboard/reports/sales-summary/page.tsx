"use client";

import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { DatePickerWithRange } from "@/components/shared/DatePickerWithRange";

// Define the shape of the summary data
interface SalesSummaryData {
  totalRevenue: number;
  totalProfit: number;
  numberOfSales: number;
  averageSaleValue: number;
  period: {
    from?: string;
    to?: string;
  };
}

// Function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
  }).format(amount);
};

export default function SalesSummaryPage() {
  const [summary, setSummary] = useState<SalesSummaryData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async (startDate?: string, endDate?: string) => {
    setLoading(true);
    try {
      const response = await api.get("/reports/sales-summary", {
        params: { startDate, endDate },
      });
      setSummary(response.data);
    } catch (error) {
      console.error("Failed to fetch sales summary:", error);
      setSummary(null); // Clear summary on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary on initial load (without dates)
  useEffect(() => {
    fetchSummary();
  }, []);

  // Handler for date range change and refetching
  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);
    // Format dates for API call (YYYY-MM-DD)
    const startDate = range?.from ? format(range.from, "yyyy-MM-dd") : undefined;
    const endDate = range?.to ? format(range.to, "yyyy-MM-dd") : undefined;
    fetchSummary(startDate, endDate);
  };

  // Simple data for the chart (replace with real aggregated data later)
  const chartData = [
    { name: 'Revenue', value: summary?.totalRevenue || 0 },
    { name: 'Profit', value: summary?.totalProfit || 0 },
  ];

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Sales Summary Report</h1>
        <div className="flex items-center gap-2">
           <DatePickerWithRange date={dateRange} onDateChange={handleDateChange} />
           <Button onClick={() => handleDateChange(undefined)} variant="outline" disabled={!dateRange}>
             Clear Dates
           </Button>
        </div>
      </div>

      {loading && <div>Loading summary...</div>}

      {!loading && summary && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalProfit)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Number of Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.numberOfSales}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Sale Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.averageSaleValue)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Simple Chart */}
          <Card>
             <CardHeader>
               <CardTitle>Revenue vs Profit</CardTitle>
             </CardHeader>
             <CardContent>
               <ResponsiveContainer width="100%" height={300}>
                 <BarChart data={chartData}>
                   <XAxis dataKey="name" />
                   <YAxis tickFormatter={formatCurrency} />
                   <Tooltip formatter={formatCurrency} />
                   <Legend />
                   <Bar dataKey="value" fill="#8884d8" name="Amount" />
                 </BarChart>
               </ResponsiveContainer>
             </CardContent>
          </Card>
        </>
      )}

       {!loading && !summary && (
          <p className="text-center text-gray-500">Could not load sales summary.</p>
       )}
    </div>
  );
}