
"use client";

import { useState } from 'react';
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import MapGL, { Marker } from 'react-map-gl';
import { useTheme } from 'next-themes';
import { Home, Search, Shield, BarChart2, Settings2 } from "lucide-react";

const surgeZones = [
  { lat: -23.555, lng: -46.635, color: "bg-red-500/30 border-red-700/0" },
  { lat: -23.545, lng: -46.645, color: "bg-orange-400/30 border-orange-600/0" },
  { lat: -23.56, lng: -46.65, color: "bg-red-500/30 border-red-700/0" },
  { lat: -23.55, lng: -46.62, color: "bg-yellow-400/30 border-yellow-600/0" },
  { lat: -23.565, lng: -46.63, color: "bg-orange-400/30 border-orange-600/0" },
  { lat: -23.54, lng: -46.625, color: "bg-red-600/30 border-red-800/0" },
];


function DriverDashboard() {
  const { resolvedTheme } = useTheme();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [isOnline, setIsOnline] = useState(false);

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
                longitude: -46.6333,
                latitude: -23.5505,
                zoom: 12
            }}
            style={{width: '100%', height: '100%'}}
            mapStyle={mapStyle}
        >
             <Marker longitude={-46.6333} latitude={-23.5505} anchor="center">
                 <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-lg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L3 22L12 18L21 22L12 2Z" fill="hsl(var(--foreground))" stroke="hsl(var(--background))" strokeWidth="1" strokeLinejoin="round"/>
                    </svg>
                 </div>
            </Marker>

             {surgeZones.map((zone, index) => (
                <Marker key={index} longitude={zone.lng} latitude={zone.lat} anchor="center">
                    <div className="relative flex items-center justify-center w-24 h-24">
                         <div className={cn("absolute w-full h-full rounded-full", zone.color)}></div>
                    </div>
                </Marker>
             ))}

        </MapGL>

        <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/20 to-transparent">
            <Button variant="outline" size="icon" className="rounded-full shadow-lg bg-background/80">
                <Home className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 bg-foreground text-background font-bold text-lg p-2 px-4 rounded-full shadow-lg">
                <span>R$</span>
                <span>0,00</span>
            </div>
            <Button variant="outline" size="icon" className="rounded-full shadow-lg bg-background/80">
                <Search className="h-5 w-5" />
            </Button>
        </header>

        <div className="absolute bottom-32 right-4 flex flex-col gap-3">
             <Button variant="outline" size="icon" className="rounded-full shadow-lg bg-background/80 w-12 h-12">
                <Shield className="h-6 w-6" />
            </Button>
             <Button variant="outline" size="icon" className="rounded-full shadow-lg bg-background/80 w-12 h-12">
                <BarChart2 className="h-6 w-6" />
            </Button>
        </div>


        <footer className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-center gap-4">
            <Button size="lg" className="h-20 w-20 rounded-full text-lg font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-2xl" onClick={() => setIsOnline(!isOnline)}>
                {isOnline ? 'Parar' : 'Iniciar'}
            </Button>
            <div className="flex items-center gap-3 text-lg font-medium">
                <Settings2 className="h-6 w-6"/>
                <p>Você está {isOnline ? <span className="font-bold text-primary">online</span> : <span className="font-bold">offline</span>}</p>
            </div>
        </footer>
      
    </div>
  );
}

export default withAuth(DriverDashboard, ["driver"]);
