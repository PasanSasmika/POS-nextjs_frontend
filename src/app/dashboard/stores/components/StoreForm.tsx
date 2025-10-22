"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea"; 
import api from "@/lib/api";
import { Store } from "./StoreType";
import { useEffect } from "react";


const formSchema = z.object({
  name: z.string().min(1, "Store name is required"), 
  address: z.string().optional(), 
});


interface StoreFormProps {
  onSuccess: () => void; 
  initialData?: Store | null; 
}


export default function StoreForm({ onSuccess, initialData }: StoreFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      name: "",
      address: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        address: initialData.address || "", 
      });
    } else {
      form.reset({ name: "", address: "" });
    }
  }, [initialData, form]); 

  /**
   * @param {z.infer<typeof formSchema>} values 
   */
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const submissionData = {
      ...values,
      address: values.address || null,
    };

    try {
      if (initialData) {
        console.log("Submitting PATCH /stores/:id", submissionData);
        await api.patch(`/stores/${initialData.id}`, submissionData);
        alert("Store updated successfully!");
      } else {
        console.log("Submitting POST /stores", submissionData);
        await api.post("/stores", submissionData);
        alert("Store created successfully!");
      }
      onSuccess(); 
    } catch (error: any) {
      console.error("Failed to save store:", error);
      alert(`Error: ${error.response?.data?.message || "Failed to save store."}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control} 
          name="name" 
          render={({ field }) => ( 
            <FormItem>
              <FormLabel>Store Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Main Branch" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 123 Main Street, City" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Create Store")}
        </Button>
      </form>
    </Form>
  );
}