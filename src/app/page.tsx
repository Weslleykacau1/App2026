"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, Shield, User, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth, UserRole } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = (role: UserRole) => {
    login({
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      email: `${role}@tridriver.com`,
      role,
    });
    router.push(`/${role}`);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // This is a mock login. In a real app, you'd call Firebase here.
    toast({
      title: "Login Simulated",
      description: "You are being redirected to the passenger dashboard.",
    });
    handleLogin("passenger");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-16">
        <div className="text-center lg:text-left lg:w-1/2">
            <h1 className="text-5xl md:text-7xl font-bold text-primary font-headline">TriDriver</h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                Your journey, simplified. Select your role to get started.
            </p>
             <div className="mt-8 hidden lg:flex items-center gap-4">
                <Button variant="outline" size="lg" className="gap-2" onClick={() => handleLogin('passenger')}>
                    <User /> I'm a Passenger
                </Button>
                 <Button variant="outline" size="lg" className="gap-2" onClick={() => handleLogin('driver')}>
                    <Car /> I'm a Driver
                </Button>
            </div>
        </div>

        <Card className="w-full max-w-md lg:w-1/2 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <Button type="submit" className="w-full !mt-8" size="lg">
                  Sign In
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
             <div className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Sign up
              </Link>
            </div>
            <div className="relative w-full my-2">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                        Or continue as
                    </span>
                </div>
            </div>
             <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2">
                <Button variant="outline" className="w-full gap-2" onClick={() => handleLogin('passenger')}>
                    <User /> Passenger
                </Button>
                 <Button variant="outline" className="w-full gap-2" onClick={() => handleLogin('driver')}>
                    <Car /> Driver
                </Button>
                 <Button variant="outline" className="w-full gap-2" onClick={() => handleLogin('admin')}>
                    <Shield /> Admin
                </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
