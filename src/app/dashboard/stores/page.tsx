"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { getColumns } from "./components/columns";
import { Store } from "./components/StoreType";
import { DataTable } from "@/components/shared/DataTable"; 
import api from "@/lib/api"; 
import { Button } from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog"; 
import StoreForm from "./components/StoreForm"; 
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog"; 
import { useAuthStore } from "@/store/auth"; 
import { toast } from "react-toastify";


export default function StoresPage() {
  // --- State Variables ---
  const [stores, setStores] = useState<Store[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [fetchError, setFetchError] = useState<string | null>(null); 
  const [isFormOpen, setIsFormOpen] = useState(false); 
  const [editingStore, setEditingStore] = useState<Store | null>(null); 
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false); 
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null); 

  const loggedInUser = useAuthStore((state) => state.user);


  const fetchStores = useCallback(async () => {
    console.log("Fetching stores...");
    setLoading(true);
    setFetchError(null); 
    try {
      const response = await api.get("/stores"); 
      setStores(response.data); 
      console.log("Stores fetched:", response.data.length);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
      setFetchError("Could not load stores. Please ensure the backend is running."); 
      setStores([]);
    } finally {
      setLoading(false); 
    }
  }, []); 

  useEffect(() => {
    if (loggedInUser?.role === 'ADMIN') {
        fetchStores();
    } else {
        setLoading(false);
        setFetchError("Access Denied: Only Admins can manage stores.");
    }
  }, [fetchStores, loggedInUser?.role]); 


  const handleSuccess = useCallback(() => {
    console.log("StoreForm success handler triggered.");
    setIsFormOpen(false);
    setEditingStore(null); 
    fetchStores(); 
  }, [fetchStores]); 

 
  const handleAddNewClick = useCallback(() => {
    console.log("Add New Store button clicked.");
    setEditingStore(null); 
    setIsFormOpen(true); 
  }, []);

  /**
   * @param {Store} store 
   */
  const handleEditClick = useCallback((store: Store) => {
    console.log("Edit Store action clicked:", store);
    setEditingStore(store); 
    setIsFormOpen(true);
  }, []);

  /**
   * @param {Store} store 
   */
  const handleDeleteClick = useCallback((store: Store) => {
    console.log("Delete Store action clicked:", store);
    if (store.id === 1) { 
      toast.error("The main store (ID 1) cannot be deleted.");
      return;
    }
    setStoreToDelete(store); 
    setIsDeleteAlertOpen(true); 
  }, []);


  const confirmDelete = useCallback(async () => {
    if (!storeToDelete) return; 
    console.log("Confirming delete for store:", storeToDelete);
    try {
      await api.delete(`/stores/${storeToDelete.id}`); 
      toast.success("Store deleted successfully");
      fetchStores(); 
    } catch (error) { // Remove ': any'
    console.error("Failed to delete store:", error);
    const axiosError = error as import('axios').AxiosError; // Type assertion
    // Check for specific backend constraint error (409 Conflict or maybe 400 Bad Request depending on backend)
    if (axiosError.response?.status === 409 || axiosError.response?.status === 400) {
        toast.error((axiosError.response?.data as { message?: string })?.message || "Cannot delete store: It might be linked to other records.");
    } else {
        toast.error("Failed to delete store. Please check console.");
    }
    } finally {
      setIsDeleteAlertOpen(false); 
      setStoreToDelete(null); 
    }
  }, [storeToDelete, fetchStores]);

  const columns = useMemo(() => getColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  }), [handleEditClick, handleDeleteClick]); 

  if (fetchError) {
    return <div className="container mx-auto py-10 text-center text-red-500">{fetchError}</div>;
  }

  if (loading && stores.length === 0) {
    return <div className="container mx-auto py-10 text-center">Loading stores...</div>;
  }

  if (loggedInUser?.role !== 'ADMIN' && !loading) {
     return <div className="container mx-auto py-10 text-center text-red-500">Access Denied: Only Admins can manage stores.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Store Management</h1>
        <Button onClick={handleAddNewClick}>Add New Store</Button>
      </div>

      <DataTable columns={columns} data={stores} />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingStore ? "Edit Store" : "Add New Store"}</DialogTitle>
            <DialogDescription>
              {editingStore ? "Update the store details below." : "Fill in the details to create a new store."}
            </DialogDescription>
          </DialogHeader>
          <StoreForm
            onSuccess={handleSuccess}
            initialData={editingStore}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the store:
              <strong> {storeToDelete?.name}</strong>. Ensure no users or sales are linked to this store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStoreToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}