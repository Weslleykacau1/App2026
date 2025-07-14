
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, User, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth, UserRole } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleQuickLogin = (role: UserRole) => {
    login({
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      email: `${role}@tridriver.com`,
      role,
    });
    router.push(`/${role}`);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, let's log in as a passenger by default with the form
    handleQuickLogin('passenger');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <Car className="h-14 w-14 mb-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
        <p className="mt-2 text-muted-foreground">Faça login para continuar</p>

        <form onSubmit={handleLogin} className="w-full space-y-4 mt-8">
          <Input type="email" placeholder="Email" className="h-12" required />
          <Input type="password" placeholder="Senha" className="h-12" required />
          <div className="text-right">
            <Link href="#" className="text-sm text-primary hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          <Button type="submit" className="w-full h-12 text-base font-semibold">
            Entrar
          </Button>
        </form>

        <div className="flex items-center w-full my-6">
          <div className="flex-grow border-t border-muted-foreground/20"></div>
          <span className="flex-shrink mx-4 text-xs uppercase text-muted-foreground">Ou continue com</span>
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
