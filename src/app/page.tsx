
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, User, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth, UserRole } from "@/context/auth-context";

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-primary text-primary-foreground">
       <div className="w-full max-w-sm flex flex-col items-center text-center">
            <Car className="h-14 w-14 mb-6" />
            <h1 className="text-4xl font-bold tracking-tight">Onde a sua viagem começa</h1>
            <p className="mt-4 text-primary-foreground/80">Escolha como você quer entrar.</p>
        
            <div className="w-full space-y-4 mt-10">
                <Button 
                    className="w-full h-14 text-lg font-semibold bg-background text-primary hover:bg-background/90"
                    onClick={() => handleQuickLogin('passenger')}
                >
                    <User className="mr-3"/>
                    Entrar como Passageiro
                </Button>
                <Button 
                    variant="outline" 
                    className="w-full h-14 text-lg font-semibold bg-transparent border-background text-background hover:bg-background/10 hover:text-background"
                    onClick={() => handleQuickLogin('driver')}
                >
                    <Car className="mr-3"/>
                    Entrar como Motorista
                </Button>
            </div>

            <div className="mt-12 text-center text-sm font-medium">
                 <button onClick={() => handleQuickLogin('admin')} className="hover:underline">
                    Acesso Admin
                 </button>
                 <span className="mx-2 text-primary-foreground/50">|</span>
                 <Link href="/signup" className="hover:underline">
                    Cadastre-se
                </Link>
            </div>
      </div>
    </main>
  );
}
