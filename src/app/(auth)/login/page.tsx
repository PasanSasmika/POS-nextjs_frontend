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
import { Lock } from "lucide-react";
import { toast } from "react-toastify";

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { setAuth } = useAuthStore();

  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    try {
      console.log("Submitting login:", values.username);
      const response = await api.post('/auth/login', values);
      const { access_token } = response.data;

      if (!access_token) {
          throw new Error("Access token not received from server.");
      }

      const decodedUser = jwtDecode<BackendJwtPayload>(access_token);
      console.log("Decoded JWT payload:", decodedUser);

      setAuth(access_token, decodedUser); 

      let redirectPath = '/dashboard'; 
      if (decodedUser.role === 'CASHIER') {
        redirectPath = '/dashboard/sales';
      } else if (decodedUser.role === 'STOCK') {
        redirectPath = '/dashboard/inventory';
      }
      console.log(`Login successful. Redirecting to ${redirectPath}`);
      toast.success("Login Successfully")
      router.push(redirectPath); 

    } catch (err) { 
      console.error("Login failed:", err);
      const axiosError = err as import('axios').AxiosError<{ message?: string }>; 
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
           <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
        <Lock className="h-8 w-8 text-black" />
      </div>
          <CardTitle className="text-2xl text-center">System Locked</CardTitle>
          <CardDescription className="text-center">
            Please login to your account to continue using POS
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