"use client";

import { useEffect, useState, useMemo } from "react";
import { getColumns } from "./components/columns";
import { DataTable } from "@/components/shared/DataTable";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,} from "@/components/ui/alert-dialog";
import { Vendor } from "./components/VenderType";
import VendorForm from "./components/vendorForm";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/vendors");
      setVendors(response.data);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // --- Event Handlers ---
  const handleSuccess = () => {
    setIsFormOpen(false);
    setEditingVendor(null);
    fetchVendors(); // Refresh the list
  };

  const handleAddNewClick = () => {
    setEditingVendor(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!vendorToDelete) return;
    try {
      await api.delete(`/vendors/${vendorToDelete.id}`);
      alert("Vendor deleted successfully");
      fetchVendors();
    } catch (error) { 
    console.error("Failed to delete vendor:", error);
    const axiosError = error as import('axios').AxiosError;
    if (axiosError.response?.status === 409 || axiosError.response?.status === 400 ) {
       alert((axiosError.response?.data as { message?: string })?.message || "Cannot delete vendor: They might be linked to existing products.");
    } else {
       alert("Failed to delete vendor.");
    }
  }finally {
      setIsDeleteAlertOpen(false);
      setVendorToDelete(null);
    }
  };

  const columns = useMemo(() => getColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  }), [vendors]); // Re-memoize when data changes

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Vendor Management</h1>
        <Button onClick={handleAddNewClick}>Add New Vendor</Button>
      </div>

      {/* Vendor Table */}
      <DataTable columns={columns} data={vendors} />

      {/* Add/Edit Vendor Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingVendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
            <DialogDescription>
              {editingVendor ? "Update the vendor details below." : "Fill in the details to add a new vendor."}
            </DialogDescription>
          </DialogHeader>
          <VendorForm 
            onSuccess={handleSuccess}
            initialData={editingVendor}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete 
              <strong> {vendorToDelete?.name}</strong>. Make sure no products are linked to this vendor.
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