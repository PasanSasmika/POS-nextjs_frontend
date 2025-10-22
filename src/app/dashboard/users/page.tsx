"use client";

import { useEffect, useState, useMemo } from "react";
import { getColumns } from "./components/columns";
import { User, Store } from "./components/UserType";
import { DataTable } from "@/components/shared/DataTable";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserForm from "./components/UserForm";
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
import { useAuthStore } from "@/store/auth"; // To check if the logged-in user is deleting themselves

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]); // Need store list for the form
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const loggedInUser = useAuthStore((state) => state.user); // Get logged-in user details

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
  try {
    const response = await api.get("/stores/dropdown"); 
    setStores(response.data);
  } catch (error) {
    console.error("Failed to fetch stores:", error);
  }
};

  useEffect(() => {
    fetchUsers();
    fetchStores();
  }, []);

  const handleSuccess = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    fetchUsers(); // Refresh user list
  };

  const handleAddNewClick = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (user: User) => {
     // Prevent deleting yourself or the main admin (ID 1)
     if (user.id === loggedInUser?.id) {
       alert("You cannot delete your own account.");
       return;
     }
     if (user.id === 1) {
       alert("The main admin account (ID 1) cannot be deleted.");
       return;
     }
    setUserToDelete(user);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/users/${userToDelete.id}`);
      alert("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user.");
    } finally {
      setIsDeleteAlertOpen(false);
      setUserToDelete(null);
    }
  };

  const columns = useMemo(() => getColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  }), [users, loggedInUser]); // Add loggedInUser dependency

  if (loading) return <div>Loading...</div>;

  // Basic check to only allow Admins to see this page (can be enhanced with layout protection)
  if (loggedInUser?.role !== 'ADMIN') {
     return <div className="p-4 text-red-500">Access Denied: Only Admins can manage users.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={handleAddNewClick}>Add New User</Button>
      </div>

      <DataTable columns={columns} data={users} />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update the user details below." : "Fill in the details to create a new user."}
            </DialogDescription>
          </DialogHeader>
          <UserForm 
            stores={stores}
            onSuccess={handleSuccess}
            initialData={editingUser}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user 
              <strong> {userToDelete?.username}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}