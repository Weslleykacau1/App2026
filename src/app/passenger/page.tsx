
"use client";

import { withAuth } from "@/components/with-auth";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Search, Home, BarChart3, User, ShieldCheck, Activity } from "lucide-react";

function PassengerMobileDashboard() {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.toUpperCase();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Main Content */}
      <main className="flex-1 p-4 pb-24">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Olá, {user?.name.split(' ')[0]}!</h1>
           {user && (
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={`@${user.name}`} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
           )}
        </header>

        {/* Ride Request Card */}
        <div className="p-4 mb-6 bg-card border rounded-lg shadow-sm">
          <div className="space-y-4">
            <div className="relative flex items-center">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="pickup"
                placeholder="Local de embarque"
                className="pl-10 h-12 text-base border-0 bg-muted focus-visible:ring-1 focus-visible:ring-ring"
                defaultValue="Av. Bezerra de Menezes, 1850"
              />
            </div>
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="destination"
                placeholder="Para onde vamos?"
                className="pl-10 h-12 text-base"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full mt-4 h-12 text-lg font-semibold">
            Buscar corrida
          </Button>
        </div>

        {/* Saved Places */}
        <div className="space-y-4 mb-6">
          <button className="flex items-center w-full text-left gap-4">
            <div className="p-3 bg-muted rounded-full">
                <Home className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">Casa</p>
              <p className="text-sm text-muted-foreground">Rua das Flores, 123</p>
            </div>
          </button>
           <button className="flex items-center w-full text-left gap-4">
            <div className="p-3 bg-muted rounded-full">
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">Trabalho</p>
              <p className="text-sm text-muted-foreground">Av. Principal, 456</p>
            </div>
          </button>
        </div>
        
        {/* Security Banner */}
        <div className="flex items-center p-4 rounded-lg bg-primary/10 text-primary-foreground">
            <div className="p-2 mr-4 bg-primary/20 rounded-full">
                <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
                <h3 className="font-bold text-primary">Viaje com segurança</h3>
                <p className="text-sm text-primary/90">Nossos motoristas são verificados.</p>
            </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-t-lg">
        <div className="flex justify-around h-20">
          <button className="flex flex-col items-center justify-center text-primary w-full gap-1">
            <div className="p-2 bg-primary/10 rounded-full">
              <Home className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Início</span>
          </button>
          <button className="flex flex-col items-center justify-center text-muted-foreground w-full gap-1">
            <Activity className="w-6 h-6" />
            <span className="text-xs font-medium">Atividade</span>
          </button>
          <button className="flex flex-col items-center justify-center text-muted-foreground w-full gap-1">
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Conta</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default withAuth(PassengerMobileDashboard, ["passenger"]);
