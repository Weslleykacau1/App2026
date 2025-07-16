
"use client";

import { useEffect, useState, useRef } from "react";
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MapGL, { Marker, Source, Layer, LngLatLike, MapRef } from 'react-map-gl';
import type {LineLayer} from 'react-map-gl';
import { useTheme } from 'next-themes';
import { MapPin, MessageCircle, Phone, Flag, Star } from "lucide-react";
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { setItem, getItem, removeItem } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";


interface RideData {
  id: string; // Firestore document ID
  fare: number;
  passenger: {
    name: string;
    avatarUrl: string;
    rating: number;
    phone: string;
  };
  pickupAddress: string;
  destination: string;
  route: {
    pickup: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    coordinates: LngLatLike[];
  };
}

const mockDriverLocation = { lat: -3.7327, lng: -38.5267 };
const CURRENT_RIDE_KEY = 'current_ride_data';

type RidePhase = 'to_pickup' | 'to_destination';

function OnRidePage() {
  const { resolvedTheme } = useTheme();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const [rideData, setRideData] = useState<RideData | null>(null);
  const [ridePhase, setRidePhase] = useState<RidePhase>('to_pickup');
  const { toast } = useToast();

  useEffect(() => {
    const data = getItem<RideData>(CURRENT_RIDE_KEY);
    if (data) {
        // Add current driver location to the route for display
        data.route.coordinates.unshift([mockDriverLocation.lng, mockDriverLocation.lat]);
        setRideData(data);
    } else {
        router.push('/driver'); // No ride data, go back to dash
    }
  }, [router]);

  const routeLayer: LineLayer | null = rideData ? {
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
        'line-join': 'round',
        'line-cap': 'round'
    },
    paint: {
        'line-color': resolvedTheme === 'dark' ? '#FFFFFF' : '#000000',
        'line-width': 5
    }
  } : null;

  const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> | null = rideData ? {
      type: 'Feature',
      properties: {},
      geometry: {
          type: 'LineString',
          coordinates: ridePhase === 'to_pickup'
            ? [mockDriverLocation, rideData.route.pickup].map(p => [p.lng, p.lat]) as LngLatLike[]
            : rideData.route.coordinates
      }
  } : null;

  const mapStyle = resolvedTheme === 'dark' 
    ? 'mapbox://styles/mapbox/dark-v11' 
    : 'mapbox://styles/mapbox/streets-v12';

  const handleOpenWaze = () => {
    if (!rideData) return;
    const { lat, lng } = ridePhase === 'to_pickup' ? rideData.route.pickup : rideData.route.destination;
    window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
  };

  const handleOpenGoogleMaps = () => {
    if (!rideData) return;
    const { lat, lng } = ridePhase === 'to_pickup' ? rideData.route.pickup : rideData.route.destination;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };
  
  const handleOpenWhatsApp = () => {
    if (!rideData || !rideData.passenger.phone) return;
    const passengerPhone = rideData.passenger.phone;
    window.open(`https://wa.me/${passengerPhone}`, '_blank');
  };
  
  const handleOpenChat = () => {
    toast({
        title: "Em breve",
        description: "Funcionalidade de chat em desenvolvimento.",
    });
  };

  const handleStartRide = async () => {
    if (!rideData) return;

    try {
        const rideDocRef = doc(db, "rides", rideData.id);
        await updateDoc(rideDocRef, { status: 'arrived' });

        setRidePhase('to_destination');
        if (mapRef.current && rideData) {
            mapRef.current.fitBounds(
                [rideData.route.pickup, rideData.route.destination].map(p => [p.lng, p.lat]) as [LngLatLike, LngLatLike],
                { padding: 80, duration: 1000 }
            );
        }
        toast({
          title: "Viagem iniciada!",
          description: "Boa viagem até o destino final.",
        });
    } catch (error) {
        console.error("Error starting ride:", error);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível iniciar a corrida.' });
    }
  };

  const handleFinishRide = async () => {
    if (!rideData) return;
    try {
        const rideDocRef = doc(db, "rides", rideData.id);
        await updateDoc(rideDocRef, { status: 'finished' });

        const currentEarnings = parseFloat(sessionStorage.getItem('today_earnings') || '0');
        const newEarnings = currentEarnings + rideData.fare;
        sessionStorage.setItem('today_earnings', newEarnings.toString());
        
        const currentRides = parseInt(sessionStorage.getItem('today_rides') || '0', 10);
        const newRides = currentRides + 1;
        sessionStorage.setItem('today_rides', newRides.toString());

        setItem('ride_to_rate_data', rideData);
        removeItem(CURRENT_RIDE_KEY);
        router.push('/driver/rate-passenger');
    } catch (error) {
        console.error("Error finishing ride:", error);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível finalizar a corrida.' });
    }
  };

  if (!mapboxToken || !rideData) {
    return (
      <div className="w-full h-screen bg-muted flex items-center justify-center">
        <p className="text-muted-foreground text-center p-4">
          Carregando dados...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative">
      <MapGL
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: mockDriverLocation.lng,
          latitude: mockDriverLocation.lat,
          zoom: 13
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        interactive={true}
      >
        <Marker longitude={mockDriverLocation.lng} latitude={mockDriverLocation.lat} anchor="center">
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-lg">
                 <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 3L4 29L16 24L28 29L16 3Z" fill="hsl(var(--primary))"/>
                </svg>
            </div>
        </Marker>
        <Marker longitude={rideData.route.pickup.lng} latitude={rideData.route.pickup.lat}>
            <MapPin className="text-blue-500 h-10 w-10" fill="currentColor"/>
        </Marker>
        <Marker longitude={rideData.route.destination.lng} latitude={rideData.route.destination.lat}>
            <Flag className="text-green-500 h-10 w-10" fill="currentColor"/>
        </Marker>
        
        {routeGeoJSON && routeLayer && (
            <Source id="route" type="geojson" data={routeGeoJSON}>
                <Layer {...routeLayer} />
            </Source>
        )}
      </MapGL>

      <div className="absolute top-0 left-0 right-0 p-4 space-y-2">
        <Card className="shadow-lg rounded-2xl">
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={rideData.passenger.avatarUrl} data-ai-hint="person avatar" />
                <AvatarFallback>{rideData.passenger.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">{rideData.passenger.name}</p>
                <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-yellow-400" fill="currentColor"/>
                    <span>{rideData.passenger.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={handleOpenChat}>
                <MessageCircle />
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={handleOpenWhatsApp}>
                <Phone />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Card className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div>
              {ridePhase === 'to_pickup' ? (
                 <>
                    <p className="text-sm text-muted-foreground">Buscar passageiro em:</p>
                    <p className="font-bold text-lg">{rideData.pickupAddress}</p>
                 </>
              ) : (
                <>
                    <p className="text-sm text-muted-foreground">Destino Final:</p>
                    <p className="font-bold text-lg">{rideData.destination}</p>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
               <Button onClick={handleOpenWaze} className="h-14 text-base bg-sky-500 hover:bg-sky-600 text-white">
                    Waze
                </Button>
                <Button onClick={handleOpenGoogleMaps} className="h-14 text-base bg-white hover:bg-gray-200 text-gray-800">
                    Maps
                </Button>
            </div>
            {ridePhase === 'to_pickup' ? (
                <Button onClick={handleStartRide} className="w-full h-12 text-base">
                    Cheguei / Iniciar Corrida
                </Button>
            ) : (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full h-12 text-base">
                            Finalizar Corrida
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Recebimento</AlertDialogTitle>
                            <AlertDialogDescription>
                                Você recebeu o valor de <strong>{rideData.fare.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> do passageiro?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleFinishRide}>
                                Confirmar Recebimento
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(OnRidePage, ["driver"]);
