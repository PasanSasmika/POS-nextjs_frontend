"use client";

import { useEffect, useState, useMemo } from "react";
import { getColumns } from "./components/columns"; 
import { DataTable } from "@/components/shared/DataTable";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ProductForm from "./components/ProductForm";
// Import delete confirmation dialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Product } from "./components/ProductType";
import Link from "next/link";


type Vendor = {
  id: number;
  name: string;
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // --- NEW: State for the delete confirmation ---
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // --- Data Fetching Functions ---
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

  // --- Event Handlers ---
  const handleSuccess = () => {
    setIsFormOpen(false); // Close the dialog
    setEditingProduct(null); // Clear editing state
    fetchProducts();      // Refresh the product list
  };

  const handleAddNewClick = () => {
    setEditingProduct(null); // Ensure we're in "create" mode
    setIsFormOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product); // Set the product to edit
    setIsFormOpen(true);      // Open the dialog
  };

  // --- NEW: Delete Handlers ---
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/products/${productToDelete.id}`);
      alert("Product deleted successfully");
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product.");
    } finally {
      setIsDeleteAlertOpen(false);
      setProductToDelete(null);
    }
  };

  // --- NEW: Memoize columns ---
  const columns = useMemo(() => getColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  }), []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Button onClick={handleAddNewClick}>Add New Product</Button>
    <div>
       <Link href="/dashboard/inventory/receive-stock">
  <Button variant="outline">Receive Stock</Button>
</Link>
    </div>
       
      </div>

      
      
      {/* Product Table */}
      <DataTable columns={columns} data={products} />

      {/* Add/Edit Product Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Make changes to your product here." : "Fill in the details to add a new product."}
            </DialogDescription>
          </DialogHeader>
          <ProductForm 
            vendors={vendors} 
            onSuccess={handleSuccess}
            initialData={editingProduct}
          />
        </DialogContent>
      </Dialog>
      
      {/* --- NEW: Delete Confirmation Dialog --- */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product: <strong>{productToDelete?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}