"use client";

import { useState, useEffect } from 'react';
import { Bell, LogOut } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Role } from '@/app/dashboard/users/components/UserType'; 

type LowStockItem = {
    id: number;
    name: string;
    sku: string;
    stockQuantity: number;
    reorderLevel: number;
};

export default function Header() {
    const [lowStockCount, setLowStockCount] = useState(0);
    const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuthStore();

    const showNotificationBell = user?.role === Role.ADMIN || user?.role === Role.MANAGER;

    useEffect(() => {
        if (showNotificationBell) {
            const fetchLowStockData = async () => {
                setLoading(true);
                try {
                    const response = await api.get('/reports/stock-summary');
                    setLowStockCount(response.data.lowStockItemsCount || 0);
                    setLowStockItems((response.data.lowStockItems || []).slice(0, 10)); 
                } catch (error) {
                    console.error("Failed to fetch low stock alerts:", error);
                    setLowStockCount(0);
                    setLowStockItems([]);
                } finally {
                    setLoading(false);
                }
            };

            fetchLowStockData();
        } else {
            setLoading(false); 
        }
    }, [showNotificationBell]); 

    return (
        <header className="flex justify-end items-center h-16 px-6 border-b bg-white">
            
            {showNotificationBell && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            {lowStockCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-1 -right-1 h-4 px-1.5 text-xs rounded-full flex items-center justify-center" // Centering badge text
                                >
                                    {lowStockCount > 99 ? '99+' : lowStockCount}
                                </Badge>
                            )}
                            <span className="sr-only">Low stock notifications</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 mr-4">
                        <div className="p-2 space-y-2">
                            <h4 className="font-medium leading-none mb-2">Low Stock Alerts</h4>
                            {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
                            {!loading && lowStockCount === 0 && (
                                <p className="text-sm text-muted-foreground">No low stock items.</p>
                            )}
                            {!loading && lowStockItems.length > 0 && (
                                <ul className="max-h-60 overflow-y-auto space-y-2">
                                    {lowStockItems.map(item => (
                                        <li key={item.id} className="text-sm border-b pb-1 last:border-b-0">
                                            <Link href="/dashboard/inventory" className="hover:underline">
                                                <p className="font-semibold">{item.name} ({item.sku})</p>
                                            </Link>
                                            <p className="text-red-600">
                                                Stock: {item.stockQuantity} (Reorder: {item.reorderLevel})
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {!loading && lowStockCount > lowStockItems.length && (
                                <p className="text-xs text-muted-foreground text-center pt-2">...and {lowStockCount - lowStockItems.length} more</p>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            )}


            <div className='ml-4 mr-7'>
                <button
                    onClick={logout} 
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 transition-all text-sm font-medium" // Adjusted styling
                >
                    <LogOut className="h-4 w-4" /> 
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
}