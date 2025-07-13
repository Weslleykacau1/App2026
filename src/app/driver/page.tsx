
"use client";

import { useState } from 'react';
import { withAuth } from "@/components/with-auth";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, MapPin, Star, TrendingUp, Navigation, Menu, ShieldCheck, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Map } from "@/components/map";
import { cn } from '@/lib/utils';
import MapGL, { Marker, Popup } from 'react-map-gl';
import { useTheme } from 'next-themes';

const surgeZones = [
  { lat: -23.555, lng: -46.635, multiplier: "1.4-2.9x", color: "bg-red-500/50 border-red-700" },
  { lat: -23.545, lng: -46.645, multiplier: "1.2-1.8x", color: "bg-orange-400/50 border-orange-600" },
  { lat: -23.56, lng: -46.65, multiplier: "1.3-2.3x", color: "bg-red-500/50 border-red-700" },
  { lat: -23.55, lng: -46.62, multiplier: "1.1-1.7x", color: "bg-yellow-400/50 border-yellow-600" },
  { lat: -23.565, lng: -46.63, multiplier: "1.2-1.8x", color: "bg-orange-400/50 border-orange-600" },
  { lat: -23.54, lng: -46.625, multiplier: "3x", color: "bg-red-600/50 border-red-800" },
];


function DriverDashboard() {
    const { resolvedTheme } = useTheme();
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

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
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 22L12 18L21 22L12 2Z" fill="#1E90FF" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
            </Marker>

             {surgeZones.map((zone, index) => (
                <Marker key={index} longitude={zone.lng} latitude={zone.lat} anchor="center">
                    <div className="relative flex items-center justify-center w-20 h-20">
                         <div className={cn("absolute w-16 h-16 transform rotate-45", zone.color, "border-2")}></div>
                         <span className="relative text-white font-bold text-sm z-10">{zone.multiplier}</span>
                    </div>
                </Marker>
             ))}

        </MapGL>

        <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/30 to-transparent">
            <Button variant="outline" size="icon" className="rounded-full shadow-lg bg-background/80">
                <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 bg-background/80 p-2 rounded-full shadow-lg">
                <span className="font-bold text-lg">R$0,00</span>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
                 <Button variant="outline" size="icon" className="rounded-full shadow-lg bg-blue-500/80 text-white border-0">
                    <ShieldCheck className="h-5 w-5" />
                </Button>
            </div>
        </header>

        <footer className="absolute bottom-0 left-0 right-0 p-8 flex justify-center">
            <Button size="lg" className="h-14 px-12 text-lg font-bold bg-yellow-400 text-black hover:bg-yellow-500 shadow-2xl">
                Conectar
            </Button>
        </footer>
      
    </div>
  );
}

export default withAuth(DriverDashboard, ["driver"]);
