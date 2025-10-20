"use client";

import { useEffect, useState } from "react";
import { columns, Product } from "./components/columns";
import { DataTable } from "@/components/shared/DataTable";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProductForm from "./components/ProductForm";

type Vendor = {
  id: number;
  name: string;
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await api.get("/vendors");
      setVendors(response.data);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchVendors();
  }, []);

  const handleSuccess = () => {
    setIsDialogOpen(false); // Close the dialog
    fetchProducts();      // Refresh the product list
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Product</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new product to your inventory.
              </DialogDescription>
            </DialogHeader>
            <ProductForm vendors={vendors} onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={products} />
    </div>
  );
}