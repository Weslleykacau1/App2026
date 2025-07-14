
"use client";

import { useState, useRef, useEffect } from 'react';
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import MapGL, { Marker, GeolocateControl, MapRef } from 'react-map-gl';
import { useTheme } from 'next-themes';
import { Menu, Shield, Phone, BarChart2, LocateFixed, Eye, EyeOff } from "lucide-react";
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getItem, setItem } from '@/lib/storage';

const surgeZones = [
  { lat: -3.722, lng: -38.489, color: "bg-red-500/20 border-red-700/0" }, // Meireles
  { lat: -3.742, lng: -38.512, color: "bg-orange-400/20 border-orange-600/0" }, // Aldeota
  { lat: -3.768, lng: -38.484, color: "bg-red-500/20 border-red-700/0" }, // Praia do Futuro
  { lat: -3.731, lng: -38.541, color: "bg-yellow-400/20 border-yellow-600/0" }, // Centro
  { lat: -3.755, lng: -38.485, color: "bg-orange-400/20 border-orange-600/0" }, // Edson Queiroz
  { lat: -3.788, lng: -38.533, color: "bg-red-600/20 border-red-800/0" }, // Parquelândia
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
  const [showEarnings, setShowEarnings] = useState(true);

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

       const rideCheckInterval = setInterval(() => {
        const rideRequest = getItem(RIDE_REQUEST_KEY);
        if (rideRequest) {
            console.log("Found ride request, navigating...");
            router.push('/driver/accept-ride');
        }
      }, 3000); // Check for rides every 3 seconds

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
        pickupAddress: "Av. Bezerra de Menezes, 1850",
        destination: "Shopping Iguatemi Bosque",
        tripDistance: 8.2,
        tripTime: 22,
        rideCategory: 'Comfort',
        passenger: {
            name: "Passageiro Teste",
            avatarUrl: `https://placehold.co/80x80.png`,
            rating: 4.9
        },
        route: {
            pickup: { lat: -3.732, lng: -38.555 },
            destination: { lat: -3.755, lng: -38.484 },
            coordinates: [
                [-38.555, -3.732],
                [-38.550, -3.735],
                [-38.540, -3.740],
                [-38.520, -3.745],
                [-38.500, -3.750],
                [-38.484, -3.755]
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
                      <div className="relative flex items-center justify-center w-24 h-24">
                          <div className={cn("absolute w-full h-full rounded-full animate-pulse", zone.color)}></div>
                      </div>
                  </Marker>
              ))}
          </MapGL>

          <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-transparent z-20 pointer-events-none">
            <Button 
                variant="primary" 
                size="icon" 
                className="h-14 w-14 rounded-full shadow-lg pointer-events-auto" 
                onClick={() => router.push('/driver/profile')}
            >
                <Menu className="h-6 w-6 text-primary-foreground" />
            </Button>
            
            <div className="bg-background/80 backdrop-blur-sm rounded-xl py-2 px-4 shadow-lg pointer-events-auto flex items-center gap-2">
                 <p className="text-2xl font-bold">
                    {showEarnings ? formatCurrency(todayEarnings) : "R$ ****,**"}
                </p>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowEarnings(!showEarnings)}>
                    {showEarnings ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </Button>
            </div>

            <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-lg bg-background shadow-lg pointer-events-auto"
                onClick={handleLocateUser}
            >
                <LocateFixed className="h-5 w-5" />
            </Button>
          </header>

          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
              <div className="absolute bottom-24 right-4 z-10">
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" className="h-16 w-16 rounded-full shadow-2xl">
                              <Shield className="h-8 w-8" />
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
              </div>

              <div className="flex justify-between items-center bg-background/80 p-2 rounded-full shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-1">
                     <Button variant="ghost" className="rounded-full px-4" onClick={handleTestRide}>
                        Corrida Teste
                      </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                        <Label htmlFor="online-status" className={cn("font-semibold cursor-pointer", isOnline ? "text-primary" : "text-muted-foreground")}>
                            {isOnline ? 'Online' : 'Offline'}
                        </Label>
                        <Switch id="online-status" checked={isOnline} onCheckedChange={setIsOnline} />
                  </div>
                  
                  <div className="flex items-center gap-1">
                      <Button 
                        onClick={() => router.push('/driver/statistics')}
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-12 w-12"
                      >
                          <BarChart2 className="h-6 w-6"/>
                      </Button>
                  </div>
              </div>
          </div>
      </div>
  );
}

export default withAuth(DriverDashboard, ["driver"]);

    