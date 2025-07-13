
"use client";

import { useState } from "react";
import { withAuth } from "@/components/with-auth";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, ArrowRight, Wallet, Coins, Landmark, Car, User, Users, Check } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';
import Image from "next/image";


type RideCategory = "comfort" | "executive";

function PassengerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [rideCategory, setRideCategory] = useState<RideCategory>("comfort");
  const [showPrice, setShowPrice] = useState(false);
  const [comfortPrice, setComfortPrice] = useState(0);
  const [executivePrice, setExecutivePrice] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);

  if (!user) return null;

  const getInitials = (name: string) => {
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.toUpperCase();
  }

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 0) {
      // Simulate distance calculation
      const distance = Math.random() * (30 - 1) + 1; // Random distance between 1km and 30km
      
      // Calculate price based on distance
      const comfortFare = distance * 1.80;
      const executiveFare = distance * 1.20;

      setComfortPrice(comfortFare);
      setExecutivePrice(executiveFare);
      setShowPrice(true);
      setPromoApplied(true);
    } else {
      setShowPrice(false);
      setPromoApplied(false);
      setComfortPrice(0);
      setExecutivePrice(0);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const RideOption = ({ type, name, time, seats, originalPrice, discountedPrice, isSelected, onSelect }: { type: RideCategory, name: string, time: number, seats: number, originalPrice: number, discountedPrice: number, isSelected: boolean, onSelect: () => void }) => (
    <div 
        onClick={onSelect}
        className={cn(
            "p-3 rounded-lg border-2 cursor-pointer transition-all bg-green-500/10",
            isSelected ? 'border-green-600' : 'border-transparent hover:border-green-400'
        )}
    >
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Image src="https://placehold.co/64x64.png" alt="Car" width={48} height={48} data-ai-hint="car side" />
                <div>
                    <h3 className="font-bold text-lg text-foreground">{name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{time} min</span>
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{seats}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <p className="font-bold text-lg text-foreground">{formatCurrency(discountedPrice)}</p>
                <p className="text-sm text-muted-foreground line-through">{formatCurrency(originalPrice)}</p>
            </div>
        </div>
    </div>
);


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 h-full w-full z-0">
        <Map />
      </div>

      <header className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex justify-end">
             <Button variant="ghost" className="relative h-12 w-12 rounded-full bg-background/80 shadow-lg" onClick={() => router.push('/passenger/profile')}>
                <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={`@${user.name}`} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
            </Button>
        </div>
      </header>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 space-y-2">
         {promoApplied && (
            <div className="bg-primary text-primary-foreground rounded-lg p-2 text-center text-sm font-medium flex items-center justify-center gap-2">
                <Check className="h-4 w-4"/>
                <span>10% de promoção aplicada</span>
            </div>
         )}
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
                    onChange={handleDestinationChange}
                  />
                </div>
              </div>
              
              {showPrice && (
                  <div className="space-y-2">
                      <RideOption 
                          type="comfort"
                          name="Comfort"
                          time={6}
                          seats={4}
                          originalPrice={comfortPrice}
                          discountedPrice={comfortPrice * 0.9}
                          isSelected={rideCategory === 'comfort'}
                          onSelect={() => setRideCategory('comfort')}
                      />
                      <RideOption 
                          type="executive"
                          name="Executive"
                          time={5}
                          seats={4}
                          originalPrice={executivePrice}
                          discountedPrice={executivePrice * 0.9}
                          isSelected={rideCategory === 'executive'}
                          onSelect={() => setRideCategory('executive')}
                      />
                  </div>
              )}
                
              <div className="col-span-2">
                <Select defaultValue="pix">
                  <SelectTrigger className="h-14 text-base w-full">
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

              <Button className="w-full h-14 text-lg justify-between font-bold" disabled={!showPrice}>
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
