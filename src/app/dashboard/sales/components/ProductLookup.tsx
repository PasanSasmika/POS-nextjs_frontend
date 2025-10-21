"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Product } from "@/app/dashboard/inventory/components/ProductType";
import api from "@/lib/api";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage,} from "@/components/ui/form";

// --- Zod Schema for SKU search ---
const SkuSearchSchema = z.object({
  sku: z.string().min(1, "SKU cannot be empty"),
});

export default function ProductLookup() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // --- RHF Form Setup ---
  const form = useForm<z.infer<typeof SkuSearchSchema>>({
    resolver: zodResolver(SkuSearchSchema),
    defaultValues: {
      sku: "",
    },
  });

  // Fetch all products for the searchable dropdown (no change)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };
    fetchProducts();
  }, []);

  // Handle adding a product from the search list (no change)
  const onProductSelect = (product: Product) => {
    addItem(product);
    setOpen(false);
  };

  // Handle adding a product from the SKU input (updated for RHF)
  const handleSkuSearch = async (values: z.infer<typeof SkuSearchSchema>) => {
    const { sku } = values;
    try {
      const response = await api.get(`/products/lookup/${sku}`);
      addItem(response.data);
      form.reset(); // Clear input on success
    } catch (error) {
      console.error("Product not found for SKU:", sku, error);
      alert("Product not found with that SKU.");
      // Set an error on the form field
      form.setError("sku", { message: "Product not found" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Barcode/SKU Input - Refactored with RHF */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSkuSearch)}
          className="flex w-full items-center space-x-2"
        >
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Scan or enter SKU..."
                    {...field}
                  />
                </FormControl>
                {/* FormMessage will automatically show validation errors */}
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" /> Find
          </Button>
        </form>
      </Form>
      {/* End RHF Form */}

      {/* Searchable Product Dropdown (no change) */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            Or search for a product by name...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search product..." />
            <CommandList>
              <CommandEmpty>No product found.</CommandEmpty>
              <CommandGroup>
                {products.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.name}
                    onSelect={() => onProductSelect(product)}
                  >
                    {product.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}