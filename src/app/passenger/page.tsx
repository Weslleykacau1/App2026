
"use client";

import { useState } from "react";
import { withAuth } from "@/components/with-auth";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Search, Car, ArrowRight, Wallet, CreditCard, Tag, User, Coins, Landmark } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "@/components/map";
import { cn } from "@/lib/utils";

type RideCategory = "comfort" | "executive";

function PassengerDashboard() {
  const { user } = useAuth();
  const [rideCategory, setRideCategory] = useState<RideCategory>("comfort");

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 h-full w-full z-0">
        <Map />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 space-y-2">
         <Card className="shadow-2xl rounded-2xl">
            <CardContent className="p-4 space-y-4">
               <div className="space-y-2">
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    id="pickup"
                    placeholder="Local de embarque"
                    className="pl-10 h-12 text-base bg-muted focus-visible:ring-1 focus-visible:ring-ring"
                    defaultValue="Localização atual"
                  />
                </div>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                  <Input
                    id="destination"
                    placeholder="Digite seu endereço"
                    className="pl-10 h-12 text-base"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 grid-rows-2 gap-2">
                <button 
                  onClick={() => setRideCategory('comfort')} 
                  className={cn(
                    "col-span-1 row-span-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 text-center",
                    rideCategory === 'comfort' ? 'border-primary bg-primary/10' : 'border-border bg-muted/50'
                  )}
                >
                  <Car className="h-8 w-8 mb-1"/>
                  <span className="text-sm font-medium">Comfort</span>
                  <span className="font-bold text-lg">R$25,50</span>
                </button>
                 <button 
                  onClick={() => setRideCategory('executive')} 
                  className={cn(
                    "col-span-1 row-span-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 text-center",
                    rideCategory === 'executive' ? 'border-primary bg-primary/10' : 'border-border bg-muted/50'
                  )}
                >
                  <Car className="h-8 w-8 mb-1"/>
                  <span className="text-sm font-medium">Executive</span>
                  <span className="font-bold text-lg">R$42,00</span>
                </button>
                <button
                  className={cn(
                    "col-span-1 row-span-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 text-center border-border bg-muted/50"
                  )}
                >
                  <User className="h-8 w-8 mb-1"/>
                  <span className="text-sm font-medium">Meu Perfil</span>
                </button>
                
                <div className="col-span-1 row-span-1">
                  <Select defaultValue="pix">
                    <SelectTrigger className="h-full text-base w-full">
                        <SelectValue placeholder="Pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pix">
                             <div className="flex items-center gap-2">
                                <Wallet className="h-4 w-4" />
                                <span>Pix</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="cash">
                             <div className="flex items-center gap-2">
                                <Coins className="h-4 w-4" />
                                <span>Dinheiro</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="card_machine">
                             <div className="flex items-center gap-2">
                                <Landmark className="h-4 w-4" />
                                <span>Máquina de Cartão</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full h-14 text-lg justify-between">
                <span>Confirmar Corrida</span>
                <ArrowRight className="h-5 w-5"/>
              </Button>

            </CardContent>
          </Card>
      </div>
    </div>
  );
}

export default withAuth(PassengerDashboard, ["passenger"]);
