
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

interface RideData {
  fare: number;
  passenger: {
    name: string;
    avatarUrl: string;
    rating: number;
  };
  pickupAddress: string;
  destination: string;
  route: {
    driver: { lat: number; lng: number };
    pickup: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    coordinates: LngLatLike[];
  };
}

const mockDriverLocation = { lat: -3.7327, lng: -38.5267 };

function OnRidePage() {
  const { resolvedTheme } = useTheme();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const [rideData, setRideData] = useState<RideData | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('current_ride_data');
    if (data) {
        const parsedData: RideData = JSON.parse(data);
        // Add current driver location to the route for display
        parsedData.route.coordinates.unshift([mockDriverLocation.lng, mockDriverLocation.lat]);
        setRideData(parsedData);
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
          coordinates: rideData.route.coordinates
      }
  } : null;

  const mapStyle = resolvedTheme === 'dark' 
    ? 'mapbox://styles/mapbox/dark-v11' 
    : 'mapbox://styles/mapbox/streets-v12';

  const handleOpenWaze = () => {
    if (!rideData) return;
    const { lat, lng } = rideData.route.pickup;
    window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
  };

  const handleOpenGoogleMaps = () => {
    if (!rideData) return;
    const { lat, lng } = rideData.route.pickup;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const handleFinishRide = () => {
    if (!rideData) return;
    const currentEarnings = parseFloat(sessionStorage.getItem('today_earnings') || '0');
    const newEarnings = currentEarnings + rideData.fare;
    sessionStorage.setItem('today_earnings', newEarnings.toString());
    
    const currentRides = parseInt(sessionStorage.getItem('today_rides') || '0', 10);
    const newRides = currentRides + 1;
    sessionStorage.setItem('today_rides', newRides.toString());

    sessionStorage.removeItem('current_ride_data');
    router.push('/driver');
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
                    <Star className="h-4 w-4 text-yellow-400 fill-current"/>
                    <span>{rideData.passenger.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
                <MessageCircle />
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
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
              <p className="text-sm text-muted-foreground">Embarque em:</p>
              <p className="font-bold text-lg">{rideData.pickupAddress}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <Button onClick={handleOpenWaze} className="h-14 text-base bg-sky-500 hover:bg-sky-600 text-white">
                    <svg className="mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C16.97 2 21 6.03 21 11C21 14.54 18.9 17.65 15.93 19.13C15.54 19.33 15.1 19.01 15.14 18.57C15.22 17.75 15.5 15.82 15.5 15.82C15.5 15.82 14.2 16.14 13.56 15.2C13.06 14.48 13.03 13.59 13.03 13.19C13.03 12.11 13.88 11.23 14.96 11.23C16.08 11.23 16.5 12.08 16.5 12.79C16.5 13.72 15.83 14.86 14.99 14.86C13.91 14.86 13.11 13.83 13.11 12.63C13.11 11.25 14.15 10.05 15.54 10.05C17.39 10.05 18.53 11.45 18.53 13.24C18.53 14.65 17.82 16.12 16.51 16.71C16.11 16.91 15.86 17.41 15.96 17.81C16.11 18.33 16.43 19.23 16.53 19.56C16.73 20.24 17.46 20.67 18.19 20.4C20.02 19.51 21.5 17.67 21.5 15.5C21.5 8.02 15.98 2.5 8.5 2.5C4.24 2.5 0.5 6.24 0.5 10.5C0.5 13.53 2.11 16.15 4.58 17.47L4.5 17.42C4.85 17.21 5.25 17.43 5.17 17.83C5.03 18.51 4.5 20.81 4.5 20.81C4.41 21.21 4.88 21.5 5.2 21.28C6.18 20.53 8.55 18.66 8.55 18.66C8.55 18.66 10.06 19.11 10.87 18.25C11.51 17.58 11.45 16.79 11.45 16.32C11.45 15.22 12.3 14.33 13.38 14.33C14.51 14.33 14.92 15.19 14.92 15.9C14.92 16.83 14.25 17.97 13.42 17.97C12.33 17.97 11.53 16.94 11.53 15.74C11.53 14.36 12.57 13.16 13.96 13.16C15.81 13.16 16.95 14.56 16.95 16.35C16.95 17.76 16.24 19.23 14.93 19.82C14.53 20.02 14.28 20.52 14.38 20.92C14.48 21.24 14.73 22.04 14.81 22.28C14.98 22.84 15.65 23.11 16.15 22.8C18.67 21.46 20.5 18.91 20.5 16C20.5 13.16 18.53 10.78 15.82 9.68L16.27 7.22C16.35 6.82 15.96 6.55 15.6 6.7C14.36 7.21 13.25 7.5 12 7.5C9.24 7.5 6.5 6.26 6.5 4.5C6.5 3.37 7.63 2 9 2C10 2 10.86 2.68 10.86 3.5C10.86 4.32 10 5.5 8.5 5.5C7.61 5.5 7.15 4.88 7.15 4.5C7.15 4.02 7.72 3.29 9 3.29C9.88 3.29 11.19 4.03 11.19 5.5C11.19 6.63 10.15 7.5 9 7.5C8.15 7.5 7.25 7.01 6.85 6.5C6.19 5.68 6.86 4.29 9 4.29C10.74 4.29 12 5.68 12 7C12 8.74 9.5 10.5 6.5 10.5C3.37 10.5 1.04 8.78 1.04 6.5C1.04 4.22 3.34 2.5 6.5 2.5C9.63 2.5 12 4.22 12 6.5V7H12Z" fill="white"/>
                    </svg>
                    Navegar com Waze
                </Button>
                <Button onClick={handleOpenGoogleMaps} className="h-14 text-base bg-white hover:bg-gray-200 text-gray-800">
                     <svg className="mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.24 12.44L7.5 9.69L16.5 4.5L12.24 12.44Z" fill="#1A73E8"/>
                        <path d="M12.24 12.44L14.31 20.49L16.5 4.5L12.24 12.44Z" fill="#EA4335"/>
                        <path d="M12.24 12.44L7.5 9.69L9.57 15.21L12.24 12.44Z" fill="#FBBC05"/>
                        <path d="M12.24 12.44L9.57001 15.21L14.31 20.49C14.49 20.41 14.65 20.29 14.79 20.13L12.24 12.44Z" fill="#34A853"/>
                     </svg>
                    Usar o Maps
                </Button>
            </div>
            <Button onClick={handleFinishRide} variant="destructive" className="w-full h-12 text-base">
              Finalizar Corrida
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(OnRidePage, ["driver"]);
