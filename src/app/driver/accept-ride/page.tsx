
"use client";

import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import MapGL, { Marker, Polyline } from 'react-map-gl';
import { useTheme } from 'next-themes';
import { User, Star, X, Check, MapPin, Navigation } from "lucide-react";
import { useRouter } from 'next/navigation';

const rideData = {
  fare: 32.96,
  bonus: 11.00,
  passengerRating: 5.0,
  pickupDistance: 1.2,
  pickupTime: 5,
  pickupAddress: "Avenida Doutor Alcides de Araújo, Centro | Itararé | Vila São Jorge",
  tripDistance: 24.1,
  tripTime: 35,
  destination: "Praia Grande",
  rideCategory: "Corrida X",
  passenger: {
    name: "Ana P.",
    avatarUrl: "https://placehold.co/40x40.png"
  },
  route: {
    pickup: { lat: -23.555, lng: -46.635 },
    destination: { lat: -23.58, lng: -46.66 }
  }
};

const routeCoordinates = [
  [-46.635, -23.555],
  [-46.638, -23.558],
  [-46.645, -23.565],
  [-46.65, -23.57],
  [-46.66, -23.58]
];

function AcceptRidePage() {
  const { resolvedTheme } = useTheme();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const router = useRouter();

  const mapStyle = resolvedTheme === 'dark' 
    ? 'mapbox://styles/mapbox/dark-v11' 
    : 'mapbox://styles/mapbox/streets-v12';

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
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: rideData.route.pickup.lng,
          latitude: rideData.route.pickup.lat,
          zoom: 13
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        interactive={false}
      >
        <Marker longitude={rideData.route.pickup.lng} latitude={rideData.route.pickup.lat}>
            <MapPin className="text-primary h-8 w-8" fill="hsl(var(--primary))"/>
        </Marker>
         <Marker longitude={-46.6333} latitude={-23.5505} anchor="center">
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 22L12 18L21 22L12 2Z" fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth="1" strokeLinejoin="round"/>
                </svg>
            </div>
        </Marker>
        
        <Polyline coordinates={routeCoordinates} color="hsl(var(--foreground))" width={4} />

      </MapGL>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Card className="w-full max-w-md mx-auto rounded-2xl shadow-2xl">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-center">
                <Badge variant="secondary" className="gap-2 px-4 py-2 text-base">
                    <User className="h-5 w-5"/>
                    <span>{rideData.rideCategory}</span>
                </Badge>
            </div>

            <div className="text-center">
                <h2 className="text-4xl font-bold">R${rideData.fare.toFixed(2)}</h2>
                <p className="text-muted-foreground">+R$ {rideData.bonus.toFixed(2)} incluído</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                    <p className="font-semibold">{rideData.passengerRating.toFixed(2)}</p>
                    <Star className="h-4 w-4 text-accent" fill="hsl(var(--accent))" />
                </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-primary border-2 border-background mt-1"></div>
                  <div className="w-px h-12 bg-border my-1"></div>
                  <div className="w-4 h-4 rounded-full bg-foreground border-2 border-background"></div>
                </div>
                <div>
                  <p className="font-medium">{rideData.pickupTime} minutos ({rideData.pickupDistance} km) de distância</p>
                  <p className="text-sm text-muted-foreground">{rideData.pickupAddress}</p>
                  <div className="mt-2">
                    <p className="font-medium">Viagem de {rideData.tripTime} minutos ({rideData.tripDistance} km)</p>
                    <p className="text-sm text-muted-foreground">Destino: {rideData.destination}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />
            
            <div className="flex gap-4">
                <Button variant="outline" className="w-full h-14 text-lg" onClick={() => router.back()}>
                    <X className="mr-2 h-6 w-6"/>
                    Recusar
                </Button>
                <Button className="w-full h-14 text-lg" onClick={() => router.back()}>
                    <Check className="mr-2 h-6 w-6"/>
                    Aceitar
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(AcceptRidePage, ["driver"]);
