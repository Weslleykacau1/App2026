
"use client";

import { useRouter } from "next/navigation";
import { Car, User, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RoleSelectionPage() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      
      <div className="w-full max-w-md flex flex-col items-center text-center px-4 sm:px-0">
        <Car className="h-16 w-16 mb-4 text-primary" />
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight">Bem-vindo ao TriDriver</h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          Sua jornada começa aqui. Escolha seu perfil para continuar.
        </p>

        <div className="w-full grid grid-cols-1 md:grid-cols-1 gap-4 sm:gap-6 mt-8 sm:mt-12">
          <div 
            onClick={() => router.push('/login?role=passenger')}
            className="group relative cursor-pointer rounded-xl border-2 border-border bg-card p-6 sm:p-8 text-center transition-all hover:border-primary hover:shadow-2xl hover:-translate-y-1"
          >
            <div className="mb-4 text-primary">
              <User className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-card-foreground">Sou Passageiro</h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">Encontre uma corrida de forma rápida e segura.</p>
          </div>

          <div 
            onClick={() => router.push('/login?role=driver')}
            className="group relative cursor-pointer rounded-xl border-2 border-border bg-card p-6 sm:p-8 text-center transition-all hover:border-primary hover:shadow-2xl hover:-translate-y-1"
          >
            <div className="mb-4 text-primary">
              <Car className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-card-foreground">Sou Motorista</h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">Comece a dirigir e aumente sua renda.</p>
          </div>
        </div>
        
        <div className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-muted-foreground space-y-2">
            <p>
              Novo por aqui?{" "}
              <span onClick={() => router.push('/signup')} className="font-semibold text-primary hover:underline cursor-pointer">
                Cadastre-se
              </span>
            </p>
             <p>
              <span onClick={() => router.push('/login?role=admin')} className="font-semibold text-primary hover:underline cursor-pointer flex items-center justify-center gap-1.5">
                <Shield className="h-4 w-4" />
                Entrar como Administrador
              </span>
            </p>
        </div>
      </div>
    </main>
  );
}
