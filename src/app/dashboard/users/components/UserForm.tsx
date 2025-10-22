"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { User, Role, Store } from "./UserType";
import { useEffect } from "react";

const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.nativeEnum(Role),
  storeId: z.string().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  stores: Store[];
  onSuccess: () => void;
  initialData?: User | null;
}

export default function UserForm({ stores, onSuccess, initialData }: UserFormProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      password: "",
      role: Role.CASHIER,
      storeId: "none", 
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        username: initialData.username,
        fullName: initialData.fullName,
        email: initialData.email || "",
        password: "", 
        role: initialData.role,
        storeId: initialData.storeId?.toString() ?? "none", 
      });
    } else {
      form.reset({
        username: "",
        fullName: "",
        email: "",
        password: "",
        role: Role.CASHIER,
        storeId: "none",
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: UserFormData) => {
    if (!initialData && !values.password) {
      form.setError("password", { type: "manual", message: "Password is required for new users." });
      return; 
    }

    const submissionData: any = { ...values };

    if (initialData && !values.password) {
      delete submissionData.password;
    }

    submissionData.storeId = (values.storeId && values.storeId !== "none") ? parseInt(values.storeId, 10) : null;
    
    try {
      if (initialData) {
        await api.patch(`/users/${initialData.id}`, submissionData);
        alert("User updated successfully!");
      } else {
        await api.post("/users", submissionData);
        alert("User created successfully!");
      }
      onSuccess();
    } catch (error: any) {
      console.error("Failed to save user:", error);
      if (error.response?.status === 409) {
          form.setError("username", { type: "server", message: "Username already exists." });
      } else {
          alert(`Error: ${error.response?.data?.message || "Failed to save user."}`);
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Username */}
        <FormField control={form.control} name="username" render={({ field }) => (
          <FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        {/* Full Name */}
        <FormField control={form.control} name="fullName" render={({ field }) => (
          <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
         {/* Email */}
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        {/* Password */}
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>{initialData ? "New Password (Optional)" : "Password"}</FormLabel>
            <FormControl><Input type="password" {...field} placeholder={initialData ? "Leave blank to keep current password" : ""} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        {/* Role */}
        <FormField control={form.control} name="role" render={({ field }) => (
           <FormItem>
             <FormLabel>Role</FormLabel>
             <Select onValueChange={field.onChange} defaultValue={field.value}>
               <FormControl>
                 <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
               </FormControl>
               <SelectContent>
                 {Object.values(Role).map(role => (
                   <SelectItem key={role} value={role}>{role}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
             <FormMessage />
           </FormItem>
        )} />
         {/* Store ID */}
         <FormField control={form.control} name="storeId" render={({ field }) => (
           <FormItem>
             <FormLabel>Assign to Store (Optional)</FormLabel>
             <Select onValueChange={field.onChange} value={field.value ?? "none"}>
               <FormControl>
                 <SelectTrigger><SelectValue placeholder="Select a store" /></SelectTrigger>
               </FormControl>
               <SelectContent>
                 <SelectItem value="none">-- No Store --</SelectItem>
                 {stores.map(store => (
                   <SelectItem key={store.id} value={store.id.toString()}>{store.name}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
             <FormMessage />
           </FormItem>
        )} />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Create User")}
        </Button>
      </form>
    </Form>
  );
}