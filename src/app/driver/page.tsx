
"use client";

import { useState, useRef, useEffect } from 'react';
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import MapGL, { Marker, GeolocateControl, MapRef } from 'react-map-gl';
import { useTheme } from 'next-themes';
import { Menu, Shield, Phone, LocateFixed, Eye, EyeOff, Radio, Bell } from "lucide-react";
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getItem, setItem } from '@/lib/storage';
import { AvailableRidesDrawer } from '@/components/available-rides-drawer';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';


const surgeZones = [
  { lat: -3.742, lng: -38.512, price: 14 }, // Aldeota
  { lat: -3.755, lng: -38.495, price: 15 }, // Edson Queiroz
  { lat: -3.758, lng: -38.480, price: 14 }, // Praia do Futuro
  { lat: -3.731, lng: -38.541, price: 14 }, // Centro
];

const RIDE_REQUEST_KEY = 'pending_ride_request';


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


   useEffect(() => {
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
    
    // Get earnings from session storage
    const storedEarnings = parseFloat(sessionStorage.getItem('today_earnings') || '0');
    setTodayEarnings(storedEarnings);
    const storedRides = parseInt(sessionStorage.getItem('today_rides') || '0', 10);
    setTodayRides(storedRides);
    
    const q = query(collection(db, "rides"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setPendingRidesCount(querySnapshot.size);
    });
    
    return () => unsubscribe();

   }, []);


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
      <div className="h-screen w-screen relative">
          <MapGL
              ref={mapRef}
              mapboxAccessToken={mapboxToken}
              {...viewState}
              onMove={evt => setViewState(evt.viewState)}
              style={{width: '100%', height: '100%'}}
              mapStyle={mapStyle}
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
                            ${zone.price}
                        </div>
                   </Marker>
              ))}
          </MapGL>

          <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-transparent z-20 pointer-events-none">
            <Button 
                variant="default" 
                size="icon" 
                className="h-12 w-12 rounded-full shadow-lg pointer-events-auto bg-card text-card-foreground hover:bg-card/90"
                onClick={() => router.push('/driver/profile')}
            >
                <Menu className="h-6 w-6" />
            </Button>
            
            <div className="bg-card/90 backdrop-blur-sm rounded-full py-2 px-4 shadow-lg pointer-events-auto flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <p className="text-xl font-bold">
                        {showEarnings ? formatCurrency(todayEarnings) : "R$ ****,**"}
                    </p>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowEarnings(!showEarnings)}>
                        {showEarnings ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </Button>
                 </div>
                 <div className="h-6 w-px bg-border"></div>
                 <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">{todayRides}</span>
                    <span className="text-sm text-muted-foreground">corridas</span>
                 </div>
            </div>

            <Button
                variant="default"
                size="icon"
                className="relative h-12 w-12 rounded-full bg-card/90 backdrop-blur-sm shadow-lg pointer-events-auto text-card-foreground hover:bg-card/90"
                onClick={() => setIsDrawerOpen(true)}
            >
                <Bell className="h-6 w-6" />
                {pendingRidesCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 animate-pulse">{pendingRidesCount}</Badge>
                )}
            </Button>
          </header>

          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
                <div className="absolute bottom-[7rem] left-4 right-4 z-10 flex justify-between pointer-events-none">
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" className="h-14 w-14 rounded-full shadow-2xl pointer-events-auto">
                              <Shield className="h-7 w-7" />
                          </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Contato de Emergência</AlertDialogTitle>
                              <AlertDialogDescription>
                                  Selecione o serviço de emergência que você deseja contatar. Esta ação abrirá o aplicativo de telefone do seu dispositivo.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="grid grid-cols-1 gap-4 py-4">
                              <a href="tel:190" className="w-full">
                                  <Button variant="destructive" className="w-full h-12 text-lg">
                                      <Phone className="mr-2 h-5 w-5" />
                                      Ligar para a Polícia (190)
                                  </Button>
                              </a>
                               <a href="tel:192" className="w-full">
                                  <Button variant="destructive" className="w-full h-12 text-lg">
                                      <Phone className="mr-2 h-5 w-5" />
                                      Ligar para o SAMU (192)
                                  </Button>
                              </a>
                          </div>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                  <Button
                        variant="default"
                        size="icon"
                        className="h-14 w-14 rounded-full bg-card/90 backdrop-blur-sm shadow-lg pointer-events-auto text-card-foreground hover:bg-card/90"
                        onClick={handleLocateUser}
                    >
                        <LocateFixed className="h-6 w-6" />
                  </Button>
              </div>
              
               <div className="flex justify-center items-center gap-4">
                     <Button onClick={handleTestRide} variant="secondary" className="h-16 rounded-full px-8 text-lg font-bold transition-colors duration-300 shadow-2xl">
                        Corrida Teste
                    </Button>
                    <Button
                        onClick={() => setIsOnline(!isOnline)}
                        className={cn(
                            "h-16 rounded-full px-10 text-lg font-bold text-white transition-colors duration-300 flex items-center gap-3 shadow-2xl",
                            isOnline ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
                        )}
                    >
                         <Radio className="h-6 w-6 text-white" />
                        {isOnline ? "Ficar Offline" : "Ficar Online"}
                    </Button>
               </div>
          </div>
          <AvailableRidesDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
      </div>
  );
}

export default withAuth(DriverDashboard, ["driver"]);
