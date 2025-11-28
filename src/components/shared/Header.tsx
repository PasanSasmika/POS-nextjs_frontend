"use client";

import { useState, useEffect } from 'react';
import { Bell,  UserCircle, LogOut, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from '@/lib/api';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { Role } from '@/app/dashboard/users/components/UserType'; // Assuming this import is correct as per your hint
import { toast } from 'react-toastify';

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
    const [loadingNotifications, setLoadingNotifications] = useState(true);

    const { user, logout } = useAuthStore();
    const router = useRouter();
    const showNotificationBell = user?.role === Role.ADMIN || user?.role === Role.MANAGER;

    useEffect(() => {
        const fetchLowStockData = async () => {
            setLoadingNotifications(true);
            try {
                const response = await api.get('/reports/stock-summary');
                setLowStockCount(response.data.lowStockItemsCount || 0);
                setLowStockItems((response.data.lowStockItems || []).slice(0, 10));
            } catch (error) {
                console.error("Failed to fetch low stock alerts:", error);
                setLowStockCount(0);
                setLowStockItems([]);
            } finally {
                setLoadingNotifications(false);
            }
        };

        if (showNotificationBell) {
            fetchLowStockData();
        } else {
            setLoadingNotifications(false);
        }
    }, [showNotificationBell]);

    const handleLogout = () => {
        logout();
        toast.success("You have successfully logged out!")
        router.push('/login');
    };

    const getInitials = (name?: string | null): string => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-end gap-4 border-b bg-white px-6">
            {showNotificationBell && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative rounded-full">
                            <Bell className="h-5 w-5" />
                            {lowStockCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full p-1.5 text-xs"
                                >
                                    {lowStockCount}
                                </Badge>
                            )}
                            <span className="sr-only">Low stock notifications</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 mr-4" align="end">
                        <div className="p-2">
                            <h4 className="mb-2 font-medium leading-none">Low Stock Alerts</h4>
                            {loadingNotifications && <p className="text-sm text-muted-foreground">Loading...</p>}
                            {!loadingNotifications && lowStockCount === 0 && (
                                <p className="text-sm text-muted-foreground">No low stock items.</p>
                            )}
                            {!loadingNotifications && lowStockItems.length > 0 && (
                                <ul className="max-h-60 space-y-2 overflow-y-auto">
                                    {lowStockItems.map(item => (
                                        <li key={item.id} className="border-b pb-2 text-sm last:border-b-0">
                                            <Link href="/dashboard/inventory" className="hover:underline">
                                                <p className="font-semibold">{item.name} ({item.sku})</p>
                                            </Link>
                                            <p className="text-red-600">
                                                Stock: {item.stockQuantity} (Reorder Level: {item.reorderLevel})
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                             {!loadingNotifications && lowStockCount > lowStockItems.length && (
                                 <p className="pt-2 text-center text-xs text-muted-foreground">...and {lowStockCount - lowStockItems.length} more</p>
                             )}
                        </div>
                    </PopoverContent>
                </Popover>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                           <AvatarFallback>
                               {user?.fullName ? getInitials(user.fullName) : <UserCircle className="h-5 w-5"/>}
                           </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user?.fullName || user?.username}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user?.username ? `@${user.username}` : ''} {user?.role ? `(${user.role})` : ''}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:bg-red-50 focus:text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}