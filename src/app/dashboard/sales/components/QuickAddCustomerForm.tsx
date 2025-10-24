"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import api from "@/lib/api";
import { Customer } from "@/app/dashboard/customers/components/CustomerType";
import { useState } from "react";
import { AxiosError } from "axios";

const quickAddSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")), 
});

interface QuickAddCustomerFormProps {
  onSuccess: (newCustomer: Customer) => void; 
}

export default function QuickAddCustomerForm({ onSuccess }: QuickAddCustomerFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof quickAddSchema>>({
    resolver: zodResolver(quickAddSchema),
    defaultValues: { name: "", phone: "" },
  });

  const onSubmit = async (values: z.infer<typeof quickAddSchema>) => {
    setErrorMessage(null);
    try {
      const response = await api.post("/customers", values);
      onSuccess(response.data); 
    } catch (error) {
      console.error("Quick add customer failed:", error);
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      let message = "Failed to add customer.";
      if (axiosError.response?.status === 409) { 
        message = "A customer with this phone number already exists.";
        form.setError("phone", { message });
      } else if (axiosError.response?.data?.message) {
         message = Array.isArray(axiosError.response.data.message)
                   ? axiosError.response.data.message.join(', ')
                   : axiosError.response.data.message;
      }
      setErrorMessage(message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        
         <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
         )} />
         {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Adding..." : "Add Customer"}
        </Button>
      </form>
    </Form>
  );
}