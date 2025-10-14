"use client";

import { useAuthStore } from "@/store/auth";

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="text-3xl font-bold">Welcome, {user?.username || 'User'}!</h1>
      <p className="text-gray-600 mt-2">
        This is your main dashboard. Your role is: <strong>{user?.role}</strong>
      </p>
      
    </div>
  );
}