
"use client";

import { useState, useRef, useEffect } from "react";
import { withAuth } from "@/components/with-auth";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, ArrowRight, Wallet, Coins, Landmark, Car, User, Users, Check, LocateFixed, Menu, Loader2, Star, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "@/components/map";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import type { MapRef } from "react-map-gl";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


type RideCategory = "comfort" | "executive";
type PaymentMethod = "pix" | "cash" | "card_machine";

interface FoundDriver {
    name: string;
    avatarUrl: string;
    rating: number;
    vehicle: {
        model: string;
        licensePlate: string;
    };
    eta: number;
}

function PassengerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [rideCategory, setRideCategory] = useState<RideCategory>("comfort");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [showPrice, setShowPrice] = useState(false);
  const [comfortPrice, setComfortPrice] = useState(0);
  const [executivePrice, setExecutivePrice] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [foundDriver, setFoundDriver] = useState<FoundDriver | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    handleLocateUser();
  }, []);

  if (!user) return null;

  const handleLocateUser = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      mapRef.current?.flyTo({
        center: [position.coords.longitude, position.coords.latitude],
        zoom: 15,
        essential: true,
      });
    });
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 0) {
      // Simulate distance calculation
      const distance = Math.random() * (30 - 1) + 1; // Random distance between 1km and 30km
      
      // Calculate price based on distance
      const comfortFare = distance * 1.80;
      const executiveFare = distance * 2.20;

      setComfortPrice(comfortFare);
      setExecutivePrice(executiveFare);
      setShowPrice(true);
      setPromoApplied(true);
    } else {
      setShowPrice(false);
      setPromoApplied(false);
      setComfortPrice(0);
      setExecutivePrice(0);
    }
  };

  const handleConfirmRide = () => {
    if (!showPrice) return;
    setIsSearching(true);
    // Simulate finding a driver
    setTimeout(() => {
        setIsSearching(false);
        setFoundDriver({
            name: "Joana M.",
            avatarUrl: "https://placehold.co/80x80.png",
            rating: 4.9,
            vehicle: {
                model: "Honda Civic",
                licensePlate: "XYZ-1234"
            },
            eta: 5
        })
        toast({
            title: "Motorista encontrado!",
            description: "Joana M. está a caminho.",
        });
    }, 5000);
  };
  
   const handleCancelRide = () => {
        setFoundDriver(null);
        setShowPrice(false);
        setPromoApplied(false);
        const destinationInput = document.getElementById('destination') as HTMLInputElement;
        if(destinationInput) destinationInput.value = "";
        toast({
            title: "Corrida cancelada.",
            description: "Você pode solicitar uma nova corrida quando quiser.",
        });
    };


  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const RideOption = ({ type, name, time, seats, originalPrice, discountedPrice, isSelected, onSelect }: { type: RideCategory, name: string, time: number, seats: number, originalPrice: number, discountedPrice: number, isSelected: boolean, onSelect: () => void }) => (
    <div 
        onClick={onSelect}
        className={cn(
            "p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between gap-4",
            isSelected ? 'border-primary bg-primary/10' : 'border-transparent bg-muted/50 hover:border-primary/50'
        )}
    >
        <div className="flex items-center gap-4">
            <div>
                <h3 className="font-bold text-lg text-foreground">{name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{time} min</span>
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{seats}</span>
                    </div>
                </div>
            </div>
        </div>
        <div className="text-right">
            <p className="font-bold text-lg text-foreground">{formatCurrency(discountedPrice)}</p>
            <p className="text-sm text-muted-foreground line-through">{formatCurrency(originalPrice)}</p>
        </div>
    </div>
  );

  const PaymentOption = ({ method, icon, label, isSelected, onSelect }: { method: PaymentMethod, icon: React.ReactNode, label: string, isSelected: boolean, onSelect: () => void }) => (
    <div
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all h-24",
        isSelected ? 'border-primary bg-primary/10' : 'bg-muted hover:bg-muted/80'
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </div>
  );


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
       <div className="absolute inset-0 h-full w-full z-0">
         <Map mapRef={mapRef} showMovingCar={!!foundDriver} />
       </div>

      <header className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center pointer-events-none">
        <Button
            variant="primary"
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg pointer-events-auto"
            onClick={() => router.push('/passenger/profile')}
        >
            <Menu className="h-6 w-6 text-primary-foreground" />
        </Button>
        <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-lg bg-background shadow-lg pointer-events-auto"
            onClick={handleLocateUser}
        >
            <LocateFixed className="h-5 w-5" />
        </Button>
      </header>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 space-y-2">
         {promoApplied && !foundDriver && (
            <div className="bg-primary text-primary-foreground rounded-lg p-2 text-center text-sm font-medium flex items-center justify-center gap-2">
                <Check className="h-4 w-4"/>
                <span>10% de promoção aplicada</span>
            </div>
         )}
         
         {foundDriver ? (
             <Card className="shadow-2xl rounded-2xl">
                 <CardContent className="p-4 space-y-4">
                     <div className="flex items-center justify-between">
                         <p className="font-bold text-lg">Seu motorista está a caminho!</p>
                         <p className="font-bold text-lg text-primary">{foundDriver.eta} min</p>
                     </div>
                     <div className="flex items-center gap-4">
                         <Avatar className="h-16 w-16">
                            <AvatarImage src={foundDriver.avatarUrl} data-ai-hint="person avatar"/>
                            <AvatarFallback>{foundDriver.name.charAt(0)}</AvatarFallback>
                         </Avatar>
                         <div className="flex-1">
                             <h3 className="font-bold text-xl">{foundDriver.name}</h3>
                             <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="h-4 w-4" fill="currentColor"/>
                                <span className="font-semibold text-foreground">{foundDriver.rating.toFixed(1)}</span>
                             </div>
                         </div>
                         <div className="text-right">
                            <p className="font-bold">{foundDriver.vehicle.model}</p>
                            <p className="text-sm bg-muted px-2 py-1 rounded-md font-mono">{foundDriver.vehicle.licensePlate}</p>
                         </div>
                     </div>
                     <Button variant="destructive" className="w-full h-12" onClick={handleCancelRide}>
                         <X className="mr-2 h-4 w-4"/> Cancelar Corrida
                     </Button>
                 </CardContent>
             </Card>
         ) : (
            <Card className="shadow-2xl rounded-2xl">
                <CardContent className="p-4 space-y-4">
                   <div className="space-y-2">
                    <div className="relative flex items-center">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                      <Input
                        id="pickup"
                        placeholder="Local de embarque"
                        className="pl-10 h-12 text-base bg-muted focus-visible:ring-1 focus-visible:ring-ring"
                        defaultValue="Localização atual"
                      />
                    </div>
                    <div className="relative flex items-center">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                      <Input
                        id="destination"
                        placeholder="Digite seu endereço"
                        className="pl-10 h-12 text-base"
                        required
                        onChange={handleDestinationChange}
                      />
                    </div>
                  </div>
                  
                  {showPrice && (
                      <div className="space-y-2">
                          <RideOption 
                              type="comfort"
                              name="Comfort"
                              time={6}
                              seats={4}
                              originalPrice={comfortPrice}
                              discountedPrice={comfortPrice * 0.9}
                              isSelected={rideCategory === 'comfort'}
                              onSelect={() => setRideCategory('comfort')}
                          />
                          <RideOption 
                              type="executive"
                              name="Executive"
                              time={5}
                              seats={4}
                              originalPrice={executivePrice}
                              discountedPrice={executivePrice * 0.9}
                              isSelected={rideCategory === 'executive'}
                              onSelect={() => setRideCategory('executive')}
                          />
                      </div>
                  )}
                    
                  <div className="grid grid-cols-3 gap-2">
                    <PaymentOption
                      method="pix"
                      icon={<Wallet className="h-6 w-6 text-primary" />}
                      label="Pix"
                      isSelected={paymentMethod === 'pix'}
                      onSelect={() => setPaymentMethod('pix')}
                    />
                    <PaymentOption
                      method="cash"
                      icon={<Coins className="h-6 w-6 text-primary" />}
                      label="Dinheiro"
                      isSelected={paymentMethod === 'cash'}
                      onSelect={() => setPaymentMethod('cash')}
                    />
                    <PaymentOption
                      method="card_machine"
                      icon={<Landmark className="h-6 w-6 text-primary" />}
                      label="Cartão"
                      isSelected={paymentMethod === 'card_machine'}
                      onSelect={() => setPaymentMethod('card_machine')}
                    />
                  </div>

                  <Button className="w-full h-14 text-lg justify-between font-bold" disabled={!showPrice} onClick={handleConfirmRide}>
                    <span>Confirmar Corrida</span>
                    <ArrowRight className="h-5 w-5"/>
                  </Button>

                </CardContent>
              </Card>
          )}
      </div>

       <AlertDialog open={isSearching}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">Procurando por um motorista</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Aguarde enquanto encontramos o motorista mais próximo para você.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
          <AlertDialogFooter>
             <Button variant="outline" className="w-full" onClick={() => setIsSearching(false)}>
                Cancelar Busca
             </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

export default withAuth(PassengerDashboard, ["passenger"]);
