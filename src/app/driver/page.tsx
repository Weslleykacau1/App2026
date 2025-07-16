
"use client";

import { useState, useRef, useEffect } from 'react';
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import MapGL, { Marker, GeolocateControl, MapRef } from 'react-map-gl';
import { useTheme } from 'next-themes';
import { Menu, Shield, Phone, LocateFixed, Eye, EyeOff, Radio, Bell, TestTube2, X, Filter } from "lucide-react";
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getItem, setItem } from '@/lib/storage';
import { AvailableRidesDrawer } from '@/components/available-rides-drawer';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { BottomNavBar } from '@/components/bottom-nav-bar';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

type PaymentMethod = "Máquina de Cartão" | "PIX" | "Dinheiro";

const surgeZones = [
  { lat: -3.742, lng: -38.512, price: 14 }, // Aldeota
  { lat: -3.755, lng: -38.495, price: 15 }, // Edson Queiroz
  { lat: -3.758, lng: -38.480, price: 14 }, // Praia do Futuro
  { lat: -3.731, lng: -38.541, price: 14 }, // Centro
];

const RIDE_REQUEST_KEY = 'pending_ride_request';
const DRIVER_ONLINE_STATUS_KEY = 'driver_online_status';
const NOTIFICATION_SOUND_URL = "https://cdn.pixabay.com/audio/2022/03/15/audio_2c4102c9a2.mp3";
const PAYMENT_PREFERENCES_KEY = 'driver_payment_preferences';


