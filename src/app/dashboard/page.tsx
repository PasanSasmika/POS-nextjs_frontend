"use client";

import { useEffect, useState } from "react";
import { format, subDays, parseISO } from "date-fns";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {  ShoppingCart, TrendingUp, BarChartHorizontalBig, DollarSign, PackageOpen } from "lucide-react"; // Added icons
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'; // Import more chart components

// --- Types ---
interface SalesSummaryData {
  totalRevenue: number;
  totalProfit: number;
  numberOfSales: number;
  averageSaleValue: number;
}

interface StockSummary {
  lowStockItemsCount: number;
}

// Type for individual sales (needed for daily aggregation)
interface SaleItem {
    id: number;
    createdAt: string; // ISO String date
    totalAmount: number;
    profitTotal: number;
}

// Type for aggregated daily data
interface DailyData {
    date: string; // Formatted date (e.g., "Oct 21")
    revenue: number;
    profit: number;
    salesCount: number;
}

// --- Helper Functions ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount);
};

// --- Component ---
export default function DashboardPage() {
  // State for summary cards (last 7 days)
  const [summary7Days, setSummary7Days] = useState<SalesSummaryData | null>(null);
  const [stockSummary, setStockSummary] = useState<StockSummary | null>(null);
  
  // State for chart data (last 30 days, aggregated daily)
  const [dailyChartData, setDailyChartData] = useState<DailyData[]>([]);

  // Loading states
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingStock, setLoadingStock] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);

  useEffect(() => {
    const today = new Date();
    const startDate7Days = format(subDays(today, 6), "yyyy-MM-dd"); 
    const startDate30Days = format(subDays(today, 29), "yyyy-MM-dd"); 
    const endDate = format(today, "yyyy-MM-dd");


    const fetch7DaySummary = async () => {
      setLoadingSummary(true);
      try {
        const response = await api.get("/reports/sales-summary", {
          params: { startDate: startDate7Days, endDate },
        });
        setSummary7Days(response.data);
      } catch (error) {
        console.error("Failed to fetch 7-day sales summary:", error);
        setSummary7Days({ totalRevenue: 0, totalProfit: 0, numberOfSales: 0, averageSaleValue: 0 });
      } finally {
        setLoadingSummary(false);
      }
    };

    const fetchStock = async () => {
      setLoadingStock(true);
      try {
        const response = await api.get("/reports/stock-summary");
        setStockSummary({ lowStockItemsCount: response.data.lowStockItemsCount || 0 });
      } catch (error) {
        console.error("Failed to fetch stock summary:", error);
        setStockSummary({ lowStockItemsCount: 0 });
      } finally {
        setLoadingStock(false);
      }
    };

    const fetchSalesForCharts = async () => {
        setLoadingChart(true);
        try {
            
            const response = await api.get("/sales", {
                 params: { startDate: startDate30Days, endDate }
            });
            const sales: SaleItem[] = response.data;

          
            const aggregatedData: { [key: string]: DailyData } = {};

            for (let i = 0; i < 30; i++) {
                const date = subDays(today, i);
                const formattedDate = format(date, "MMM dd"); // e.g., "Oct 21"
                aggregatedData[formattedDate] = { date: formattedDate, revenue: 0, profit: 0, salesCount: 0 };
            }

            sales.forEach(sale => {
                const saleDate = parseISO(sale.createdAt); // Parse ISO string date
                // Only include sales within the last 30 days (double-check if backend didn't filter)
                if (saleDate >= subDays(today, 29) && saleDate <= today) {
                    const formattedDate = format(saleDate, "MMM dd");
                    if (aggregatedData[formattedDate]) {
                        aggregatedData[formattedDate].revenue += sale.totalAmount;
                        aggregatedData[formattedDate].profit += sale.profitTotal;
                        aggregatedData[formattedDate].salesCount += 1;
                    }
                }
            });

            // Convert aggregated data object to sorted array
            const chartDataArray = Object.values(aggregatedData).sort((a, b) =>
                parseISO(format(today, 'yyyy') + '-' + a.date.replace(' ', '-')).getTime() -
                parseISO(format(today, 'yyyy') + '-' + b.date.replace(' ', '-')).getTime()
            );

            setDailyChartData(chartDataArray);

        } catch (error) {
            console.error("Failed to fetch sales for charts:", error);
            setDailyChartData([]);
        } finally {
            setLoadingChart(false);
        }
    };


    fetch7DaySummary();
    fetchStock();
    fetchSalesForCharts();
  }, []);

  const isLoading = loadingSummary || loadingStock || loadingChart;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>

      {/* --- Summary Cards (Last 7 Days) --- */}
      <h2 className="text-xl font-semibold text-muted-foreground">Last 7 Days Summary</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (7d)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? ( <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div> ) : (
                <div className="text-2xl font-bold">{formatCurrency(summary7Days?.totalRevenue ?? 0)}</div>
            )}
             <p className="text-xs text-muted-foreground">Total sales in last 7 days</p>
          </CardContent>
        </Card>
        {/* Profit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit (7d)</CardTitle>
             <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loadingSummary ? ( <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div> ) : (
                <div className="text-2xl font-bold">{formatCurrency(summary7Days?.totalProfit ?? 0)}</div>
             )}
            <p className="text-xs text-muted-foreground">Estimated profit in last 7 days</p>
          </CardContent>
        </Card>
        {/* Sales Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Count (7d)</CardTitle>
             <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loadingSummary ? ( <div className="h-8 w-12 bg-gray-200 animate-pulse rounded"></div> ) : (
                 <div className="text-2xl font-bold">{summary7Days?.numberOfSales ?? 0}</div>
             )}
            <p className="text-xs text-muted-foreground">Transactions in last 7 days</p>
          </CardContent>
        </Card>
        {/* Low Stock Items */}
        <Card className={stockSummary && stockSummary.lowStockItemsCount > 0 ? "border-red-500" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
             <PackageOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loadingStock ? ( <div className="h-8 w-10 bg-gray-200 animate-pulse rounded"></div> ) : (
                 <div className={`text-2xl font-bold ${stockSummary && stockSummary.lowStockItemsCount > 0 ? "text-red-600" : ""}`}>
                    {stockSummary?.lowStockItemsCount ?? 0}
                 </div>
             )}
            <p className="text-xs text-muted-foreground">Items needing reorder</p>
          </CardContent>
        </Card>
      </div>

       {/* --- Charts Section (Last 30 Days) --- */}
       <h2 className="text-xl font-semibold text-muted-foreground pt-4">Last 30 Days Trends</h2>
       {loadingChart && <div className="text-center p-4">Loading chart data...</div>}
       {!loadingChart && dailyChartData.length === 0 && <div className="text-center p-4 text-muted-foreground">No sales data available for the last 30 days.</div>}
       {!loadingChart && dailyChartData.length > 0 && (
         <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">

           {/* Chart 1: Daily Revenue Trend */}
           <Card>
              <CardHeader>
                <CardTitle>Daily Revenue (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis tickFormatter={formatCurrency} fontSize={12} />
                    <Tooltip formatter={formatCurrency} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
           </Card>

           {/* Chart 2: Daily Profit Trend */}
           <Card>
              <CardHeader>
                <CardTitle>Daily Profit (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis tickFormatter={formatCurrency} fontSize={12}/>
                    <Tooltip formatter={formatCurrency}/>
                    <Legend />
                    <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit" dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
           </Card>

            {/* Chart 3: Daily Sales Count Trend */}
           <Card className="lg:col-span-2"> {/* Make this chart span full width on large screens */}
              <CardHeader>
                <CardTitle>Daily Sales Count (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12}/>
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="salesCount" fill="#4dabf7" name="Number of Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
           </Card>
         </div>
       )}
    </div>
  );
}