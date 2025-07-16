
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { withAuth } from "@/components/with-auth";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Wallet, LocateFixed, Menu, Loader2, Star, X, ShieldCheck, Search, Pencil, Settings2, Car, ArrowLeft, CreditCard, Landmark, ChevronDown, Users, Home, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "@/components/map";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import type { MapRef, LngLatLike } from "react-map-gl";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
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


type RideCategory = "comfort" | "executive";
type PaymentMethod = "Máquina de Cartão" | "PIX" | "Dinheiro";
type AddressType = 'home' | 'work';


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

const RIDE_REQUEST_KEY = 'passenger_current_ride';
const RERIDE_REQUEST_KEY = 'reride_request';
const ADMIN_FARES_KEY = 'admin_fares_data';


function RequestRidePage() {
  const { user, fetchUserProfile } = useAuth();
  const router = useRouter();
  const [rideCategory, setRideCategory] = useState<RideCategory>("comfort");
  
  const mapRef = useRef<MapRef>(null);
  
  const [pickupInput, setPickupInput] = useState("Procurando você no mapa...");
  const [destinationInput, setDestinationInput] = useState("");
  const [tripDistance, setTripDistance] = useState(0);
  const [farePerKm, setFarePerKm] = useState(0);

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
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Máquina de Cartão");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [currentRideId, setCurrentRideId] = useState<string | null>(null);
  const [rideStatus, setRideStatus] = useState<string | null>(null);
  const [fare, setFare] = useState(0);

  const [homeAddress, setHomeAddress] = useState<string | null>(null);
  const [workAddress, setWorkAddress] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressTypeToSet, setAddressTypeToSet] = useState<AddressType | null>(null);
  const [addressInput, setAddressInput] = useState("");


  useEffect(() => {
    // Listener for ride status updates
    if (currentRideId) {
      const unsubscribe = onSnapshot(doc(db, "rides", currentRideId), (docSnap) => {
        const rideData = docSnap.data();
        if (rideData) {
            setRideStatus(rideData.status);
            if (rideData.status === 'arrived') {
                toast({ title: "Seu motorista chegou!", description: "Estamos prontos para partir." });
            }
        }
        if (rideData && rideData.status === 'accepted' && !foundDriver) {
           const driverInfo: FoundDriver = {
                name: rideData.driverName || 'Motorista',
                avatarUrl: `https://placehold.co/80x80.png`,
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
        else if (rideData && rideData.status === 'finished') {
          // Ride finished, navigate to rating page
          const rideForRating = { 
              driverName: rideData.driverName, 
              driverAvatar: `https://placehold.co/80x80.png`,
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
    
    handleRerideRequest();

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
    if (rerideRequest || currentRideId) return;

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
            setTripDistance(distanceInKm);

            const adminFares = getItem<{ comfort: string, executive: string }>(ADMIN_FARES_KEY) || { comfort: '1.80', executive: '2.20' };
            const ratePerKm = rideCategory === 'comfort' ? parseFloat(adminFares.comfort) : parseFloat(adminFares.executive);
            setFarePerKm(ratePerKm);
            
            const baseFare = distanceInKm * ratePerKm;
            
            setFare(baseFare);
            
            if(mapRef.current) {
                mapRef.current.fitBounds([selectedPickup.center as LngLatLike, selectedDestination.center as LngLatLike], { padding: 80, duration: 1000 });
            }
        }
      } else {
        setRoute(null);
        setFare(0);
      }
    }
    calculateRoute();
  }, [selectedPickup, selectedDestination, mapboxToken, rideCategory]);

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
    
  const paymentIcons: { [key in PaymentMethod]: React.ReactNode } = {
        "Máquina de Cartão": <CreditCard className="h-5 w-5"/>,
        "PIX": <Landmark className="h-5 w-5"/>,
        "Dinheiro": <Wallet className="h-5 w-5"/>
    }

    const handleConfirmRequest = async () => {
        if (!selectedPickup || !selectedDestination || !user) return;
        
        setIsRequesting(true);

        const finalFare = fare;

        try {
             const rideDocRef = await addDoc(collection(db, "rides"), {
                passengerId: user.id,
                passengerName: user.name,
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
                fare: finalFare,
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

  const handleSavedAddressClick = async (type: AddressType) => {
        const address = type === 'home' ? homeAddress : workAddress;
        if (address) {
            setDestinationInput(address);
            const suggestion = await geocodeAddress(address);
            if (suggestion) {
                handleSelectSuggestion(suggestion, 'destination');
            } else {
                toast({ variant: 'destructive', title: 'Endereço não encontrado', description: 'Não foi possível localizar este endereço no mapa.' });
            }
        } else {
            setAddressTypeToSet(type);
            setIsAddressModalOpen(true);
        }
    };

    const handleSaveAddress = async () => {
        if (!user || !addressTypeToSet || !addressInput) return;
        
        const fieldToUpdate = addressTypeToSet === 'home' ? 'homeAddress' : 'workAddress';
        try {
            const userDocRef = doc(db, "profiles", user.id);
            await updateDoc(userDocRef, { [fieldToUpdate]: addressInput });

            if (addressTypeToSet === 'home') setHomeAddress(addressInput);
            else setWorkAddress(addressInput);

            toast({ title: 'Endereço salvo!', description: `Seu endereço de ${addressTypeToSet === 'home' ? 'casa' : 'trabalho'} foi atualizado.` });
            setIsAddressModalOpen(false);
            setAddressInput("");
            setAddressTypeToSet(null);
        } catch (error) {
            console.error('Error saving address:', error);
            toast({ variant: 'destructive', title: 'Erro ao salvar', description: 'Não foi possível salvar o endereço.' });
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


  const RideCategoryCard = ({ type, name, seats, icon, isSelected, onSelect }: { type: RideCategory, name: string, seats: number, icon: React.ReactNode, isSelected: boolean, onSelect: () => void }) => (
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
         <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> {seats} lugares</p>
    </div>
  );
  
  const finalFare = fare;


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
                        <AlertDialogAction onClick={handleCancelRide} className="w-full bg-destructive hover:bg-destructive/90">Cancelar Busca</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
         ) : (
            <Card className="shadow-2xl rounded-2xl bg-card">
                <CardContent className="p-2 space-y-3">
                    <div className="grid grid-cols-2 gap-2 px-1">
                        <RideCategoryCard type="comfort" name="Comfort" seats={4} icon={<Car className="h-8 w-8 text-primary" />} isSelected={rideCategory === 'comfort'} onSelect={() => setRideCategory('comfort')} />
                        <RideCategoryCard type="executive" name="Executive" seats={4} icon={<Car className="h-8 w-8 text-secondary-foreground" />} isSelected={rideCategory === 'executive'} onSelect={() => setRideCategory('executive')} />
                   </div>
                    <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)} className="grid grid-cols-3 gap-2 px-1">
                        {(Object.keys(paymentIcons) as PaymentMethod[]).map((method) => (
                             <Label key={method} htmlFor={method} className={cn(
                                "flex flex-col items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-colors hover:bg-accent/50",
                                paymentMethod === method ? "border-primary bg-primary/10" : "border-transparent bg-muted"
                             )}>
                                <RadioGroupItem value={method} id={method} className="sr-only" />
                                {paymentIcons[method]}
                                <span className="text-xs font-semibold mt-1">{method}</span>
                             </Label>
                        ))}
                    </RadioGroup>
                   
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

                        <div className="flex gap-2">
                             <Button variant="ghost" className="flex-1 bg-muted h-14" onClick={() => handleSavedAddressClick('home')}>
                                <Home className="h-5 w-5 mr-2"/>
                                Casa
                            </Button>
                             <Button variant="ghost" className="flex-1 bg-muted h-14" onClick={() => handleSavedAddressClick('work')}>
                                <Briefcase className="h-5 w-5 mr-2"/>
                                Trabalho
                            </Button>
                        </div>


                        {fare > 0 && (
                            <div className="space-y-3 bg-muted p-3 rounded-lg animate-in fade-in-0 duration-300">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="fare" className="text-base font-bold">
                                        Tarifa: <span className="text-primary">{finalFare.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                    </Label>
                                    {farePerKm > 0 && (
                                         <span className="text-xs text-muted-foreground">
                                            {farePerKm.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/km
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                  </div>
                  
                  <div className="flex items-center gap-2 px-1">
                      <Button className="w-full h-12 text-base font-bold" variant="default" disabled={!destinationInput || fare <= 0 || isRequesting} onClick={handleConfirmRequest}>
                        {isRequesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Solicitar Corrida
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 flex-shrink-0 bg-muted border-none"
                        onClick={() => router.push('/passenger/profile')}
                       >
                          <Settings2 />
                      </Button>
                  </div>

                </CardContent>
              </Card>
          )}
      </div>

      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Salvar Endereço de {addressTypeToSet === 'home' ? 'Casa' : 'Trabalho'}</DialogTitle>
                    <DialogDescription>
                        Digite e salve seu endereço para acessá-lo rapidamente no futuro.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="address-input">Endereço Completo</Label>
                    <Input 
                        id="address-input" 
                        value={addressInput} 
                        onChange={(e) => setAddressInput(e.target.value)}
                        placeholder="Ex: Av. Paulista, 1000, São Paulo - SP"
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSaveAddress} disabled={!addressInput}>Salvar Endereço</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <BottomNavBar role="passenger" />
    </div>
  );
}

export default withAuth(RequestRidePage, ["passenger"]);
