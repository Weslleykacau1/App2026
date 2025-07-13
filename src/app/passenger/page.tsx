
"use client";

import { useState } from "react";
import { withAuth } from "@/components/with-auth";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Search, Car, ArrowLeft, Loader2, Star, User, Wallet, Landmark, CircleDollarSign, CreditCard, Activity, Home, Calendar, Hash, ChevronRight, Edit, Bell, LogOut, Receipt, Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map } from "@/components/map";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

type RideCategory = "x" | "confort";
interface RideDetails {
  distance: number;
  price: number;
  category: RideCategory;
}
type PaymentMethod = "pix" | "cash" | "card_machine";
type ActiveView = "home" | "activity" | "account";

const rideHistory = [
  { id: 1, destination: 'Shopping Central', date: '25 de Jul, 18:30', price: 15.50, status: 'Concluída', category: 'x' },
  { id: 2, destination: 'Aeroporto Internacional', date: '24 de Jul, 08:00', price: 42.00, status: 'Concluída', category: 'confort' },
  { id: 3, destination: 'Parque da Cidade', date: '22 de Jul, 14:15', price: 12.80, status: 'Cancelada', category: 'x' },
  { id: 4, destination: 'Centro de Convenções', date: '21 de Jul, 10:00', price: 22.30, status: 'Concluída', category: 'confort' },
];


