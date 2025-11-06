import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Store, LogIn } from "lucide-react"; 
import Link from "next/link"; 
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      
      <Card className="w-full max-w-md shadow-xl border-gray-300">
        
        <CardHeader className="items-center text-center pb-4">
          <div className="rounded-full bg-gray-900 p-4 text-white">
            <Store className="h-10 w-10" />
          </div>
          
          <CardTitle className="pt-4 text-3xl font-bold">
            POS System
          </CardTitle>
          <CardDescription className="text-base pt-1">
            Welcome Back
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Please log in to access your dashboard, manage sales, and track inventory.
          </p>
        </CardContent>
        
        <CardFooter>
          
          <Button asChild className="w-full" size="lg">
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Link>
          </Button>
        </CardFooter>
        
      </Card>
    </main>
  );
}