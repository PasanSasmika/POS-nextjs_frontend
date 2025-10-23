"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { User, Role, Store } from "./UserType"; // Ensure Role enum is correctly defined/exported in UserType.ts
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { AxiosError } from "axios";

// Zod schema
const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.nativeEnum(Role),
  storeId: z.string().optional().nullable(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  stores: Store[];
  onSuccess: () => void;
  initialData?: User | null;
}

export default function UserForm({ stores, onSuccess, initialData }: UserFormProps) {
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
        password: "", // Always clear
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
    setAlertMessage(null);
    console.log("Submitting user form with values:", values);

    // Manual Password Check for Create
    if (!initialData && !values.password) {
      form.setError("password", { type: "manual", message: "Password is required for new users." });
      setAlertMessage({ type: 'error', message: 'Password is required for new users.' });
      return;
    }

    // --- FIX: Use const instead of let for apiPayload ---
    const apiPayload: {
      username: string;
      fullName: string;
      email: string | null;
      role: Role;
      storeId: number | null;
      password?: string;
    } = {
      username: values.username,
      fullName: values.fullName,
      email: values.email || null,
      role: values.role,
      storeId: (values.storeId && values.storeId !== "none") ? parseInt(values.storeId, 10) : null,
    };

    // Only add password if it's provided (for create or update)
    if (values.password && values.password.length > 0) {
      apiPayload.password = values.password;
    }
    // --- End Payload Build ---

    try {
      if (initialData) {
        console.log("Submitting PATCH /users/:id", apiPayload);
        await api.patch(`/users/${initialData.id}`, apiPayload);
        setAlertMessage({ type: 'success', message: 'User updated successfully!' });
      } else {
        // Defensive check: ensure password is included for creation if somehow missed earlier
        if (!apiPayload.password) {
          throw new Error("Password is required for creating user but was missing in payload.");
        }
        console.log("Submitting POST /users", apiPayload);
        await api.post("/users", apiPayload);
        setAlertMessage({ type: 'success', message: 'User created successfully!' });
      }
      setTimeout(onSuccess, 1500);
    } catch (error) {
      console.error("Failed to save user:", error);
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (axiosError.response) {
        if (axiosError.response.status === 409) {
          errorMessage = "Username already exists.";
          form.setError("username", { type: "server", message: errorMessage });
        } else if (axiosError.response.data?.message) {
          errorMessage = Array.isArray(axiosError.response.data.message)
            ? axiosError.response.data.message.join(', ')
            : axiosError.response.data.message;
        }
      }
      setAlertMessage({ type: 'error', message: errorMessage });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Username */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Full Name */}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input type="email" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{initialData ? "New Password (Optional)" : "Password"}</FormLabel>
              <FormControl>
                <Input type="password" {...field} placeholder={initialData ? "Leave blank to keep current" : ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Role */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(Role).map(roleValue => (
                    <SelectItem key={roleValue} value={roleValue}>{roleValue}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Store ID */}
        <FormField
          control={form.control}
          name="storeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign to Store (Optional)</FormLabel>
              <Select
                onValueChange={field.onChange} // RHF updates string value
                value={field.value ?? "none"} // Controlled: value is string or "none"
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
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
          )}
        />

        {/* Display Success/Error Alert */}
        {alertMessage && (
          <Alert variant={alertMessage.type === 'error' ? 'destructive' : 'default'} className="mt-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>{alertMessage.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>
              {alertMessage.message}
            </AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Create User")}
        </Button>
      </form>
    </Form>
  );
}