
"use client";

import { withAuth } from "@/components/with-auth";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Home, Briefcase, BarChart2, User as UserIcon, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { setItem } from "@/lib/storage";


const RERIDE_REQUEST_KEY = 'reride_request';

function PassengerHomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pickup, setPickup] = useState("Av. Bezerra de Menezes, 1850");
  const [destination, setDestination] = useState("");

  if (!user) {
    return null; 
  }

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.toUpperCase();
  }

  const handleSearchRide = () => {
    setItem(RERIDE_REQUEST_KEY, { pickup, destination });
    router.push('/passenger/request-ride');
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/40 text-foreground">
      
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-background">
        <h1 className="text-2xl font-bold">Olá, {user.name.split(' ')[0]}!</h1>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-10 w-10">
                <SlidersHorizontal className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10 cursor-pointer" onClick={() => router.push('/passenger/profile')}>
                <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person avatar" alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-4 space-y-6">
        
        {/* Ride Request Card */}
        <Card className="shadow-lg">
          <CardContent className="p-4 space-y-4">
            <div className="relative flex items-center">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Local de partida"
                className="pl-10 h-12 text-base bg-muted border-none"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
            </div>
            <div className="relative flex items-center cursor-pointer" onClick={handleSearchRide}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <div className="pl-10 h-12 text-base bg-muted border-none w-full flex items-center rounded-md text-muted-foreground">
                Para onde vamos?
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saved Places */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-2 rounded-lg cursor-pointer hover:bg-background">
            <div className="p-3 bg-muted rounded-full">
              <Home className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">Casa</p>
              <p className="text-sm text-muted-foreground">Rua das Flores, 123</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-2 rounded-lg cursor-pointer hover:bg-background">
            <div className="p-3 bg-muted rounded-full">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">Trabalho</p>
              <p className="text-sm text-muted-foreground">Av. Principal, 456</p>
            </div>
          </div>
        </div>

        {/* Safety Banner */}
        <div className="bg-teal-50 border border-teal-200 text-teal-800 p-4 rounded-lg flex items-center justify-between">
          <div>
            <h3 className="font-bold">Viaje com segurança</h3>
            <p className="text-sm">Nossos motoristas são verificados.</p>
          </div>
          <ShieldCheck className="h-8 w-8 text-teal-500" />
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="sticky bottom-0 bg-background border-t p-2">
        <div className="flex justify-around items-center">
          <Button variant="ghost" className="flex flex-col h-auto items-center gap-1 text-teal-500">
            <div className="p-2 bg-teal-100 rounded-md">
                <Home className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold">Início</span>
          </Button>
          <Button variant="ghost" className="flex flex-col h-auto items-center gap-1 text-muted-foreground">
            <BarChart2 className="h-5 w-5" />
            <span className="text-xs">Atividade</span>
          </Button>
          <Button variant="ghost" className="flex flex-col h-auto items-center gap-1 text-muted-foreground" onClick={() => router.push('/passenger/profile')}>
            <UserIcon className="h-5 w-5" />
            <span className="text-xs">Conta</span>
          </Button>
        </div>
      </footer>
    </div>
  );
}

export default withAuth(PassengerHomePage, ["passenger"]);
