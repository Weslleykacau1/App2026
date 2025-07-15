
"use client";

import { useRouter } from "next/navigation";
import { Car, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RoleSelectionPage() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <Car className="h-16 w-16 mb-4 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Bem-vindo ao TriDriver</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Sua jornada começa aqui. Escolha seu perfil para continuar.
        </p>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div 
            onClick={() => router.push('/login?role=passenger')}
            className="group relative cursor-pointer rounded-xl border-2 border-border bg-card p-8 text-center transition-all hover:border-primary hover:shadow-2xl hover:-translate-y-1"
          >
            <div className="mb-4 text-primary">
              <User className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-card-foreground">Sou Passageiro</h2>
            <p className="mt-2 text-muted-foreground">Encontre uma corrida de forma rápida e segura.</p>
          </div>

          <div 
            onClick={() => router.push('/login?role=driver')}
            className="group relative cursor-pointer rounded-xl border-2 border-border bg-card p-8 text-center transition-all hover:border-primary hover:shadow-2xl hover:-translate-y-1"
          >
            <div className="mb-4 text-primary">
              <Car className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-card-foreground">Sou Motorista</h2>
            <p className="mt-2 text-muted-foreground">Comece a dirigir e aumente sua renda.</p>
          </div>
        </div>
        
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Novo por aqui?{" "}
          <span onClick={() => router.push('/signup')} className="font-semibold text-primary hover:underline cursor-pointer">
            Cadastre-se
          </span>
        </p>
      </div>
    </main>
  );
}
