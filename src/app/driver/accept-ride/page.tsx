
"use client";

import { useEffect, useState, useRef } from "react";
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import MapGL, { Marker, Source, Layer, LngLatLike } from 'react-map-gl';
import type {LineLayer} from 'react-map-gl';
import { useTheme } from 'next-themes';
import { User, Star, X, Check, MapPin, Zap } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const rideData = {
  fare: 32.96,
  bonus: 11.00,
  passengerRating: 5.0,
  pickupDistance: 1.2,
  pickupTime: 5,
  pickupAddress: "Avenida Doutor Alcides de Araújo, Centro",
  tripDistance: 24.1,
  tripTime: 35,
  destination: "Praia Grande, Itararé",
  rideCategory: "Comfort",
  passenger: {
    name: "Ana P.",
    avatarUrl: "https://placehold.co/80x80.png"
  },
  route: {
    pickup: { lat: -23.555, lng: -46.635 },
    destination: { lat: -23.58, lng: -46.66 }
  }
};

const routeCoordinates: LngLatLike[] = [
  [-46.635, -23.555],
  [-46.638, -23.558],
  [-46.645, -23.565],
  [-46.65, -23.57],
  [-46.66, -23.58]
];

const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    properties: {},
    geometry: {
        type: 'LineString',
        coordinates: routeCoordinates
    }
};


function AcceptRidePage() {
  const { resolvedTheme } = useTheme();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(15);
  const audioRef = useRef<HTMLAudioElement>(null);

  const lineColor = resolvedTheme === 'dark' ? '#FFFFFF' : '#000000';

  const routeLayer: LineLayer = {
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
        'line-join': 'round',
        'line-cap': 'round'
    },
    paint: {
        'line-color': lineColor,
        'line-width': 4
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.log("A reprodução automática foi bloqueada pelo navegador:", error);
        // A interação do usuário é geralmente necessária para reproduzir áudio.
      });
    }

    return () => {
        if(audioRef.current) {
            audioRef.current.pause();
        }
    }
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      handleRejectRide();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, router]);

  const handleAcceptRide = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    router.push('/driver/on-ride');
  }

  const handleRejectRide = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    router.back();
  }


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
      <audio ref={audioRef} src="https://cdn.pixabay.com/audio/2022/03/15/audio_2c4102c9a2.mp3" preload="auto" loop />
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
        
        <Source id="route" type="geojson" data={routeGeoJSON}>
            <Layer {...routeLayer} />
        </Source>
      </MapGL>

        <div className="absolute top-4 right-4 z-10">
            <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm rounded-full h-12 w-12" onClick={handleRejectRide}>
                <X className="h-6 w-6"/>
            </Button>
        </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Card className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-4 bg-green-500 text-white relative">
             <Progress value={(timeLeft / 15) * 100} className="absolute top-0 left-0 w-full h-1 rounded-none [&>div]:bg-green-400" />
             <div className="flex justify-between items-center">
                <div>
                  <Badge variant="secondary" className="bg-green-600 text-white border-none">
                    <Zap className="h-4 w-4 mr-1.5"/>
                    Alta demanda
                  </Badge>
                  <h2 className="text-4xl font-bold mt-1">R${rideData.fare.toFixed(2)}</h2>
                </div>
                <div className="text-right">
                    <p className="font-semibold">{rideData.tripDistance} km</p>
                    <p className="text-sm opacity-90">{rideData.tripTime} min</p>
                </div>
             </div>
          </div>
          <div className="p-4 bg-gray-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-gray-600">
                    <AvatarImage src={rideData.passenger.avatarUrl} data-ai-hint="person avatar" />
                    <AvatarFallback>{rideData.passenger.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-lg font-bold">{rideData.passenger.name}</h3>
                    <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                        <p className="font-semibold">{rideData.passengerRating.toFixed(1)}</p>
                    </div>
                </div>
            </div>
            <Button size="lg" className="h-16 w-32 bg-primary hover:bg-primary/90 text-lg font-bold" onClick={handleAcceptRide}>
                Aceitar
            </Button>
          </div>
          <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-4 h-4 rounded-full bg-primary border-2 border-background"></div>
                  <div className="w-px h-6 bg-border my-1"></div>
                  <MapPin className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium">{rideData.pickupTime} min ({rideData.pickupDistance} km) · <span className="text-muted-foreground">{rideData.pickupAddress}</span></p>
                  <p className="font-medium mt-2">{rideData.destination}</p>
                </div>
              </div>
               <Badge variant="outline" className="gap-2">
                    <User className="h-4 w-4"/>
                    <span>{rideData.rideCategory}</span>
                </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(AcceptRidePage, ["driver"]);
