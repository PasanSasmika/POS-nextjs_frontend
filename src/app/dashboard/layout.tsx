"use client"; // Required for HOCs

import React from 'react';
import Sidebar from '@/components/shared/Sidebar';
import withAuth from '@/components/shared/withAuth'; 

function DashboardLayout({ children }: { children: React.ReactNode; }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}

export default withAuth(DashboardLayout); // Wrap the layout with the HOC