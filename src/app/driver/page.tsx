
"use client";

import { useState, useMemo } from 'react';
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import MapGL, { Marker } from 'react-map-gl';
import { useTheme } from 'next-themes';
import { Menu, Shield, Pause, Play, MoreVertical, Phone } from "lucide-react";
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const surgeZones = [
  { lat: -23.555, lng: -46.635, color: "bg-red-500/20 border-red-700/0" },
  { lat: -23.545, lng: -46.645, color: "bg-orange-400/20 border-orange-600/0" },
  { lat: -23.56, lng: -46.65, color: "bg-red-500/20 border-red-700/0" },
  { lat: -23.55, lng: -46.62, color: "bg-yellow-400/20 border-yellow-600/0" },
  { lat: -23.565, lng: -46.63, color: "bg-orange-400/20 border-orange-600/0" },
  { lat: -23.54, lng: -46.625, color: "bg-red-600/20 border-red-800/0" },
];


function DriverDashboard() {
  const { resolvedTheme } = useTheme();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [isOnline, setIsOnline] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
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
                          <path d="M12 2L3 22L12 18L21 22L12 2Z" fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth="1" strokeLinejoin="round"/>
                      </svg>
                  </div>
              </Marker>

              {surgeZones.map((zone, index) => (
                  <Marker key={index} longitude={zone.lng} latitude={zone.lat} anchor="center">
                      <div className="relative flex items-center justify-center w-24 h-24">
                          <div className={cn("absolute w-full h-full rounded-full animate-pulse", zone.color)}></div>
                      </div>
                  </Marker>
              ))}
          </MapGL>

          <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/20 to-transparent">
              <Button variant="outline" size="icon" className="rounded-full shadow-lg bg-background/80" onClick={() => router.push('/driver/profile')}>
                  <Menu className="h-5 w-5" />
              </Button>
          </header>

          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
              <Button onClick={() => router.push('/driver/accept-ride')} className="w-full">
                Ver Corrida de Teste
              </Button>
              <div className="flex justify-between items-center bg-background/80 p-2 rounded-full shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Shield className="h-5 w-5 text-destructive" />
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
                  
                  <div className="flex items-center gap-2">
                        <label htmlFor="online-status" className={cn("font-semibold", isOnline ? "text-primary" : "text-muted-foreground")}>
                            {isOnline ? 'Online' : 'Offline'}
                        </label>
                  </div>
                  
                  <div className="flex items-center gap-1">
                      <Button onClick={() => setIsPlaying(!isPlaying)} variant="secondary" size="icon" className="rounded-full h-12 w-12">
                          {isPlaying ? <Pause className="h-6 w-6"/> : <Play className="h-6 w-6"/>}
                      </Button>
                  </div>
              </div>
          </div>
      </div>
  );
}

export default withAuth(DriverDashboard, ["driver"]);
