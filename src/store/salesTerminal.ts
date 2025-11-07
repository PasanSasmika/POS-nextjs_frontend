import { create } from 'zustand';
import { Customer } from '@/app/dashboard/customers/components/CustomerType';

interface SalesTerminalState {
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
}

export const useSalesTerminalStore = create<SalesTerminalState>((set) => ({
  selectedCustomer: null,
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
}));