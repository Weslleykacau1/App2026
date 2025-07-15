
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { withAuth } from "@/components/with-auth";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, ArrowRight, Wallet, Coins, Landmark, LocateFixed, Menu, Loader2, Star, X, ShieldCheck, Search, Pencil, Settings2, Car, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "@/components/map";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import type { MapRef, LngLatLike } from "react-map-gl";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from "@/components/ui/popover";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { setItem, getItem, removeItem } from "@/lib/storage";


type RideCategory = "viagem" | "moto" | "executive";

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

const RIDE_REQUEST_KEY = 'pending_ride_request';
const RERIDE_REQUEST_KEY = 'reride_request';


function RequestRidePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [rideCategory, setRideCategory] = useState<RideCategory>("viagem");
  
  const mapRef = useRef<MapRef>(null);
  
  const [pickupInput, setPickupInput] = useState("Procurando você no mapa...");
  const [destinationInput, setDestinationInput] = useState("");
  const [fareOffer, setFareOffer] = useState("");
  
  const [pickupSuggestions, setPickupSuggestions] = useState<Suggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Suggestion[]>([]);
  
  const [isPickupSuggestionsOpen, setIsPickupSuggestionsOpen] = useState(false);
  const [isDestinationSuggestionsOpen, setIsDestinationSuggestionsOpen] = useState(false);

  const [selectedPickup, setSelectedPickup] = useState<Suggestion | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Suggestion | null>(null);
  const [route, setRoute] = useState<LngLatLike[] | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [foundDriver, setFoundDriver] = useState<FoundDriver | null>(null);
  const { toast } = useToast();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const geocodeAddress = useCallback(async (address: string): Promise<Suggestion | null> => {
    if (!mapboxToken) return null;
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}&limit=1&country=BR&language=pt`);
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0];
    }
    return null;
  }, [mapboxToken]);

  useEffect(() => {
    const handleRerideRequest = async () => {
      const rerideRequest = getItem<{ pickup: string, destination: string }>(RERIDE_REQUEST_KEY);
      if (rerideRequest) {
        removeItem(RERIDE_REQUEST_KEY); 
        
        setPickupInput(rerideRequest.pickup);
        setDestinationInput(rerideRequest.destination);

        const pickupSuggestion = await geocodeAddress(rerideRequest.pickup);
        if (pickupSuggestion) setSelectedPickup(pickupSuggestion);

        const destinationSuggestion = await geocodeAddress(rerideRequest.destination);
        if (destinationSuggestion) setSelectedDestination(destinationSuggestion);
      }
    };
    
    handleRerideRequest();

    const pendingRequest = getItem(RIDE_REQUEST_KEY);
    if(pendingRequest) {
      setIsSearching(true);
    }
  }, [geocodeAddress]);

  useEffect(() => {
    const rerideRequest = getItem(RERIDE_REQUEST_KEY);
    if (rerideRequest) return;

    if (mapboxToken) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { longitude, latitude } = position.coords;
          handleLocateUser(true);
          const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&limit=1&language=pt`);
          const data = await response.json();
          if (data.features.length > 0) {
            const currentLocationSuggestion: Suggestion = data.features[0];
            setPickupInput(currentLocationSuggestion.place_name);
            setSelectedPickup(currentLocationSuggestion);
          } else {
            setPickupInput("Localização atual");
          }
        });
    }
  }, [mapboxToken]);

  const debounce = (func: Function, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const fetchSuggestions = async (query: string, type: 'pickup' | 'destination') => {
    if (query.length < 3 || !mapboxToken) {
      if (type === 'pickup') setPickupSuggestions([]);
      else setDestinationSuggestions([]);
      return;
    }
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&autocomplete=true&country=BR&language=pt&proximity=-38.5267,-3.7327`);
    const data = await response.json();
    if (type === 'pickup') {
      setPickupSuggestions(data.features);
      setIsPickupSuggestionsOpen(data.features.length > 0);
    } else {
      setDestinationSuggestions(data.features);
      setIsDestinationSuggestionsOpen(data.features.length > 0);
    }
  };
  
  const debouncedFetchPickupSuggestions = useCallback(debounce((query: string) => fetchSuggestions(query, 'pickup'), 300), [mapboxToken]);
  const debouncedFetchDestinationSuggestions = useCallback(debounce((query: string) => fetchSuggestions(query, 'destination'), 300), [mapboxToken]);

  const handlePickupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPickupInput(value);
    setSelectedPickup(null);
    setRoute(null);
    debouncedFetchPickupSuggestions(value);
  };
  
  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestinationInput(value);
    setSelectedDestination(null);
    setRoute(null);
    debouncedFetchDestinationSuggestions(value);
  };

  const handleSelectSuggestion = (suggestion: Suggestion, type: 'pickup' | 'destination') => {
    if (type === 'pickup') {
      setPickupInput(suggestion.place_name);
      setSelectedPickup(suggestion);
      setPickupSuggestions([]);
      setIsPickupSuggestionsOpen(false);
      mapRef.current?.flyTo({ center: suggestion.center as LngLatLike, zoom: 15 });
    } else {
      setDestinationInput(suggestion.place_name);
      setSelectedDestination(suggestion);
      setDestinationSuggestions([]);
      setIsDestinationSuggestionsOpen(false);
      mapRef.current?.flyTo({ center: suggestion.center as LngLatLike, zoom: 15 });
    }
  };

  useEffect(() => {
    const calculateRoute = async () => {
      if (selectedPickup && selectedDestination && mapboxToken) {
        const coords = `${selectedPickup.center[0]},${selectedPickup.center[1]};${selectedDestination.center[0]},${selectedDestination.center[1]}`;
        const routeResponse = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?access_token=${mapboxToken}&geometries=geojson&language=pt`);
        const routeData = await routeResponse.json();

        if (routeData.routes && routeData.routes.length > 0) {
            const currentRoute = routeData.routes[0];
            const routeGeom = currentRoute.geometry.coordinates;
            setRoute(routeGeom);
            
            if(mapRef.current) {
                mapRef.current.fitBounds([selectedPickup.center as LngLatLike, selectedDestination.center as LngLatLike], { padding: 80, duration: 1000 });
            }
        }
      } else {
        setRoute(null);
      }
    }
    calculateRoute();
  }, [selectedPickup, selectedDestination, mapboxToken]);

  if (!user) return null;

  const handleLocateUser = (initial: boolean = false) => {
    navigator.geolocation.getCurrentPosition((position) => {
        const { longitude, latitude } = position.coords;
        if(mapRef.current) {
            mapRef.current.flyTo({
                center: [longitude, latitude],
                zoom: 15,
                essential: true,
            });
        }
    });
  };

  const handleConfirmRide = () => {
    if (!selectedDestination || !selectedPickup || !user) {
        toast({
            variant: "destructive",
            title: "Campos obrigatórios",
            description: "Por favor, preencha o destino e a tarifa.",
        });
        return;
    }
    
    const rideRequest = {
        fare: parseFloat(fareOffer) || 0,
        pickupAddress: selectedPickup.place_name,
        destination: destinationInput,
        tripDistance: 8.2, // Mock data
        tripTime: 22, // Mock data
        rideCategory: rideCategory,
        passenger: {
            name: user.name,
            avatarUrl: `https://placehold.co/80x80.png`,
            rating: 4.8
        },
        route: {
            pickup: { lat: selectedPickup.center[1], lng: selectedPickup.center[0] },
            destination: { lat: selectedDestination.center[1], lng: selectedDestination.center[0] },
            coordinates: route || []
        }
    };

    setItem(RIDE_REQUEST_KEY, rideRequest);
    setIsSearching(true);
    
    setTimeout(() => {
        setIsSearching(false);
        setFoundDriver({
            name: "Joana M.",
            avatarUrl: "https://placehold.co/80x80.png",
            rating: 4.9,
            vehicle: { model: "Honda Civic", licensePlate: "NQR-8A21" },
            eta: 5
        });
        toast({ title: "Motorista encontrado!", description: "Joana M. está a caminho." });
    }, 5000);
  };
  
   const handleCancelRide = () => {
        setFoundDriver(null);
        setSelectedDestination(null);
        setDestinationInput("");
        setFareOffer("");
        setRoute(null);
        toast({ title: "Corrida cancelada.", description: "Você pode solicitar uma nova corrida quando quiser." });
    };

  const handleCancelSearch = () => {
    setIsSearching(false);
    removeItem(RIDE_REQUEST_KEY);
  };

  const RideCategoryCard = ({ type, name, seats, icon, isSelected, onSelect }: { type: RideCategory, name: string, seats: number, icon: React.ReactNode, isSelected: boolean, onSelect: () => void }) => (
    <div 
        onClick={onSelect}
        className={cn(
            "p-3 rounded-lg cursor-pointer transition-all flex flex-col items-start gap-1 w-full",
            isSelected ? 'bg-primary/20' : 'bg-muted/50 hover:bg-muted'
        )}
    >
        {icon}
        <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-foreground">{name}</h3>
            <span className="text-xs text-muted-foreground">{seats}</span>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
       <div className="absolute inset-0 h-full w-full z-0">
         <Map mapRef={mapRef} showMovingCar={!!foundDriver} destination={selectedDestination?.center as LngLatLike | undefined} pickup={selectedPickup?.center as LngLatLike | undefined} route={route}/>
       </div>

      <header className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center pointer-events-none">
        <Button
            variant="default"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg pointer-events-auto bg-card text-card-foreground hover:bg-card/90"
            onClick={() => router.back()}
        >
            <ArrowLeft className="h-6 w-6" />
        </Button>
        <Button
            variant="default"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg pointer-events-auto bg-card text-card-foreground hover:bg-card/90"
            onClick={() => handleLocateUser()}
        >
            <LocateFixed className="h-5 w-5" />
        </Button>
      </header>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-2 space-y-2">
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
                             <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400" fill="currentColor"/>
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
            <Card className="shadow-2xl rounded-2xl bg-card">
                <CardContent className="p-2 space-y-3">
                    <Carousel opts={{ align: "start", slidesToScroll: 'auto' }} className="w-full">
                        <CarouselContent className="-ml-2">
                            <CarouselItem className="pl-2 basis-1/3">
                                <RideCategoryCard type="viagem" name="Viagem" seats={4} icon={<Car className="h-6 w-6" />} isSelected={rideCategory === 'viagem'} onSelect={() => setRideCategory('viagem')} />
                            </CarouselItem>
                            <CarouselItem className="pl-2 basis-1/3">
                                <RideCategoryCard type="moto" name="Moto" seats={1} icon={<svg className="h-6 w-6" viewBox="0 0 24 24"><path fill="currentColor" d="M18.5 2c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5S20.43 2 18.5 2m-13 7.5c0 .6.14 1.16.4 1.66l-2.04 2.05c-.63.63-.63 1.64 0 2.26l.13.13c.63.63 1.64.63 2.26 0l2.05-2.04c.5.26 1.06.4 1.66.4c1.93 0 3.5-1.57 3.5-3.5S7.43 8.5 5.5 8.5S2 10.07 2 12m10.89 1.45l2.83-2.83l-1.41-1.41l-2.83 2.83c-.32-.1-.66-.14-1-.14c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-.34-.04-.68-.14-1m7.61 2.55l-2.12-2.12l-2.83 2.83l2.12 2.12a2.5 2.5 0 0 0 2.83-2.83"/></svg>} isSelected={rideCategory === 'moto'} onSelect={() => setRideCategory('moto')} />
                            </CarouselItem>
                            <CarouselItem className="pl-2 basis-1/3">
                                <RideCategoryCard type="executive" name="Executive" seats={4} icon={<Car className="h-6 w-6" />} isSelected={rideCategory === 'executive'} onSelect={() => setRideCategory('executive')} />
                            </CarouselItem>
                        </CarouselContent>
                    </Carousel>
                   
                   <div className="space-y-2 px-1">
                        <Popover open={isPickupSuggestionsOpen} onOpenChange={setIsPickupSuggestionsOpen}>
                            <PopoverAnchor asChild>
                                <div className="relative flex items-center">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="pickup"
                                        placeholder="Local de embarque"
                                        className="pl-10 h-11 text-base bg-muted border-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={pickupInput}
                                        onChange={handlePickupChange}
                                        autoComplete="off"
                                    />
                                </div>
                            </PopoverAnchor>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1">
                                {pickupSuggestions.map((suggestion) => (
                                    <Button key={suggestion.id} variant="ghost" className="w-full justify-start text-left h-auto py-2 px-3 whitespace-normal" onClick={() => handleSelectSuggestion(suggestion, 'pickup')}>
                                    {suggestion.place_name}
                                    </Button>
                                ))}
                            </PopoverContent>
                        </Popover>
                        <Popover open={isDestinationSuggestionsOpen} onOpenChange={setIsDestinationSuggestionsOpen}>
                            <PopoverAnchor asChild>
                                <div className="relative flex items-center">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <Input
                                    id="destination"
                                    placeholder="Para"
                                    className="pl-10 h-11 text-base bg-muted border-none"
                                    required
                                    value={destinationInput}
                                    onChange={handleDestinationChange}
                                    autoComplete="off"
                                  />
                                </div>
                            </PopoverAnchor>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1">
                                {destinationSuggestions.map((suggestion) => (
                                    <Button key={suggestion.id} variant="ghost" className="w-full justify-start text-left h-auto py-2 px-3 whitespace-normal" onClick={() => handleSelectSuggestion(suggestion, 'destination')}>
                                    {suggestion.place_name}
                                    </Button>
                                ))}
                            </PopoverContent>
                        </Popover>
                         <div className="relative flex items-center">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">R$</span>
                            <Input
                                id="fare"
                                placeholder="Ofereça sua tarifa"
                                className="pl-10 h-11 text-base bg-muted border-none"
                                required
                                value={fareOffer}
                                onChange={(e) => setFareOffer(e.target.value)}
                                autoComplete="off"
                                type="number"
                            />
                            <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        </div>
                  </div>
                  
                  <div className="flex items-center gap-2 px-1">
                      <Button className="w-full h-12 text-base font-bold bg-[#cdfe05] text-black hover:bg-[#cdfe05]/90" disabled={!destinationInput || !fareOffer} onClick={handleConfirmRide}>
                        Encontre um motorista
                      </Button>
                      <Button variant="outline" size="icon" className="h-12 w-12 flex-shrink-0 bg-muted border-none">
                          <Settings2 />
                      </Button>
                  </div>

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
             <Button variant="outline" className="w-full" onClick={handleCancelSearch}>
                Cancelar Busca
             </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default withAuth(RequestRidePage, ["passenger"]);
