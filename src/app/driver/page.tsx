
"use client";

import { useState, useMemo } from 'react';
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { cn } from '@/lib/utils';
import MapGL, { Marker } from 'react-map-gl';
import { useTheme } from 'next-themes';
import { Menu, Home, BarChart2, Wallet, User, Star, Search, Zap, Pause, Play, Shield, MoreVertical, Phone } from "lucide-react";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
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

const weeklyEarningsData = [
    { day: "Seg", earnings: 200 },
    { day: "Ter", earnings: 250 },
    { day: "Qua", earnings: 300 },
    { day: "Qui", earnings: 150 },
    { day: "Sex", earnings: 280 },
    { day: "Sáb", earnings: 320 },
    { day: "Dom", earnings: 245 },
];

type DriverView = 'profile' | 'stats';

function DriverDashboard() {
  const { resolvedTheme } = useTheme();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [isOnline, setIsOnline] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeView, setActiveView] = useState<DriverView>('profile');
  const router = useRouter();

  const mapStyle = resolvedTheme === 'dark' 
    ? 'mapbox://styles/mapbox/dark-v11' 
    : 'mapbox://styles/mapbox/streets-v12';

  const totalWeeklyEarnings = useMemo(() => 
    weeklyEarningsData.reduce((acc, curr) => acc + curr.earnings, 0),
    []
  );

  if (!mapboxToken) {
    return (
      <div className="w-full h-screen bg-muted flex items-center justify-center">
        <p className="text-muted-foreground text-center p-4">
          O token do Mapbox não está configurado. Por favor, adicione-o às suas variáveis de ambiente.
        </p>
      </div>
    );
  }
  
  const renderSheetContent = () => {
    if (activeView === 'stats') {
        return (
             <div className="p-4 flex flex-col h-full bg-background">
                <SheetHeader className="mb-4">
                    <SheetTitle className="text-2xl">Suas Estatísticas</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ganhos da Semana</CardTitle>
                            <CardDescription>Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalWeeklyEarnings)}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={150}>
                                <RechartsBarChart data={weeklyEarningsData}>
                                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--muted))' }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                                        formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                                    />
                                    <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Métricas de Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Taxa de Aceitação</p>
                                <div className="flex items-center gap-2">
                                    <Progress value={92} className="h-2" />
                                    <span className="font-bold">92%</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Taxa de Cancelamento</p>
                                <div className="flex items-center gap-2">
                                    <Progress value={5} className="h-2 [&>div]:bg-destructive" />
                                    <span className="font-bold">5%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                 <Button className="mt-4" onClick={() => setActiveView('profile')}>Voltar ao Perfil</Button>
            </div>
        );
    }

    return (
      <div className="bg-background h-full flex flex-col">
        <SheetHeader className="p-4 border-b">
            <div className="flex flex-col items-start gap-2">
                <Avatar className="h-16 w-16">
                <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="person avatar" />
                <AvatarFallback>CS</AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-xl font-bold">Olá, Carlos Silva</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">4.8 <Star className="h-4 w-4 text-accent" fill="hsl(var(--accent))"/></p>
            </div>
            </div>
        </SheetHeader>
        <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
                <span className="font-medium">Status</span>
                <div className="flex items-center gap-2">
                    <Switch id="online-status" checked={isOnline} onCheckedChange={setIsOnline} />
                    <label htmlFor="online-status" className={cn("font-semibold", isOnline ? "text-primary" : "text-muted-foreground")}>
                        {isOnline ? 'Online' : 'Offline'}
                    </label>
                </div>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ganhos Totais</span>
                <span className="font-bold">R$ 156,50</span>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Corridas Hoje</span>
                <span className="font-bold">8</span>
            </div>
        </div>
        <nav className="flex flex-col gap-1 p-4 border-t">
            <Button variant="ghost" className="justify-start gap-2"><Home /> Início</Button>
            <Button variant="ghost" className="justify-start gap-2" onClick={() => setActiveView('stats')}><BarChart2 /> Estatísticas</Button>
            <Button variant="ghost" className="justify-start gap-2"><Wallet /> Carteira</Button>
            <Button variant="ghost" className="justify-start gap-2"><User /> Perfil</Button>
        </nav>
      </div>
    );
  }

  return (
    <Sheet>
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
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full shadow-lg bg-background/80">
                    <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full shadow-lg bg-background/80">
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
          </header>

          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
              <Button onClick={() => router.push('/driver/accept-ride')} className="w-full">
                Ver Corrida de Teste
              </Button>
              <div className="flex justify-between items-center bg-background/80 p-2 rounded-full shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical /></Button>
                      <p className="ml-2 font-medium">Você está {isOnline ? <span className="text-primary font-bold">Online</span> : <span className="font-bold">Offline</span>}</p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                      <Button onClick={() => setIsPlaying(!isPlaying)} variant="secondary" size="icon" className="rounded-full h-12 w-12">
                          {isPlaying ? <Pause className="h-6 w-6"/> : <Play className="h-6 w-6"/>}
                      </Button>
                  </div>
              </div>
          </div>
      </div>
      <SheetContent side="left" className="w-[350px] p-0 border-none">
        {renderSheetContent()}
      </SheetContent>
    </Sheet>
  );
}

export default withAuth(DriverDashboard, ["driver"]);
