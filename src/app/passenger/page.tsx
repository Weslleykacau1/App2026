
"use client";

import { useState } from "react";
import { withAuth } from "@/components/with-auth";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { History, MapPin, Search, Car, Wallet, Route, Loader2 } from "lucide-react";
import { Map } from "@/components/map";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const FARE_RATES = {
  x: 1.20,
  confort: 2.00,
};

function PassengerDashboard() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ distance: number; fare: number; category: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("x");

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSearching(true);
    setSearchResult(null);

    // Simula uma chamada de API para obter a distância
    setTimeout(() => {
      const distance = parseFloat((Math.random() * (15 - 3) + 3).toFixed(1)); // Distância aleatória entre 3 e 15 km
      const rate = FARE_RATES[selectedCategory as keyof typeof FARE_RATES];
      const fare = distance * rate;
      
      setSearchResult({
        distance,
        fare,
        category: selectedCategory === 'x' ? 'Corrida X' : 'Corrida Confort',
      });
      setIsSearching(false);
    }, 1500);
  };


  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="h-[600px] shadow-lg">
                <CardHeader>
                    <CardTitle>Mapa</CardTitle>
                    <CardDescription>Sua localização atual e motoristas próximos.</CardDescription>
                </CardHeader>
              <CardContent className="h-full -mt-6">
                <div className="w-full h-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    <Map />
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <div className="space-y-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Pedir uma Corrida</CardTitle>
                  <CardDescription>Para onde você quer ir?</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pickup">Local de Embarque</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="pickup" placeholder="Localização Atual" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destination">Destino</Label>
                       <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="destination" placeholder="Digite o destino" className="pl-10" required />
                       </div>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                       <Select onValueChange={setSelectedCategory} defaultValue={selectedCategory}>
                          <SelectTrigger id="category" className="w-full">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="x">
                                <div className="flex items-center gap-2">
                                    <Car className="h-4 w-4" />
                                    <span>Corrida X (R$1,20/km)</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="confort">
                                <div className="flex items-center gap-2">
                                    <Car className="h-4 w-4" />
                                    <span>Corrida Confort (R$2,00/km)</span>
                                </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full !mt-6" size="lg" disabled={isSearching}>
                        {isSearching ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Search className="mr-2 h-4 w-4" />
                        )}
                        Encontrar Corrida
                    </Button>
                  </form>
                </CardContent>
                {searchResult && (
                  <>
                  <CardFooter className="flex-col items-start gap-4">
                    <Separator />
                     <h3 className="font-semibold pt-2">Estimativa da sua viagem:</h3>
                     <div className="w-full space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center gap-2"><Car /> Categoria</span>
                            <span>{searchResult.category}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center gap-2"><Route /> Distância</span>
                            <span>{searchResult.distance} km</span>
                        </div>
                         <div className="flex justify-between items-center font-bold text-base">
                            <span className="text-primary flex items-center gap-2"><Wallet/> Tarifa Estimada</span>
                            <span className="text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(searchResult.fare)}</span>
                        </div>
                     </div>
                     <Button className="w-full" size="lg">Confirmar Corrida</Button>
                  </CardFooter>
                  </>
                )}
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Corridas Recentes</CardTitle>
                  <CardDescription>Seu histórico de corridas.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Centro para Aeroporto</p>
                        <p className="text-sm text-muted-foreground">15 de Jan, 2024</p>
                      </div>
                      <p className="font-semibold text-primary">R$25,50</p>
                    </li>
                    <li className="flex items-center justify-between">
                       <div>
                        <p className="font-medium">Shopping para Casa</p>
                        <p className="text-sm text-muted-foreground">14 de Jan, 2024</p>
                      </div>
                      <p className="font-semibold text-primary">R$12,75</p>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4">
                    <History className="mr-2 h-4 w-4" />
                    Ver Histórico Completo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default withAuth(PassengerDashboard, ["passenger"]);
