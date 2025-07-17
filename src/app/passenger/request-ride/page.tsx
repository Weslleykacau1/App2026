
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { withAuth } from "@/components/with-auth";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Wallet, LocateFixed, Menu, Loader2, Star, X, ShieldCheck, Search, Pencil, Settings2, Car, ArrowLeft, CreditCard, Landmark, ChevronDown, Users, Home, Briefcase, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "@/components/map";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import type { MapRef, LngLatLike } from "react-map-gl";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from "@/components/ui/popover";
import { setItem, getItem, removeItem } from "@/lib/storage";
import { Label } from "@/components/ui/label";
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit, addDoc, serverTimestamp, doc, updateDoc, getDoc, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import { BottomNavBar } from "@/components/bottom-nav-bar";
import { viagemCarImage, executiveCarImage } from "@/lib/images";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";


type RideCategory = "comfort" | "executive";
type PaymentMethod = "Cartão" | "PIX" | "Dinheiro";
type AddressType = 'home' | 'work';


interface FoundDriver {
    id: string;
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

interface FareConfig {
    baseFare: number;
    costPerMinute: number;
    costPerKm: number;
    bookingFee: number;
}

interface AppFareConfig {
    comfort: FareConfig;
    executive: FareConfig;
}


const RIDE_REQUEST_KEY = 'passenger_current_ride';
const RERIDE_REQUEST_KEY = 'reride_request';
const ADMIN_FARES_CONFIG_KEY = 'admin_fares_config';
const PRESELECTED_DESTINATION_KEY = 'preselected_destination';
const SURGE_MULTIPLIER = 1.3;


const defaultFareConfig: AppFareConfig = {
    comfort: {
        baseFare: 3.50,
        costPerMinute: 0.45,
        costPerKm: 1.50,
        bookingFee: 2.00
    },
    executive: {
        baseFare: 2.50,
        costPerMinute: 0.30,
        costPerKm: 1.20,
        bookingFee: 2.00
    }
}


function RequestRidePage() {
  const { user, fetchUserProfile } = useAuth();
  const router = useRouter();
  const [rideCategory, setRideCategory] = useState<RideCategory>("comfort");
  
  const mapRef = useRef<MapRef>(null);
  
  const [pickupInput, setPickupInput] = useState("Procurando você no mapa...");
  const [destinationInput, setDestinationInput] = useState("");
  
  const [pickupSuggestions, setPickupSuggestions] = useState<Suggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Suggestion[]>([]);
  
  const [isPickupSuggestionsOpen, setIsPickupSuggestionsOpen] = useState(false);
  const [isDestinationSuggestionsOpen, setIsDestinationSuggestionsOpen] = useState(false);

  const [selectedPickup, setSelectedPickup] = useState<Suggestion | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Suggestion | null>(null);
  const [route, setRoute] = useState<LngLatLike[] | null>(null);
  
  const [isRequesting, setIsRequesting] = useState(false);
  const [foundDriver, setFoundDriver] = useState<FoundDriver | null>(null);
  const { toast } = useToast();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cartão");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [currentRideId, setCurrentRideId] = useState<string | null>(null);
  const [rideStatus, setRideStatus] = useState<string | null>(null);
  const [fare, setFare] = useState(0);
  const [isSurge, setIsSurge] = useState(false);


  const [homeAddress, setHomeAddress] = useState<string | null>(null);
  const [workAddress, setWorkAddress] = useState<string | null>(null);
  const [fareConfig, setFareConfig] = useState<AppFareConfig>(defaultFareConfig);


  useEffect(() => {
    // Load fares from admin config or use default
    const savedFares = getItem<AppFareConfig>(ADMIN_FARES_CONFIG_KEY);
    if (savedFares) {
        // Parse string values to numbers
        const parsedFares: AppFareConfig = {
            comfort: {
                baseFare: parseFloat(savedFares.comfort.baseFare as any) || defaultFareConfig.comfort.baseFare,
                costPerMinute: parseFloat(savedFares.comfort.costPerMinute as any) || defaultFareConfig.comfort.costPerMinute,
                costPerKm: parseFloat(savedFares.comfort.costPerKm as any) || defaultFareConfig.comfort.costPerKm,
                bookingFee: parseFloat(savedFares.comfort.bookingFee as any) || defaultFareConfig.comfort.bookingFee,
            },
            executive: {
                baseFare: parseFloat(savedFares.executive.baseFare as any) || defaultFareConfig.executive.baseFare,
                costPerMinute: parseFloat(savedFares.executive.costPerMinute as any) || defaultFareConfig.executive.costPerMinute,
                costPerKm: parseFloat(savedFares.executive.costPerKm as any) || defaultFareConfig.executive.costPerKm,
                bookingFee: parseFloat(savedFares.executive.bookingFee as any) || defaultFareConfig.executive.bookingFee,
            }
        };
        setFareConfig(parsedFares);
    } else {
        setFareConfig(defaultFareConfig);
    }

    // Listener for ride status updates
    if (currentRideId) {
      const unsubscribe = onSnapshot(doc(db, "rides", currentRideId), async (docSnap) => {
        const rideData = docSnap.data();
        if (rideData) {
            setRideStatus(rideData.status);
            if (rideData.status === 'arrived') {
                toast({ title: "Seu motorista chegou!", description: "Estamos prontos para partir." });
            }
        }
        if (rideData && rideData.status === 'accepted' && !foundDriver) {
           const driverProfileSnap = await getDoc(doc(db, 'profiles', rideData.driverId));
           const driverProfile = driverProfileSnap.data();

           const driverInfo: FoundDriver = {
                id: rideData.driverId,
                name: rideData.driverName || 'Motorista',
                avatarUrl: driverProfile?.photoUrl || '',
                rating: rideData.driverRating || 4.9,
                vehicle: {
                    model: rideData.driverVehicleModel || 'Veículo Padrão',
                    licensePlate: rideData.driverVehiclePlate || 'ABC-1234'
                },
                eta: Math.floor(Math.random() * 5) + 3,
            };
          setFoundDriver(driverInfo);
          setItem(RIDE_REQUEST_KEY, { rideId: currentRideId, driver: driverInfo });
          toast({ title: "Motorista encontrado!", description: `${driverInfo.name} está a caminho.` });
        }
        else if (rideData && rideData.status === 'completed') {
          // Ride finished, navigate to rating page
          const rideForRating = { 
              driverName: rideData.driverName, 
              driverAvatar: foundDriver?.avatarUrl || '',
              rideId: currentRideId
          };
          setItem('ride_to_rate_driver', rideForRating);
          removeItem(RIDE_REQUEST_KEY);
          router.push('/passenger/rate-driver');
        } else if (rideData?.status === 'cancelled') {
            toast({
                variant: 'destructive',
                title: 'Corrida Cancelada',
                description: 'Esta corrida foi cancelada.',
            });
            resetRideState();
        }
      });

      return () => unsubscribe();
    }
  }, [currentRideId, router, toast, foundDriver]);

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
    const loadUserData = async () => {
        if (!user) return;
        const userProfile = await fetchUserProfile(user);
        if (userProfile) {
            setHomeAddress(userProfile.homeAddress || null);
            setWorkAddress(userProfile.workAddress || null);
        }
    };
    loadUserData();
   }, [user, fetchUserProfile]);


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
    
    const handlePreselectedDestination = async () => {
        const preselectedDestination = getItem<string>(PRESELECTED_DESTINATION_KEY);
        if (preselectedDestination) {
            removeItem(PRESELECTED_DESTINATION_KEY);
            setDestinationInput(preselectedDestination);
            const destinationSuggestion = await geocodeAddress(preselectedDestination);
            if (destinationSuggestion) {
                setSelectedDestination(destinationSuggestion);
            }
        }
    };

    handleRerideRequest();
    handlePreselectedDestination();

    const pendingRequest = getItem<{rideId: string, driver?: FoundDriver}>(RIDE_REQUEST_KEY);
    if(pendingRequest) {
      setCurrentRideId(pendingRequest.rideId);
      if (pendingRequest.driver) {
        setFoundDriver(pendingRequest.driver);
      } else {
        setRideStatus("pending");
      }
    }
  }, [geocodeAddress]);

  useEffect(() => {
    const rerideRequest = getItem(RERIDE_REQUEST_KEY);
    const preselectedDest = getItem(PRESELECTED_DESTINATION_KEY);
    if (rerideRequest || currentRideId || preselectedDest) return;

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
        }, (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            toast({
              title: "Localização negada",
              description: "Para usar sua localização atual, permita o acesso à localização nas configurações do navegador.",
              variant: "default"
            });
          }
          setPickupInput("Digite seu local de embarque");
        });
    }
  }, [mapboxToken, currentRideId]);

  const debounce = (func: Function, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const fetchSuggestions = async (query: string, type: 'pickup' | 'destination') => {
    if (query.length < 10 || !mapboxToken) {
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
  
  const debouncedFetchPickupSuggestions = useCallback(debounce((query: string) => fetchSuggestions(query, 'pickup'), 300), []);
  const debouncedFetchDestinationSuggestions = useCallback(debounce((query: string) => fetchSuggestions(query, 'destination'), 300), []);

  const handlePickupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPickupInput(value);
    setSelectedPickup(null);
    setRoute(null);
    setFare(0);
    debouncedFetchPickupSuggestions(value);
  };
  
  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestinationInput(value);
    setSelectedDestination(null);
    setRoute(null);
    setFare(0);
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
            
            const distanceInKm = currentRoute.distance / 1000;
            const timeInMinutes = currentRoute.duration / 60;
            
            const categoryFares = fareConfig[rideCategory];

            // For demonstration, let's assume surge pricing is active if the destination is a "Shopping"
            const surgeActive = selectedDestination.place_name.toLowerCase().includes('shopping');
            setIsSurge(surgeActive);
            
            const baseFare = categoryFares.baseFare 
                              + (categoryFares.costPerMinute * timeInMinutes)
                              + (categoryFares.costPerKm * distanceInKm)
                              + categoryFares.bookingFee;

            const totalFare = surgeActive ? baseFare * SURGE_MULTIPLIER : baseFare;

            setFare(totalFare);
            
            if(mapRef.current) {
                mapRef.current.fitBounds([selectedPickup.center as LngLatLike, selectedDestination.center as LngLatLike], { padding: 80, duration: 1000 });
            }
        }
      } else {
        setRoute(null);
        setFare(0);
        setIsSurge(false);
      }
    }
    calculateRoute();
  }, [selectedPickup, selectedDestination, mapboxToken, rideCategory, fareConfig]);

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
    }, (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        toast({
          title: "Localização negada",
          description: "Para usar sua localização atual, permita o acesso à localização nas configurações do navegador.",
          variant: "default"
        });
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        toast({
          title: "Localização indisponível",
          description: "Não foi possível obter sua localização atual.",
          variant: "default"
        });
      }
    });
  };
    
  const paymentIcons: { [key in PaymentMethod]: React.ReactNode } = {
        "Cartão": <CreditCard className="h-5 w-5"/>,
        "PIX": <Landmark className="h-5 w-5"/>,
        "Dinheiro": <Wallet className="h-5 w-5" />
    }

    const handleConfirmRequest = async () => {
        if (!selectedPickup || !selectedDestination || !user) return;
        
        setIsRequesting(true);

        try {
             const rideDocRef = await addDoc(collection(db, "rides"), {
                passengerId: user.id,
                passengerName: user.name,
                passengerPhotoUrl: user.photoUrl || '',
                pickupAddress: selectedPickup.place_name,
                destinationAddress: selectedDestination.place_name,
                pickupCoords: {
                    lat: selectedPickup.center[1],
                    lng: selectedPickup.center[0]
                },
                destinationCoords: {
                    lat: selectedDestination.center[1],
                    lng: selectedDestination.center[0]
                },
                fare: fare,
                category: rideCategory,
                paymentMethod: paymentMethod,
                status: "pending",
                createdAt: serverTimestamp(),
            });
            
            setCurrentRideId(rideDocRef.id);
            setRideStatus("pending");
            setItem(RIDE_REQUEST_KEY, { rideId: rideDocRef.id });

            toast({
                title: "Solicitação Enviada!",
                description: "Buscando o melhor motorista para você.",
            });

        } catch (error) {
            console.error("Error creating ride request:", error);
            toast({
                variant: "destructive",
                title: "Erro ao solicitar corrida",
                description: "Não foi possível criar sua solicitação. Tente novamente.",
            });
        } finally {
            setIsRequesting(false);
        }
  };

    const resetRideState = () => {
        removeItem(RIDE_REQUEST_KEY);
        setCurrentRideId(null);
        setFoundDriver(null);
        setRoute(null);
        setDestinationInput("");
        setFare(0);
        setSelectedDestination(null);
        setRideStatus(null);
    }

    const handleCancelRide = async () => {
        if (!currentRideId) return;

        try {
            const rideDocRef = doc(db, "rides", currentRideId);
            await updateDoc(rideDocRef, { status: "cancelled" });
            toast({
                title: "Corrida Cancelada",
                description: "Sua corrida foi cancelada com sucesso.",
            });
            resetRideState();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro ao Cancelar",
                description: "Não foi possível cancelar a corrida. Tente novamente.",
            });
        }
    };


  const RideCategoryCard = ({ type, name, seats, description, icon, isSelected, onSelect }: { type: RideCategory, name: string, seats: number, description: string, icon: React.ReactNode, isSelected: boolean, onSelect: () => void }) => (
    <div 
        onClick={onSelect}
        className={cn(
            "p-3 rounded-lg cursor-pointer transition-all flex flex-col items-center justify-center gap-1 w-full border-2 text-center",
            isSelected ? 'bg-primary/20 border-primary' : 'bg-muted/50 border-transparent hover:bg-muted'
        )}
    >
        {icon}
        <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-foreground">{name}</h3>
        </div>
         <p className="text-xs text-muted-foreground flex items-center gap-1">{description}</p>
    </div>
  );
  
  const finalFare = fare;
  const firstName = user.name.split(' ')[0];


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
       <div className="absolute inset-0 h-full w-full z-0">
         <Map mapRef={mapRef} showMovingCar={!!foundDriver} destination={selectedDestination?.center as LngLatLike | undefined} pickup={selectedPickup?.center as LngLatLike | undefined} route={route}/>
       </div>

      <header className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-end items-center pointer-events-none">
        <Button
            variant="default"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg pointer-events-auto bg-card text-card-foreground hover:bg-card/90"
            onClick={() => handleLocateUser()}
        >
            <LocateFixed className="h-5 w-5" />
        </Button>
      </header>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-2 pb-24 space-y-2">
         {foundDriver ? (
             <Card className="shadow-2xl rounded-2xl">
                 <CardContent className="p-4 space-y-4">
                     <div className="flex items-center justify-between">
                         <p className="font-bold text-lg">Seu motorista está a caminho!</p>
                         <p className="font-bold text-lg text-primary">{foundDriver.eta} min</p>
                     </div>
                     <div className="flex items-center gap-4">
                         <Avatar className="h-16 w-16">
                            <AvatarImage src={foundDriver.avatarUrl || undefined} data-ai-hint="person avatar"/>
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
                      {rideStatus === "accepted" && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="w-full">Cancelar Corrida</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Tem certeza que deseja cancelar?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Não</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleCancelRide} className="bg-destructive hover:bg-destructive/90">Sim, cancelar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      )}
                 </CardContent>
             </Card>
         ) : rideStatus === 'pending' ? (
            <AlertDialog open={true}>
                <AlertDialogContent className="rounded-xl">
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
                        <AlertDialogAction onClick={handleCancelRide} className="w-full bg-destructive hover:bg-destructive/90">Cancelar Busca</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
         ) : (
            <>
                {!route && (
                    <div className="w-full px-4 mb-2">
                        <div className="bg-card/90 backdrop-blur-sm rounded-lg py-3 px-4 shadow-lg text-center">
                            <p className="text-lg font-medium text-card-foreground">Olá, {firstName}</p>
                        </div>
                    </div>
                 )}
                <Card className="shadow-2xl rounded-2xl bg-card">
                    <CardContent className="p-2 space-y-3">
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
                                        placeholder="Para onde vamos?"
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
                    </div>
                    <div className="grid grid-cols-2 gap-2 px-1">
                        <RideCategoryCard type="comfort" name="Comfort" seats={4} description="4 lugares, porta-malas maior" icon={<Car className="h-8 w-8 text-primary" />} isSelected={rideCategory === 'comfort'} onSelect={() => setRideCategory('comfort')} />
                        <RideCategoryCard type="executive" name="Executive" seats={4} description="4 lugares" icon={<Car className="h-8 w-8 text-green-600" />} isSelected={rideCategory === 'executive'} onSelect={() => setRideCategory('executive')} />
                    </div>
                    <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)} className="flex flex-col gap-2 px-1">
                        <Label htmlFor="Cartão" className={cn(
                            "flex items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-colors hover:bg-accent/50",
                            paymentMethod === 'Cartão' ? "border-primary bg-primary/10" : "border-transparent bg-muted"
                        )}>
                            <RadioGroupItem value="Cartão" id="Cartão" className="sr-only" />
                            <div className="flex items-center gap-2">
                                {paymentIcons['Cartão']}
                                <span className="font-semibold">Cartão</span>
                            </div>
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Label htmlFor="PIX" className={cn(
                                "flex items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-colors hover:bg-accent/50",
                                paymentMethod === 'PIX' ? "border-primary bg-primary/10" : "border-transparent bg-muted"
                            )}>
                                <RadioGroupItem value="PIX" id="PIX" className="sr-only" />
                                <div className="flex items-center gap-2">
                                    {paymentIcons['PIX']}
                                    <span className="font-semibold">PIX</span>
                                </div>
                            </Label>
                            <Label htmlFor="Dinheiro" className={cn(
                                "flex items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-colors hover:bg-accent/50",
                                paymentMethod === 'Dinheiro' ? "border-primary bg-primary/10" : "border-transparent bg-muted"
                            )}>
                                <RadioGroupItem value="Dinheiro" id="Dinheiro" className="sr-only" />
                                <div className="flex items-center gap-2">
                                    {paymentIcons['Dinheiro']}
                                    <span className="font-semibold">Dinheiro</span>
                                </div>
                            </Label>
                        </div>
                    </RadioGroup>
                    
                    <div className="flex items-center gap-2 px-1">
                        {fare > 0 && (
                            <div className="flex-1 bg-muted p-3 rounded-lg animate-in fade-in-0 duration-300">
                                <div className="flex items-center justify-between">
                                <Label htmlFor="fare" className="text-base font-bold">
                                    Tarifa: <span className="text-primary">{finalFare.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </Label>
                                {isSurge && (
                                    <Badge variant="destructive" className="gap-1">
                                        <Zap className="h-4 w-4"/>
                                        Alta Demanda
                                    </Badge>
                                )}
                                </div>
                            </div>
                        )}
                        <Button className="h-12 text-base font-bold flex-1" variant="default" disabled={!destinationInput || fare <= 0 || isRequesting} onClick={handleConfirmRequest}>
                            {isRequesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Solicitar
                        </Button>
                    </div>

                    </CardContent>
                </Card>
            </>
          )}
      </div>

        <BottomNavBar role="passenger" />
    </div>
  );
}

export default withAuth(RequestRidePage, ["passenger"]);

