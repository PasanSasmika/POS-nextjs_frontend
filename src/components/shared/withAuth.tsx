"use client";

import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useEffect, ComponentType } from "react";

export default function withAuth<P extends object>(Component: ComponentType<P>) {
  return function WithAuth(props: P) {
    const { token } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
      if (!token) {
        router.replace("/login");
      }
    }, [token, router]);

    if (!token) {
      return null; 
    }

    return <Component {...props} />;
  };
}