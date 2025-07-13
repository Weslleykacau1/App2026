
"use client";

import { useState } from "react";
import { withAuth } from "@/components/with-auth";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Search, Car, ArrowLeft, Loader2, Star, User, Wallet, Landmark, CircleDollarSign, CreditCard, Activity, Home } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "@/components/map";
import { cn } from "@/lib/utils";

type RideCategory = "x" | "confort";
interface RideDetails {
  distance: number;
  price: number;
  category: RideCategory;
}
type PaymentMethod = "pix" | "cash" | "card_machine";

function PassengerMobileDashboard() {
  const { user } = useAuth();
  const [rideCategory, setRideCategory] = useState<RideCategory>("x");
  const [isSearching, setIsSearching] = useState(false);
  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");

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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 h-full w-full z-0">
        <Map />
      </div>

      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-background shadow-md">
            <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={`@${user.name}`} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-lg">{user.name.split(' ')[0]}</p>
            <div className="flex items-center gap-1 text-sm bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>4.9</span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 space-y-2">
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
         <Card className="rounded-2xl">
          <CardContent className="p-2">
            <nav className="grid grid-cols-3 gap-2">
                <Button variant="ghost" className="flex flex-col h-auto items-center justify-center p-2 rounded-lg text-primary">
                    <Home className="h-6 w-6 mb-1"/>
                    <span className="text-xs font-medium">Início</span>
                </Button>
                <Button variant="ghost" className="flex flex-col h-auto items-center justify-center p-2 rounded-lg text-muted-foreground">
                    <Activity className="h-6 w-6 mb-1"/>
                    <span className="text-xs font-medium">Atividade</span>
                </Button>
                <Button variant="ghost" className="flex flex-col h-auto items-center justify-center p-2 rounded-lg text-muted-foreground">
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
