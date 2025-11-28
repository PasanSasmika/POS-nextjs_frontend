"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { Product } from "./ProductType";
import { toast } from "react-toastify";

interface FormData {
  name: string;
  sku: string;
  category: string;
  sellingPrice: number;
  costPrice: number;
  supplierId: string;
}

interface ProductFormProps {
  vendors: { id: number; name: string }[];
  onSuccess: () => void;
  initialData?: Product | null; 
}

export default function ProductForm({ vendors, onSuccess, initialData }: ProductFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    sku: "",
    category: "",
    sellingPrice: 0,
    costPrice: 0,
    supplierId: "",
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        sku: initialData.sku,
        category: initialData.category,
        sellingPrice: initialData.sellingPrice,
        costPrice: initialData.costPrice,
        supplierId: String(initialData.supplierId),
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, supplierId: value }));
  };
  
  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.sku) newErrors.sku = "SKU is required";
    if (!formData.category) newErrors.category = "Category is required";
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
    
    const submissionData = {
      ...formData,
      supplierId: parseInt(formData.supplierId, 10),
    };

    try {
      if (initialData) {
        // --- UPDATE method ---
        await api.patch(`/products/${initialData.id}`, submissionData);
        toast.success("Product updated successfully!");
      } else {
        // --- (POST) method ---
        await api.post("/products", submissionData);
        toast.success("Product created successfully!");
      }
      onSuccess(); // Call the callback to close and refresh
    } catch (error) {
      console.error("Failed to save product:", error);
    const axiosError = error as import('axios').AxiosError;
    toast.error(`Error: ${(axiosError.response?.data as { message?: string })?.message || "Failed to save product."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sku">SKU</Label>
        <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} />
        {errors.sku && <p className="text-sm text-red-500">{errors.sku}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" value={formData.category} onChange={handleChange} />
        {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sellingPrice">Selling Price</Label>
        <Input id="sellingPrice" name="sellingPrice" type="number" step="0.01" value={formData.sellingPrice} onChange={handleChange} />
        {errors.sellingPrice && <p className="text-sm text-red-500">{errors.sellingPrice}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="costPrice">Cost Price</Label>
        <Input id="costPrice" name="costPrice" type="number" step="0.01" value={formData.costPrice} onChange={handleChange} />
        {errors.costPrice && <p className="text-sm text-red-500">{errors.costPrice}</p>}
      </div>
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
        {loading ? "Saving..." : (initialData ? "Save Changes" : "Create Product")}
      </Button>
    </form>
  );
}