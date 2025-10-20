"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";

// Define the shape of the form data
interface FormData {
  name: string;
  sku: string;
  category: string;
  stockQuantity: number;
  sellingPrice: number;
  costPrice: number;
  supplierId: string; // Use string for select value
}

// Define the props, including the vendor list and a success callback
interface ProductFormProps {
  vendors: { id: number; name: string }[];
  onSuccess: () => void;
}

export default function ProductForm({ vendors, onSuccess }: ProductFormProps) {
  // State for all form fields
  const [formData, setFormData] = useState<FormData>({
    name: "",
    sku: "",
    category: "",
    stockQuantity: 0,
    sellingPrice: 0,
    costPrice: 0,
    supplierId: "",
  });

  // State for validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);

  // Handle changes for text and number inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  // Handle changes for the select dropdown
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, supplierId: value }));
  };
  
  // Manual validation function
  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.sku) newErrors.sku = "SKU is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.stockQuantity < 0) newErrors.stockQuantity = "Stock cannot be negative";
    if (formData.sellingPrice < 0) newErrors.sellingPrice = "Price cannot be negative";
    if (formData.costPrice < 0) newErrors.costPrice = "Cost cannot be negative";
    if (!formData.supplierId) newErrors.supplierId = "Please select a vendor";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Convert supplierId to a number before sending
      const submissionData = {
        ...formData,
        supplierId: parseInt(formData.supplierId, 10),
      };
      await api.post("/products", submissionData);
      alert("Product created successfully!");
      onSuccess(); // Call the callback to close the dialog and refresh
    } catch (error: any) {
      console.error("Failed to create product:", error);
      alert(`Error: ${error.response?.data?.message || "Failed to create product."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>
      
      {/* SKU */}
      <div className="space-y-2">
        <Label htmlFor="sku">SKU</Label>
        <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} />
        {errors.sku && <p className="text-sm text-red-500">{errors.sku}</p>}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" value={formData.category} onChange={handleChange} />
        {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
      </div>

      {/* Stock Quantity */}
      <div className="space-y-2">
        <Label htmlFor="stockQuantity">Stock Quantity</Label>
        <Input id="stockQuantity" name="stockQuantity" type="number" value={formData.stockQuantity} onChange={handleChange} />
        {errors.stockQuantity && <p className="text-sm text-red-500">{errors.stockQuantity}</p>}
      </div>

      {/* Selling Price */}
      <div className="space-y-2">
        <Label htmlFor="sellingPrice">Selling Price</Label>
        <Input id="sellingPrice" name="sellingPrice" type="number" step="0.01" value={formData.sellingPrice} onChange={handleChange} />
        {errors.sellingPrice && <p className="text-sm text-red-500">{errors.sellingPrice}</p>}
      </div>

      {/* Cost Price */}
      <div className="space-y-2">
        <Label htmlFor="costPrice">Cost Price</Label>
        <Input id="costPrice" name="costPrice" type="number" step="0.01" value={formData.costPrice} onChange={handleChange} />
        {errors.costPrice && <p className="text-sm text-red-500">{errors.costPrice}</p>}
      </div>
      
      {/* Vendor/Supplier */}
      <div className="col-span-2 space-y-2">
        <Label>Vendor/Supplier</Label>
        <Select onValueChange={handleSelectChange} value={formData.supplierId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a vendor" />
          </SelectTrigger>
          <SelectContent>
            {vendors.map(vendor => (
              <SelectItem key={vendor.id} value={String(vendor.id)}>
                {vendor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.supplierId && <p className="text-sm text-red-500">{errors.supplierId}</p>}
      </div>
      
      <Button type="submit" className="col-span-2" disabled={loading}>
        {loading ? "Creating..." : "Create Product"}
      </Button>
    </form>
  );
}