"use client";

import { withAuth } from "@/components/with-auth";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, MapPin, Star, TrendingUp, Navigation } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Map } from "@/components/map";

function DriverDashboard() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold tracking-tight">Painel do Motorista</h2>
            <div className="flex items-center space-x-2">
                <Switch id="availability" defaultChecked />
                <Label htmlFor="availability" className="font-medium">Online</Label>
            </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ganhos de Hoje</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R$145,32</div>
                    <p className="text-xs text-muted-foreground">+20.1% desde ontem</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">4.92</div>
                    <p className="text-xs text-muted-foreground">Excelente</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Corridas</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">3 desde a semana passada</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Aceitação</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">95%</div>
                    <p className="text-xs text-muted-foreground">Últimos 50 pedidos</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
             <Card className="h-[600px] shadow-lg">
                <CardHeader>
                    <CardTitle>Mapa ao Vivo</CardTitle>
                    <CardDescription>Sua posição atual e pedidos de corrida.</CardDescription>
                </CardHeader>
              <CardContent className="h-full -mt-6">
                <div className="w-full h-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    <Map />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pedido de Corrida</CardTitle>
                <CardDescription>Aceite um pedido para iniciar uma viagem.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg flex flex-col items-start justify-between gap-4">
                  <div className="flex items-center gap-4 w-full">
                    <Avatar className="h-12 w-12">
                       <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="person portrait" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">Jane Doe <Badge variant="outline">4.8 ★</Badge></p>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>4 km de distância</span>
                      </div>
                    </div>
                     <div className="text-right flex-shrink-0">
                      <p className="font-bold text-lg text-primary">R$18,45</p>
                      <p className="text-sm text-muted-foreground">15 min</p>
                  </div>
                  </div>
                  <Separator />
                   <div className="w-full">
                        <div className="font-medium text-sm">Embarque</div>
                        <p className="text-muted-foreground text-sm">Rua Principal, 123, Cidade</p>
                   </div>
                    <div className="w-full">
                        <div className="font-medium text-sm">Destino</div>
                        <p className="text-muted-foreground text-sm">Avenida Carvalho, 456, Cidade</p>
                   </div>
                  <div className="flex gap-2 w-full pt-2">
                    <Button variant="outline" className="flex-1">Recusar</Button>
                    <Button className="flex-1"><Navigation className="mr-2 h-4 w-4" /> Aceitar e Navegar</Button>
                  </div>
                </div>
                 <p className="text-center text-sm text-muted-foreground pt-4">Nenhum pedido no momento.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default withAuth(DriverDashboard, ["driver"]);
