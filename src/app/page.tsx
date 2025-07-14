
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, Shield, User } from "lucide-react";

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
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
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

  const handleQuickLogin = (role: UserRole) => {
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
      title: "Login Simulado",
      description: "Você está sendo redirecionado para o painel do passageiro.",
    });
    handleQuickLogin("passenger");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
       <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <Car className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-4xl font-bold text-primary mt-2">TriDriver</h1>
            <p className="text-muted-foreground">Bem-vindo de volta!</p>
        </div>
        
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormControl>
                    <Input placeholder="Email" {...field} className="h-12 text-base"/>
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
                    <FormControl>
                    <Input type="password" placeholder="Senha" {...field} className="h-12 text-base"/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <Button type="submit" className="w-full h-12 text-lg font-bold">
                Entrar
            </Button>
            </form>
        </Form>
        
        <div className="mt-6 text-center text-sm">
            <Link href="#" className="font-medium text-primary hover:underline">
            Esqueceu a senha?
            </Link>
        </div>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                    Ou continue com
                </span>
            </div>
        </div>

        <div className="w-full grid grid-cols-3 gap-2">
            <Button variant="outline" className="w-full gap-2 h-12" onClick={() => handleQuickLogin('passenger')}>
                <User /> <span className="hidden sm:inline">Passageiro</span>
            </Button>
            <Button variant="outline" className="w-full gap-2 h-12" onClick={() => handleQuickLogin('driver')}>
                <Car /> <span className="hidden sm:inline">Motorista</span>
            </Button>
            <Button variant="outline" className="w-full gap-2 h-12" onClick={() => handleQuickLogin('admin')}>
                <Shield /> <span className="hidden sm:inline">Admin</span>
            </Button>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
            Cadastre-se
            </Link>
        </div>
      </div>
    </main>
  );
}