function PassengerMobileDashboard() {
  const { user, logout } = useAuth();
  const [rideCategory, setRideCategory] = useState<RideCategory>("x");
  const [isSearching, setIsSearching] = useState(false);
  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [activeView, setActiveView] = useState<ActiveView>('home');

  const getInitials = (name: string) => {
    if (!name) return "";
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.toUpperCase();
  }

  const handleSearchRide = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setRideDetails(null);

    // Simulate API call to get ride details
    setTimeout(() => {
      const distance = Math.random() * (15 - 3) + 3; // Random distance between 3 and 15 km
      const baseFare = rideCategory === "x" ? 1.20 : 2.00;
      const price = distance * baseFare + 2.50; // distance * fare + base_fee

      setRideDetails({
        distance: parseFloat(distance.toFixed(1)),
        price: parseFloat(price.toFixed(2)),
        category: rideCategory,
      });
      setIsSearching(false);
    }, 2000);
  };

  const resetSearch = () => {
    setRideDetails(null);
    setIsSearching(false);
  }

  if (!user) return null;

  const renderContent = () => {
    switch(activeView) {
      case 'home':
        return (
           <Card className="shadow-2xl rounded-2xl">
            <CardContent className="p-4">
              {rideDetails ? (
                // Ride details view
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <button onClick={resetSearch} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <ArrowLeft className="w-4 h-4"/>
                      Voltar
                    </button>
                    <h3 className="text-xl font-bold">Sua Corrida</h3>
                    <div className="w-10"></div>
                  </div>
                  <div className="flex items-center justify-around text-center p-4 bg-muted rounded-lg">
                      <div>
                          <p className="text-sm text-muted-foreground">Distância</p>
                          <p className="text-lg font-bold">{rideDetails.distance} km</p>
                      </div>
                      <div>
                          <p className="text-sm text-muted-foreground">Preço</p>
                          <p className="text-lg font-bold text-primary">R${rideDetails.price.toFixed(2)}</p>
                      </div>
                      <div>
                          <p className="text-sm text-muted-foreground">Categoria</p>
                          <p className="text-lg font-bold">{rideDetails.category === 'x' ? 'Corrida X' : 'Confort'}</p>
                      </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Pagamento</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => setPaymentMethod('pix')} className={cn("flex flex-col items-center justify-center p-2 rounded-lg border-2", paymentMethod === 'pix' ? 'border-primary bg-primary/10' : 'border-transparent bg-muted')}>
                            <Landmark className="h-6 w-6 mb-1"/>
                            <span className="text-sm font-medium">Pix</span>
                        </button>
                        <button onClick={() => setPaymentMethod('cash')} className={cn("flex flex-col items-center justify-center p-2 rounded-lg border-2", paymentMethod === 'cash' ? 'border-primary bg-primary/10' : 'border-transparent bg-muted')}>
                            <CircleDollarSign className="h-6 w-6 mb-1"/>
                            <span className="text-sm font-medium">Dinheiro</span>
                        </button>
                        <button onClick={() => setPaymentMethod('card_machine')} className={cn("flex flex-col items-center justify-center p-2 rounded-lg border-2", paymentMethod === 'card_machine' ? 'border-primary bg-primary/10' : 'border-transparent bg-muted')}>
                            <CreditCard className="h-6 w-6 mb-1"/>
                            <span className="text-sm font-medium">Máquina</span>
                        </button>
                    </div>
                  </div>
                  <Button className="w-full h-12 text-lg">Confirmar Corrida</Button>
                </div>
              ) : (
                // Search form view
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Para onde vamos?</h2>
                  <form onSubmit={handleSearchRide} className="space-y-4">
                    <div className="relative flex items-center">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="pickup"
                        placeholder="Local de embarque"
                        className="pl-10 h-12 text-base border-0 bg-muted focus-visible:ring-1 focus-visible:ring-ring"
                        defaultValue="Minha localização atual"
                        disabled
                      />
                    </div>
                    <div className="relative flex items-center">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="destination"
                        placeholder="Seu destino"
                        className="pl-10 h-12 text-base"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Select onValueChange={(value: RideCategory) => setRideCategory(value)} defaultValue={rideCategory}>
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="Categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="x">
                                        <div className="flex items-center gap-2">
                                            <Car className="h-4 w-4" />
                                            <span>Corrida X</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="confort">
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4" />
                                            <span>Corrida Confort</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="h-12 text-lg" disabled={isSearching}>
                            {isSearching ? <Loader2 className="animate-spin" /> : "Buscar"}
                        </Button>
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 'activity':
        return (
          <Card className="shadow-2xl rounded-2xl max-h-[70vh] overflow-y-auto">
             <CardHeader>
                <CardTitle className="text-xl">Histórico de Corridas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rideHistory.map((ride) => (
                  <div key={ride.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                     <div className={cn("p-2 rounded-full", ride.category === 'x' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary')}>
                        {ride.category === 'x' ? <Car className="h-6 w-6"/> : <Star className="h-6 w-6"/>}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{ride.destination}</p>
                      <p className="text-sm text-muted-foreground">{ride.date}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-primary">R${ride.price.toFixed(2)}</p>
                       <Badge variant={ride.status === 'Concluída' ? 'secondary' : 'destructive'} className="mt-1">{ride.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
        case 'account':
        return (
           <Card className="shadow-2xl rounded-2xl max-h-[70vh] overflow-y-auto">
             <CardContent className="p-4">
               <div className="flex flex-col items-center text-center pb-6 border-b">
                  <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20">
                    <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={`@${user.name}`} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  <Badge variant="outline" className="mt-2 text-base">4.8 <Star className="ml-1 h-4 w-4 text-accent" fill="hsl(var(--accent))"/></Badge>
               </div>
               <div className="space-y-2 pt-6">
                  <button className="flex items-center w-full p-3 rounded-lg text-left text-lg hover:bg-muted">
                    <Edit className="h-5 w-5 mr-4 text-primary"/>
                    <span>Editar Perfil</span>
                    <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground"/>
                  </button>
                  <button className="flex items-center w-full p-3 rounded-lg text-left text-lg hover:bg-muted">
                    <Receipt className="h-5 w-5 mr-4 text-primary"/>
                    <span>Pagamento</span>
                    <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground"/>
                  </button>
                  <div className="flex items-center w-full p-3 rounded-lg text-left text-lg hover:bg-muted">
                    <Bell className="h-5 w-5 mr-4 text-primary"/>
                    <div className="flex-1">
                      <p>Notificações</p>
                      <p className="text-sm text-muted-foreground">Receber alertas de viagens e promoções</p>
                    </div>
                    <Switch defaultChecked/>
                  </div>
                  <button className="flex items-center w-full p-3 rounded-lg text-left text-lg hover:bg-muted">
                    <Globe className="h-5 w-5 mr-4 text-primary"/>
                    <span>Idioma Preferido</span>
                    <span className="ml-auto text-sm text-muted-foreground">Português</span>
                    <ChevronRight className="h-5 w-5 ml-2 text-muted-foreground"/>
                  </button>
                  <Separator className="my-2"/>
                  <button onClick={logout} className="flex items-center w-full p-3 rounded-lg text-left text-lg text-destructive hover:bg-destructive/10">
                    <LogOut className="h-5 w-5 mr-4"/>
                    <span>Sair</span>
                  </button>
               </div>
             </CardContent>
          </Card>
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className={cn("absolute inset-0 h-full w-full z-0", activeView !== 'home' && 'opacity-20 blur-sm')}>
        <Map />
      </div>

      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-background shadow-md">
            <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={`@${user.name}`} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </div>
      </header>
      
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 space-y-2">
        {renderContent()}
         <Card className="rounded-2xl">
          <CardContent className="p-2">
            <nav className="grid grid-cols-3 gap-2">
                <Button variant="ghost" onClick={() => setActiveView('home')} className={cn("flex flex-col h-auto items-center justify-center p-2 rounded-lg", activeView === 'home' ? 'text-primary' : 'text-muted-foreground')}>
                    <Home className="h-6 w-6 mb-1"/>
                    <span className="text-xs font-medium">Início</span>
                </Button>
                <Button variant="ghost" onClick={() => setActiveView('activity')} className={cn("flex flex-col h-auto items-center justify-center p-2 rounded-lg", activeView === 'activity' ? 'text-primary' : 'text-muted-foreground')}>
                    <Activity className="h-6 w-6 mb-1"/>
                    <span className="text-xs font-medium">Atividade</span>
                </Button>
                <Button variant="ghost" onClick={() => setActiveView('account')} className={cn("flex flex-col h-auto items-center justify-center p-2 rounded-lg", activeView === 'account' ? 'text-primary' : 'text-muted-foreground')}>
                    <User className="h-6 w-6 mb-1"/>
                    <span className="text-xs font-medium">Conta</span>
                </Button>
            </nav>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(PassengerMobileDashboard, ["passenger"]);

    