"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form";
import {Card,CardContent,CardDescription,CardHeader,CardTitle,} from "@/components/ui/card";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth"; 
import { jwtDecode } from 'jwt-decode'; 

const formSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

interface BackendJwtPayload {
    sub: number;
    username: string;
    role: string;
    fullName?: string;
    storeId?: number | null;
    iat?: number;
    exp?: number;
}


export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Initialize React Hook Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Get the setAuth action from the Zustand store
  const { setAuth } = useAuthStore();

  /**
   * Handles form submission: calls login API, decodes token, updates state, redirects.
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null); // Clear previous errors
    try {
      console.log("Submitting login:", values.username);
      // Call the backend login endpoint
      const response = await api.post('/auth/login', values);
      const { access_token } = response.data; // Assuming backend returns { access_token: "..." }

      if (!access_token) {
          throw new Error("Access token not received from server.");
      }

      // Decode the JWT payload, providing the expected type structure
      const decodedUser = jwtDecode<BackendJwtPayload>(access_token);
      console.log("Decoded JWT payload:", decodedUser);

      // Call the Zustand store action to save token and mapped user data
      setAuth(access_token, decodedUser); // Pass the raw decoded payload

      // Determine redirect path based on user role
      let redirectPath = '/dashboard'; // Default for Admin/Manager
      if (decodedUser.role === 'CASHIER') {
        redirectPath = '/dashboard/sales';
      } else if (decodedUser.role === 'STOCK') {
        redirectPath = '/dashboard/inventory';
      }
      console.log(`Login successful. Redirecting to ${redirectPath}`);
      router.push(redirectPath); // Navigate to the appropriate page

    } catch (err) { // Catch block with better error handling
      console.error("Login failed:", err);
      const axiosError = err as import('axios').AxiosError<{ message?: string }>; // Type Axios error
      // Set error message based on backend response or fallback
      setError(
          axiosError.response?.data?.message ||
          "Invalid username or password. Please try again."
      );
    }
  }

  // Render the login form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your username below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Display login error message */}
              {error && <p className="text-sm text-red-500">{error}</p>}
              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}