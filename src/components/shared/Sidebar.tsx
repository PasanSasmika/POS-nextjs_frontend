"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  FileText,
  FileClock,
  ChartSpline,
  Layers,
  Building,
  Store,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

const navLinks = {
  ADMIN: [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/sales", label: "Sales", icon: ShoppingCart },
    { href: "/dashboard/inventory", label: "Inventory", icon: Package },
    { href: "/dashboard/customers", label: "Customers", icon: Users },
    { href: "/dashboard/sales-history", label: "Sales History", icon: FileClock },
    { href: "/dashboard/reports/sales-summary", label: "Reports", icon: ChartSpline },
    { href: "/dashboard/audit-logs", label: "Audit Logs", icon: FileText },
    { href: "/dashboard/reports/stock-summary", label: "Stock Report", icon: Layers },
    { href: "/dashboard/vendors", label: "Vendors", icon: Building },
    { href: "/dashboard/users", label: "Users", icon: Users },
    { href: "/dashboard/stores", label: "Stores", icon: Store },
  ],
  MANAGER: [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/sales", label: "Sales", icon: ShoppingCart },
    { href: "/dashboard/inventory", label: "Inventory", icon: Package },
    { href: "/dashboard/sales-history", label: "Sales History", icon: FileClock },
    { href: "/dashboard/customers", label: "Customers", icon: Users },
    { href: "/dashboard/reports/sales-summary", label: "Reports", icon: ChartSpline },
    { href: "/dashboard/vendors", label: "Vendors", icon: Building },
  ],
  CASHIER: [
    { href: "/dashboard/sales", label: "POS Terminal", icon: ShoppingCart },
    { href: "/dashboard/customers", label: "Customers", icon: Users },
  ],
  STOCK: [{ href: "/dashboard/inventory", label: "Inventory", icon: Package }],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const userRole = (user?.role as keyof typeof navLinks) || "CASHIER";
  const links = navLinks[userRole];

  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsOpen(window.innerWidth >= 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        isOpen ? "w-64 p-4" : "w-20 p-3"
      }`}
    >
      <div className="flex flex-col h-full justify-between">
        {/* Toggle button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
          >
            {isOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2 flex-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center rounded-lg px-3 py-3 transition-all duration-200 ${
                pathname === link.href
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <link.icon className="h-5 w-5 min-w-[20px]" />
              <span
                className={`ml-3 font-medium overflow-hidden transition-all duration-300 ${
                  isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
