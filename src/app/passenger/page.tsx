
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { withAuth } from "@/components/with-auth";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, ArrowRight, Wallet, Coins, Landmark, LocateFixed, Menu, Loader2, Star, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "@/components/map";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import type { MapRef, LngLatLike } from "react-map-gl";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from "@/components/ui/popover";

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

interface Suggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

function PassengerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [rideCategory, setRideCategory] = useState<RideCategory>("comfort");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  
  const [comfortPrice, setComfortPrice] = useState(0);
  const [executivePrice, setExecutivePrice] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const mapRef = useRef<MapRef>(null);
  
  const [destinationInput, setDestinationInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Suggestion | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [foundDriver, setFoundDriver] = useState<FoundDriver | null>(null);
  const { toast } = useToast();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    handleLocateUser();
  }, []);

  const debounce = (func: Function, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };
  
  const fetchSuggestions = async (query: string) => {
    if (query.length < 3 || !mapboxToken) {
        setSuggestions([]);
        setIsSuggestionsOpen(false);
        return;
    }
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&autocomplete=true&country=BR&language=pt&proximity=-38.5267,-3.7327`);
    const data = await response.json();
    setSuggestions(data.features);
    setIsSuggestionsOpen(data.features.length > 0);
  };
  
  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), [mapboxToken]);

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestinationInput(value);
    setSelectedDestination(null); // Clear selected destination if user types again
    debouncedFetchSuggestions(value);
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setDestinationInput(suggestion.place_name);
    setSelectedDestination(suggestion);
    setSuggestions([]);
    setIsSuggestionsOpen(false);

    // Center map on selected destination
    mapRef.current?.flyTo({
      center: suggestion.center as LngLatLike,
      zoom: 15,
    });
    
    // Calculate price
    const distance = Math.random() * (30 - 1) + 1; // Random distance
    const comfortFare = distance * 1.80;
    const executiveFare = distance * 2.20;
    setComfortPrice(comfortFare);
    setExecutivePrice(executiveFare);
    setPromoApplied(true);
  };


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

  const handleConfirmRide = () => {
    if (!selectedDestination) return;
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
                licensePlate: "NQR-8A21"
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
        setSelectedDestination(null);
        setPromoApplied(false);
        setDestinationInput("");
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
         <Map mapRef={mapRef} showMovingCar={!!foundDriver} destination={selectedDestination?.center as LngLatLike | undefined} />
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
         {promoApplied && !foundDriver && selectedDestination && (
            <div className="bg-primary text-primary-foreground rounded-lg p-2 text-center text-sm font-medium flex items-center justify-center gap-2">
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
                    <Popover open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen}>
                        <PopoverAnchor asChild>
                            <div className="relative flex items-center">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                              <Input
                                id="destination"
                                placeholder="Digite seu endereço"
                                className="pl-10 h-12 text-base"
                                required
                                value={destinationInput}
                                onChange={handleDestinationChange}
                                autoComplete="off"
                              />
                            </div>
                        </PopoverAnchor>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1">
                            {suggestions.map((suggestion) => (
                                <Button
                                key={suggestion.id}
                                variant="ghost"
                                className="w-full justify-start text-left h-auto py-2 px-3 whitespace-normal"
                                onClick={() => handleSelectSuggestion(suggestion)}
                                >
                                {suggestion.place_name}
                                </Button>
                            ))}
                        </PopoverContent>
                    </Popover>
                  </div>
                  
                  {selectedDestination && (
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

                  <Button className="w-full h-14 text-lg justify-between font-bold" disabled={!selectedDestination} onClick={handleConfirmRide}>
                    <span>Confirmar Corrida</span>
                    <span>{formatCurrency(rideCategory === 'comfort' ? comfortPrice * 0.9 : executivePrice * 0.9)}</span>
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
