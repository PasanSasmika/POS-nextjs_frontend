export enum Role {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  CASHIER = "CASHIER",
  STOCK = "STOCK",
}

export type User = {
  id: number;
  username: string;
  fullName: string;
  email: string | null;
  role: Role;
  storeId: number | null;
};

export type Store = {
  id: number;
  name: string;
};