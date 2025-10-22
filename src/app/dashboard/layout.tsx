"use client";

import React from 'react';
import Sidebar from '@/components/shared/Sidebar';
import Header from '@/components/shared/Header'; // <-- Import Header
import withAuth from '@/components/shared/withAuth';

function DashboardLayout({ children }: { children: React.ReactNode; }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden"> {/* Added overflow-hidden */}
      <Sidebar />
      {/* --- Main Content Area with Header --- */}
      <div className="flex flex-col flex-1 overflow-hidden"> {/* Added flex-col & overflow */}
          <Header /> {/* <-- Add Header */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8"> {/* Adjusted padding */}
            {children}
          </main>
      </div>
      {/* -------------------------------------- */}
    </div>
  );
}

export default withAuth(DashboardLayout);