function DriverDashboard() {
  const { resolvedTheme } = useTheme();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [isOnline, setIsOnline] = useState(false);
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: -38.5267,
    latitude: -3.7327,
    zoom: 12
  });
  const [userLocation, setUserLocation] = useState<{longitude: number, latitude: number} | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayRides, setTodayRides] = useState(0);
  const [showEarnings, setShowEarnings] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pendingRidesCount, setPendingRidesCount] = useState(0);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialLoad = useRef(true);
  const [paymentPreferences, setPaymentPreferences] = useState<Record<PaymentMethod, boolean>>({
    'Máquina de Cartão': true,
    'PIX': true,
    'Dinheiro': true,
  });

  useEffect(() => {
    // Load payment preferences
    const savedPreferences = getItem<Record<PaymentMethod, boolean>>(PAYMENT_PREFERENCES_KEY);
    if (savedPreferences) {
        setPaymentPreferences(savedPreferences);
    }

     // Get initial location
     navigator.geolocation.getCurrentPosition(
        (position) => {
            const { longitude, latitude } = position.coords;
            const newLocation = { longitude, latitude };
            if (!userLocation) {
                 setViewState(prevState => ({ ...prevState, ...newLocation, zoom: 15 }));
            }
            setUserLocation(newLocation);
        },
        (error) => console.error("Error getting initial user location:", error),
        { enableHighAccuracy: true }
    );
    
    // Get earnings and online status from session storage
    const storedEarnings = parseFloat(sessionStorage.getItem('today_earnings') || '0');
    setTodayEarnings(storedEarnings);
    const storedRides = parseInt(sessionStorage.getItem('today_rides') || '0', 10);
    setTodayRides(storedRides);
    const storedOnlineStatus = sessionStorage.getItem(DRIVER_ONLINE_STATUS_KEY);
    if (storedOnlineStatus) {
        setIsOnline(JSON.parse(storedOnlineStatus));
    }
    
    const q = query(collection(db, "rides"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const newCount = querySnapshot.size;
        
        if (!isInitialLoad.current && newCount > pendingRidesCount) {
             notificationAudioRef.current?.play().catch(e => console.error("Error playing sound:", e));
        }

        setPendingRidesCount(newCount);
        isInitialLoad.current = false;
    });
    
    return () => unsubscribe();

   }, [pendingRidesCount]);
   
   const handleSetOnlineStatus = (status: boolean) => {
       setIsOnline(status);
       sessionStorage.setItem(DRIVER_ONLINE_STATUS_KEY, JSON.stringify(status));
   }


  useEffect(() => {
    if (isOnline) {
      // Start watching position when driver goes online
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation({ longitude, latitude });
        },
        (error) => {
          console.error("Error watching user location:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );

       // This logic is now handled by the drawer, but we can keep it as a fallback
       const rideCheckInterval = setInterval(() => {
        const rideRequest = getItem(RIDE_REQUEST_KEY);
        if (rideRequest) {
            console.log("Found ride request, navigating...");
            router.push('/driver/accept-ride');
        }
      }, 5000); 

      return () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }
        clearInterval(rideCheckInterval);
      }

    } else {
      // Stop watching when driver goes offline
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      // Cleanup the watch on component unmount
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isOnline, router]);

  const mapStyle = resolvedTheme === 'dark' 
    ? 'mapbox://styles/mapbox/dark-v11' 
    : 'mapbox://styles/mapbox/streets-v12';

  const handleLocateUser = () => {
    if (userLocation) {
        mapRef.current?.flyTo({
            center: [userLocation.longitude, userLocation.latitude],
            zoom: 15,
            essential: true,
        });
    }
  };

  const handleTestRide = () => {
      const testRideRequest = {
        fare: 25.50,
        pickupAddress: "Av. Beira Mar, 123, Fortaleza",
        destination: "Shopping Iguatemi Bosque",
        tripDistance: 8.2, 
        tripTime: 20,
        rideCategory: 'Comfort',
        passenger: {
            name: 'Passageiro Teste',
            avatarUrl: `https://placehold.co/80x80.png`,
            rating: 4.8,
            phone: '5511999999999'
        },
        route: {
            pickup: { lat: -3.722, lng: -38.50 },
            destination: { lat: -3.755, lng: -38.495 },
            coordinates: [
                [-38.5267, -3.7327],
                [-38.52, -3.735],
                [-38.51, -3.74],
                [-38.50, -3.745],
                [-38.495, -3.755]
            ]
        }
    };
    setItem(RIDE_REQUEST_KEY, testRideRequest);
    router.push('/driver/accept-ride');
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  
  const handlePaymentPreferenceChange = (method: PaymentMethod, checked: boolean) => {
      const newPreferences = { ...paymentPreferences, [method]: checked };
      setPaymentPreferences(newPreferences);
      setItem(PAYMENT_PREFERENCES_KEY, newPreferences);
  };


  if (!mapboxToken) {
    return (
      <div className="w-full h-screen bg-muted flex items-center justify-center">
        <p className="text-muted-foreground text-center p-4">
          O token do Mapbox não está configurado. Por favor, adicione-o às suas variáveis de ambiente.
        </p>
      </div>
    );
  }
  
  return (
      <div className="h-screen w-screen relative overflow-hidden flex flex-col">
          <audio ref={notificationAudioRef} src={NOTIFICATION_SOUND_URL} preload="auto" />
          <div className="flex-1 relative">
            <MapGL
                ref={mapRef}
                mapboxAccessToken={mapboxToken}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{width: '100%', height: '100%'}}
                mapStyle={mapStyle}
                padding={{ bottom: 200 }} 
            >
                <GeolocateControl position="top-left" trackUserLocation={true} showUserHeading={true} style={{ display: 'none' }} />
                {userLocation && (
                  <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} anchor="center">
                      <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-lg">
                         <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 2L3 22L12 18L21 22L12 2Z" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" strokeWidth="1" strokeLinejoin="round"/>
                              </svg>
                         </div>
                      </div>
                  </Marker>
                )}

                {surgeZones.map((zone, index) => (
                     <Marker key={index} longitude={zone.lng} latitude={zone.lat} anchor="center">
                          <div className="bg-destructive/80 text-white font-bold text-sm px-3 py-1.5 rounded-full shadow-lg border-2 border-background">
                              R${zone.price}
                          </div>
                     </Marker>
                ))}
            </MapGL>

            <header className="absolute top-0 left-0 right-0 p-4 z-20 pointer-events-none">
              <div className="w-full flex justify-center">
                <div className="bg-card/90 backdrop-blur-sm rounded-full py-2 px-4 shadow-lg pointer-events-auto flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <p className="text-xl font-bold">
                            {showEarnings ? formatCurrency(todayEarnings) : "R$ ****,**"}
                        </p>
                        <Button variant="ghost" size="icon" className="h-6 w-6 pointer-events-auto" onClick={() => setShowEarnings(!showEarnings)}>
                            {showEarnings ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </Button>
                    </div>
                    <div className="h-6 w-px bg-border"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">{todayRides}</span>
                    </div>
                </div>
              </div>

               <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto">
                    <Button
                        variant="default"
                        size="icon"
                        className="relative h-12 w-12 rounded-full bg-card/90 backdrop-blur-sm shadow-lg text-card-foreground hover:bg-card/90"
                        onClick={() => setIsDrawerOpen(true)}
                    >
                        <Bell className="h-6 w-6" />
                        {pendingRidesCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 animate-pulse">{pendingRidesCount}</Badge>
                        )}
                    </Button>
                     <Button
                        variant="default"
                        size="icon"
                        className="h-12 w-12 rounded-full bg-card/90 backdrop-blur-sm shadow-lg text-card-foreground hover:bg-card/90"
                        onClick={handleLocateUser}
                    >
                        <LocateFixed className="h-6 w-6" />
                    </Button>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="default" size="icon" className="h-12 w-12 rounded-full bg-card/90 backdrop-blur-sm shadow-lg text-card-foreground hover:bg-card/90">
                                <Filter className="h-6 w-6" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64" align="end">
                            <div className="space-y-4">
                               <div className="space-y-1">
                                    <h4 className="font-medium leading-none">Métodos de Pagamento</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Escolha os tipos de corrida que deseja receber.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    {(Object.keys(paymentPreferences) as PaymentMethod[]).map((method) => (
                                        <div key={method} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={method} 
                                                checked={paymentPreferences[method]}
                                                onCheckedChange={(checked) => handlePaymentPreferenceChange(method, !!checked)}
                                            />
                                            <Label htmlFor={method} className="cursor-pointer">{method}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                     </Popover>
               </div>
            </header>

            <div className="absolute bottom-24 right-4 z-10 space-y-4">
                 {isOnline ? (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                className="h-16 rounded-full px-6 text-base font-bold text-white transition-all duration-300 flex items-center shadow-2xl w-auto bg-green-500 hover:bg-green-600"
                            >
                               Online
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-xl">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Ficar offline?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Você não receberá novas solicitações de corrida enquanto estiver offline.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleSetOnlineStatus(false)}>
                                    Sim, ficar offline
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                     </AlertDialog>
                 ) : (
                    <Button
                        onClick={() => handleSetOnlineStatus(true)}
                        className={cn(
                            "h-16 rounded-full px-6 text-base font-bold transition-all duration-300 flex items-center shadow-2xl w-auto",
                            "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        )}
                    >
                       Offline
                    </Button>
                 )}
            </div>
            
             <div className="absolute bottom-24 left-4 z-10">
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="h-14 w-14 rounded-full shadow-2xl pointer-events-auto">
                            <Shield className="h-7 w-7" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Contato de Emergência</AlertDialogTitle>
                            <AlertDialogDescription>
                                Selecione o serviço de emergência que você deseja contatar. Esta ação abrirá o aplicativo de telefone do seu dispositivo.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                         <AlertDialogCancel asChild>
                            <Button variant="ghost" size="icon" className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                                <X className="h-4 w-4" />
                                <span className="sr-only">Fechar</span>
                            </Button>
                        </AlertDialogCancel>
                        <div className="grid grid-cols-1 gap-4 py-4">
                            <a href="tel:190" className="w-full">
                                <Button variant="destructive" className="w-full h-12 text-lg rounded-lg">
                                    <Phone className="mr-2 h-5 w-5" />
                                    Ligar para a Polícia (190)
                                </Button>
                            </a>
                                <a href="tel:192" className="w-full">
                                <Button variant="destructive" className="w-full h-12 text-lg rounded-lg">
                                    <Phone className="mr-2 h-5 w-5" />
                                    Ligar para o SAMU (192)
                                </Button>
                            </a>
                        </div>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
          </div>

          <AvailableRidesDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
          <BottomNavBar role="driver" />
      </div>
  );
}

export default withAuth(DriverDashboard, ["driver"]);

    
