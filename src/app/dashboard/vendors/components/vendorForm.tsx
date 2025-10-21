"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import api from "@/lib/api";
import { useEffect } from "react";
import { Textarea } from "@/components/ui/textarea"; 
import { Vendor } from "./VenderType";


const formSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  phone: z.string().min(1, "Phone number is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional(),
});

interface VendorFormProps {
  onSuccess: () => void;
  initialData?: Vendor | null;
}

export default function VendorForm({ onSuccess, initialData }: VendorFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      contactPerson: "",
      email: "",
      address: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        phone: initialData.phone,
        contactPerson: initialData.contactPerson || "",
        email: initialData.email || "",
        address: initialData.address || "",
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Replace empty strings with null for optional fields if needed by backend
    const submissionData = {
        ...values,
        contactPerson: values.contactPerson || null,
        email: values.email || null,
        address: values.address || null,
    };

    try {
      if (initialData) {
        await api.patch(`/vendors/${initialData.id}`, submissionData);
        alert("Vendor updated successfully!");
      } else {
        await api.post("/vendors", submissionData);
        alert("Vendor created successfully!");
      }
      onSuccess();
    } catch (error: any) {
      console.error("Failed to save vendor:", error);
      alert(`Error: ${error.response?.data?.message || "Failed to save vendor."}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Vendor Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="contactPerson" render={({ field }) => (
          <FormItem><FormLabel>Contact Person (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="address" render={({ field }) => (
          <FormItem><FormLabel>Address (Optional)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Create Vendor")}
        </Button>
      </form>
    </Form>
  );
}