
"use client";

import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { Car, User, Shield, Loader2 } from "lucide-react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { useAuth, UserRole } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";


const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(1, { message: "Senha é obrigatória." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, isSubmitting } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    login(values);
  };
  
  const handleQuickLogin = (role: UserRole) => {
    let credentials = { email: "", password: "password" };
    
    if (role === 'admin') {
        credentials.email = "admin@tridriver.com";
        credentials.password = "admin123";
    } else if (role === 'driver') {
        credentials.email = "driver@tridriver.com";
        credentials.password = "driver123";
    } else if (role === 'passenger') {
        credentials.email = "passenger@tridriver.com";
        credentials.password = "passenger123";
    }

    form.setValue("email", credentials.email);
    form.setValue("password", credentials.password);

    setTimeout(() => {
        login({ email: credentials.email, password: credentials.password }, role);
    }, 100);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <Car className="h-14 w-14 mb-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
        <p className="mt-2 text-muted-foreground">Faça login para continuar</p>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4 mt-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Email" {...field} className="h-12 text-base" />
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
                      <Input type="password" placeholder="Senha" {...field} className="h-12 text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-right">
                <Link href="https://wa.me/5511912345678" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>

               <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isSubmitting}>
                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Entrar
               </Button>
            </form>
        </Form>
        
        <div className="flex items-center w-full my-6">
          <div className="flex-grow border-t border-muted-foreground/20"></div>
          <span className="flex-shrink mx-4 text-xs uppercase text-muted-foreground">Ou Acesso Rápido</span>
          <div className="flex-grow border-t border-muted-foreground/20"></div>
        </div>

        <div className="w-full grid grid-cols-3 gap-3">
          <Button variant="outline" className="h-12" onClick={() => handleQuickLogin('passenger')}>
            <User className="mr-2 h-4 w-4" />
            Passageiro
          </Button>
          <Button variant="outline" className="h-12" onClick={() => handleQuickLogin('driver')}>
            <Car className="mr-2 h-4 w-4" />
            Motorista
          </Button>
          <Button variant="outline" className="h-12" onClick={() => handleQuickLogin('admin')}>
            <Shield className="mr-2 h-4 w-4" />
            Admin
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
