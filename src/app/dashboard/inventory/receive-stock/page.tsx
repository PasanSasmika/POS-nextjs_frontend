"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Product } from "@/app/dashboard/inventory/components/ProductType"; // Reuse Product type
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronsUpDown, X } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { AxiosError } from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Vendor } from "../../vendors/components/VenderType";
import { toast } from "react-toastify";

// Define the shape of an item in our local receiving list
interface ReceivingItem extends Product {
  quantityReceived: number;
  batchCostPrice: number;
}

export default function ReceiveStockPage() {
  // Data state
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  // Form state
  const [selectedVendorId, setSelectedVendorId] = useState<string | "none">("none");
  const [receivingList, setReceivingList] = useState<ReceivingItem[]>([]);
  const [productSearchOpen, setProductSearchOpen] = useState(false);

  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const { user } = useAuthStore(); // Get logged-in user for the audit log

  // Fetch initial data (vendors and products for searching)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [vendorsRes, productsRes] = await Promise.all([
          api.get("/vendors"),
          api.get("/products"),
        ]);
        setAllVendors(vendorsRes.data);
        setAllProducts(productsRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setAlert({ type: "error", message: "Failed to load vendors or products." });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Handlers ---

  /**
   * Adds a product from the search popover to the receiving list.
   */
  const handleProductSelect = (product: Product) => {
    setProductSearchOpen(false);
    // Check if item is already in the list
    if (receivingList.find(item => item.id === product.id)) {
      return; // Don't add duplicates
    }
    // Add to list with default quantity 1 and current cost price
    setReceivingList(prev => [
      ...prev,
      { ...product, quantityReceived: 1, batchCostPrice: product.costPrice }
    ]);
  };

  /**
   * Updates the quantity or cost price of an item in the receiving list.
   */
  const handleItemUpdate = (productId: number, field: 'quantityReceived' | 'batchCostPrice', value: string) => {
    const numericValue = parseFloat(value) || 0;
    setReceivingList(prevList =>
      prevList.map(item =>
        item.id === productId ? { ...item, [field]: numericValue } : item
      )
    );
  };

  /**
   * Removes an item from the receiving list.
   */
  const handleItemRemove = (productId: number) => {
    setReceivingList(prevList => prevList.filter(item => item.id !== productId));
  };

  /**
   * Submits the entire receiving list to the backend.
   */
  const handleSubmit = async () => {
    setAlert(null);
    if (receivingList.length === 0) {
      setAlert({ type: "error", message: "Please add at least one product to the list." });
      return;
    }
    if (!user) {
        setAlert({ type: "error", message: "User not found. Please log in again." });
        return;
    }

    setSubmitting(true);
    
    // Format the data for the backend DTO
    const payload = {
      vendorId: selectedVendorId === "none" ? null : parseInt(selectedVendorId),
      items: receivingList.map(item => ({
        productId: item.id,
        quantityReceived: item.quantityReceived,
        costPrice: item.batchCostPrice,
      })),
    };

    // Validate quantities and costs
    for (const item of payload.items) {
      if (item.quantityReceived <= 0) {
        setAlert({ type: "error", message: `Quantity for must be greater than 0.` }); // Add product name
        setSubmitting(false);
        return;
      }
       if (item.costPrice <= 0) {
        setAlert({ type: "error", message: `Cost price for must be greater than 0.` }); // Add product name
        setSubmitting(false);
        return;
      }
    }

    try {
      await api.post("/products/receive-stock", payload);
  toast.success("Stock received and updated successfully!");
  setReceivingList([]);
  setSelectedVendorId("none");
    } catch (error) {
      console.error("Failed to receive stock:", error);
      toast.error("Failed to receive stock.");
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      const message = Array.isArray(axiosError.response?.data?.message)
        ? axiosError.response.data.message.join(', ')
        : axiosError.response?.data?.message || "An unknown error occurred.";
      setAlert({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) return <div className="container mx-auto py-10 text-center">Loading data...</div>;

  return (
    <div className="container mx-auto py-10 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Receive Stock</h1>
        <Button onClick={handleSubmit} disabled={submitting || receivingList.length === 0}>
          {submitting ? "Saving..." : "Confirm Stock In"}
        </Button>
      </div>
      
      {/* Alert Message */}
      {alert && (
        <Alert variant={alert.type === "error" ? "destructive" : "default"}>
          <Terminal className="h-4 w-4" />
          <AlertTitle>{alert.type === "success" ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Form Controls: Vendor and Product Search */}
      <Card>
        <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
          {/* Vendor Select */}
          <div className="space-y-2">
            <Label>Select Vendor (Optional)</Label>
            <Select onValueChange={setSelectedVendorId} value={selectedVendorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- None / Other --</SelectItem>
                {allVendors.map(vendor => (
                  <SelectItem key={vendor.id} value={String(vendor.id)}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Product Search */}
          <div className="space-y-2">
            <Label>Add Product to List</Label>
            <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  Search for a product...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Search product name or SKU..." />
                  <CommandList>
                    <CommandEmpty>No product found.</CommandEmpty>
                    <CommandGroup>
                      {allProducts.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={`${product.name} ${product.sku}`} // Searchable value
                          onSelect={() => handleProductSelect(product)}
                        >
                          {product.name} ({product.sku})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Receiving List Table */}
      <Card>
        <CardHeader>
          <CardTitle>Receiving List ({receivingList.length} {receivingList.length === 1 ? 'item' : 'items'})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="w-32">Quantity</TableHead>
                <TableHead className="w-40">Cost Price (per item)</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivingList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    Use the search bar above to add products.
                  </TableCell>
                </TableRow>
              )}
              {receivingList.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.name}
                    <div className="text-xs text-muted-foreground">{item.sku}</div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantityReceived}
                      onChange={(e) => handleItemUpdate(item.id, 'quantityReceived', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.batchCostPrice}
                      onChange={(e) => handleItemUpdate(item.id, 'batchCostPrice', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleItemRemove(item.id)}>
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}