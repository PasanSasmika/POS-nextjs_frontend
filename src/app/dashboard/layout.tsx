"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/shared/Sidebar';
import Header from '@/components/shared/Header';
import withAuth from '@/components/shared/withAuth';
import { syncPendingSales, getPendingSalesCount } from '@/lib/syncService'; 
import { WifiOff } from 'lucide-react'; 

function DashboardLayout({ children }: { children: React.ReactNode; }) {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSales, setPendingSales] = useState(0);

  const updateOnlineStatus = async () => {
    setIsOffline(!navigator.onLine);
    if (navigator.onLine) {
      console.log('App is back online. Attempting to sync...');
      const syncSuccess = await syncPendingSales();
      if (syncSuccess) {
        setPendingSales(0);
      } else {
        setPendingSales(await getPendingSalesCount());
      }
    }
  };
  
  useEffect(() => {
    updateOnlineStatus();
        getPendingSalesCount().then(setPendingSales);

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []); 


  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        {isOffline && (
          <div className="bg-red-500 text-white text-center py-1 text-sm font-medium flex items-center justify-center">
            <WifiOff className="h-4 w-4 mr-2" />
            You are currently offline. Sales will be saved locally.
          </div>
        )}
        {!isOffline && pendingSales > 0 && (
           <div className="bg-yellow-500 text-black text-center py-1 text-sm font-medium">
             Syncing {pendingSales} offline sale(s)...
           </div>
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default withAuth(DashboardLayout);