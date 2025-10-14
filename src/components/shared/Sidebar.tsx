"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Package, Users, BarChart2, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/auth";

const navLinks = {
    ADMIN: [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/dashboard/sales", label: "Sales", icon: ShoppingCart },
        { href: "/dashboard/inventory", label: "Inventory", icon: Package },
        { href: "/dashboard/customers", label: "Customers", icon: Users },
        { href: "/dashboard/reports", label: "Reports", icon: BarChart2 },
        { href: "/dashboard/audit-logs", label: "Audit Logs", icon: FileText },
    ],
    MANAGER: [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/dashboard/sales", label: "Sales", icon: ShoppingCart },
        { href: "/dashboard/inventory", label: "Inventory", icon: Package },
        { href: "/dashboard/customers", label: "Customers", icon: Users },
        { href: "/dashboard/reports", label: "Reports", icon: BarChart2 },
    ],
    CASHIER: [
        { href: "/dashboard/sales", label: "POS Terminal", icon: ShoppingCart },
        { href: "/dashboard/customers", label: "Customers", icon: Users },
    ],
    STOCK: [
        { href: "/dashboard/inventory", label: "Inventory", icon: Package },
    ]
};


export default function Sidebar() {
  const pathname = usePathname();
  const { user , logout} = useAuthStore();
  const userRole = user?.role as keyof typeof navLinks || 'CASHIER';

  const links = navLinks[userRole];

  return (
    <aside className="w-16 flex flex-col items-center bg-gray-900 text-white py-4 space-y-4">
      <TooltipProvider>
        {links.map((link) => (
          <Tooltip key={link.href}>
            <TooltipTrigger asChild>
              <Link
                href={link.href}
                className={`p-3 rounded-lg ${pathname === link.href ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
              >
                <link.icon className="h-6 w-6" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{link.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        <button onClick={logout}>Logout</button>
      </TooltipProvider>
    </aside>
  );
}