"use client";

import { useState, useEffect } from 'react';
import { Bell,  UserCircle, LogOut, KeyRound } from 'lucide-react'; // Ensure all icons are imported
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

// Define the shape of low stock items expected from the API
type LowStockItem = {
    id: number;
    name: string;
    sku: string;
    stockQuantity: number;
    reorderLevel: number;
};

/**
 * Header component displaying notifications and user profile actions.
 */
export default function Header() {
    // State for low stock notifications
    const [lowStockCount, setLowStockCount] = useState(0);
    const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(true);

    // Get user state and actions from Zustand store
    const { user, logout } = useAuthStore();
    const router = useRouter(); // Initialize router for navigation

    // Fetch low stock data when the component mounts
    useEffect(() => {
        const fetchLowStockData = async () => {
            setLoadingNotifications(true);
            try {
                // Fetch the full stock summary
                const response = await api.get('/reports/stock-summary');
                setLowStockCount(response.data.lowStockItemsCount || 0);
                // Limit the number of items shown in the popover for performance/UI reasons
                setLowStockItems((response.data.lowStockItems || []).slice(0, 10));
            } catch (error) {
                console.error("Failed to fetch low stock alerts:", error);
                setLowStockCount(0); // Reset on error
                setLowStockItems([]);
            } finally {
                setLoadingNotifications(false);
            }
        };

        fetchLowStockData();
        // Optional: Add polling here if needed
    }, []);

    /**
     * Handles the user logout process.
     */
    const handleLogout = () => {
        logout(); // Clear state from Zustand
        // Optional: Call backend logout endpoint if it invalidates refresh tokens
        // api.post('/auth/logout').catch(console.error);
        router.push('/login'); // Redirect to login page
    };

    /**
     * Generates initials from a full name.
     * @param {string | null | undefined} name - The user's full name.
     * @returns {string} The initials or '??'.
     */
    const getInitials = (name?: string | null): string => {
        if (!name) return '??';
        // Split name by space, take the first letter of each part, join, and uppercase
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-end gap-4 border-b bg-white px-6">
            {/* --- Notification Bell --- */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full">
                        <Bell className="h-5 w-5" />
                        {/* Display badge only if there are low stock items */}
                        {lowStockCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full p-1.5 text-xs" // Adjusted padding/size
                            >
                                {lowStockCount}
                            </Badge>
                        )}
                        <span className="sr-only">Low stock notifications</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 mr-4" align="end"> {/* Align popover */}
                    <div className="p-2">
                        <h4 className="mb-2 font-medium leading-none">Low Stock Alerts</h4>
                        {loadingNotifications && <p className="text-sm text-muted-foreground">Loading...</p>}
                        {!loadingNotifications && lowStockCount === 0 && (
                            <p className="text-sm text-muted-foreground">No low stock items.</p>
                        )}
                        {/* List of low stock items */}
                        {!loadingNotifications && lowStockItems.length > 0 && (
                            <ul className="max-h-60 space-y-2 overflow-y-auto">
                                {lowStockItems.map(item => (
                                    <li key={item.id} className="border-b pb-2 text-sm last:border-b-0">
                                        {/* Link to the inventory page */}
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
                         {/* Indicate if there are more items than shown */}
                         {!loadingNotifications && lowStockCount > lowStockItems.length && (
                             <p className="pt-2 text-center text-xs text-muted-foreground">...and {lowStockCount - lowStockItems.length} more</p>
                         )}
                    </div>
                </PopoverContent>
            </Popover>

            {/* --- User Profile Dropdown --- */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {/* Trigger button with User Avatar */}
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                           {/* Add AvatarImage here if you store profile picture URLs */}
                           {/* <AvatarImage src={user?.imageUrl} alt={user?.username} /> */}
                           {/* Fallback shows initials or a default icon */}
                           <AvatarFallback>
                               {user?.fullName ? getInitials(user.fullName) : <UserCircle className="h-5 w-5"/>}
                           </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    {/* User Info Label */}
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user?.fullName || user?.username}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user?.username ? `@${user.username}` : ''} {user?.role ? `(${user.role})` : ''}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator /> {/* Separator line */}
                    {/* Change Password Link */}
                    <DropdownMenuItem asChild>
                       <Link href="/dashboard/profile/change-password">
                           <KeyRound className="mr-2 h-4 w-4" />
                           <span>Change Password</span>
                       </Link>
                    </DropdownMenuItem>
                    {/* Add other profile/settings links here */}
                    <DropdownMenuSeparator />
                    {/* Logout Button */}
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:bg-red-50 focus:text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}