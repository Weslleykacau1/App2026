
"use client";

import { useEffect, useState, useRef } from "react";
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MapGL, { Marker, Source, Layer, LngLatLike, MapRef } from 'react-map-gl';
import type {LineLayer} from 'react-map-gl';
import { useTheme } from 'next-themes';
import { MapPin, MessageCircle, Phone, Navigation, Flag, Star } from "lucide-react";
import { useRouter } from 'next/navigation';

// Mock data, in a real app this would come from the accepted ride
const rideData = {
  fare: 28.50,
  passenger: {
    name: "Lúcia S.",
    avatarUrl: "https://placehold.co/80x80.png"
  },
  pickupAddress: "Av. Beira Mar, 3470, Meireles",
  destination: "Shopping Iguatemi, Edson Queiroz",
  route: {
    driver: { lat: -3.7327, lng: -38.5267 },
    pickup: { lat: -3.722, lng: -38.489 },
    destination: { lat: -3.755, lng: -38.485 }
  }
};

const routeToPickupCoordinates: LngLatLike[] = [
  [-38.5267, -3.7327], // Driver start
  [-38.510, -3.728],
  [-38.489, -3.722],  // Pickup
];

const routeToPickupGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    properties: {},
    geometry: {
        type: 'LineString',
        coordinates: routeToPickupCoordinates
    }
};

function OnRidePage() {
  const { resolvedTheme } = useTheme();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);

  const routeLayer: LineLayer = {
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
  };

  const mapStyle = resolvedTheme === 'dark' 
    ? 'mapbox://styles/mapbox/dark-v11' 
    : 'mapbox://styles/mapbox/streets-v12';

  const handleOpenWaze = () => {
    const { lat, lng } = rideData.route.pickup;
    window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
  };

  const handleOpenGoogleMaps = () => {
    const { lat, lng } = rideData.route.pickup;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const handleFinishRide = () => {
    const currentEarnings = parseFloat(sessionStorage.getItem('today_earnings') || '0');
    const newEarnings = currentEarnings + rideData.fare;
    sessionStorage.setItem('today_earnings', newEarnings.toString());
    
    const currentRides = parseInt(sessionStorage.getItem('today_rides') || '0', 10);
    const newRides = currentRides + 1;
    sessionStorage.setItem('today_rides', newRides.toString());

    router.push('/driver');
  };

  if (!mapboxToken) {
    return (
      <div className="w-full h-screen bg-muted flex items-center justify-center">
        <p className="text-muted-foreground text-center p-4">
          O token do Mapbox não está configurado.
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
          longitude: rideData.route.driver.lng,
          latitude: rideData.route.driver.lat,
          zoom: 13
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        interactive={true}
      >
        <Marker longitude={rideData.route.driver.lng} latitude={rideData.route.driver.lat} anchor="center">
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
        
        <Source id="route" type="geojson" data={routeToPickupGeoJSON}>
            <Layer {...routeLayer} />
        </Source>
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
                    <span>4.9</span>
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
               <Button onClick={handleOpenWaze} className="h-14 text-base bg-blue-500 hover:bg-blue-600">
                    <Navigation className="mr-2"/>
                    Navegar com Waze
                </Button>
                <Button onClick={handleOpenGoogleMaps} className="h-14 text-base bg-green-500 hover:bg-green-600">
                    <Navigation className="mr-2"/>
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
