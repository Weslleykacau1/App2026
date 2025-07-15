
"use client";

import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { MapPin, User, Car, Clock, DollarSign } from 'lucide-react';
import { Badge } from './ui/badge';

interface RideRequest {
    id: string;
    passengerName: string;
    driverName: string;
    pickupAddress: string;
    destinationAddress: string;
    fare: number;
    status: string;
    createdAt: Date;
}

interface RideRequestsDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RideRequestsDrawer({ open, onOpenChange }: RideRequestsDrawerProps) {
    const [rides, setRides] = useState<RideRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "rides"), where("status", "==", "pending"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const rideRequests: RideRequest[] = [];
            querySnapshot.forEach((doc: DocumentData) => {
                const data = doc.data();
                rideRequests.push({
                    id: doc.id,
                    ...data,
                    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
                } as RideRequest);
            });
            setRides(rideRequests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching real-time rides:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[540px] p-0">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle>Solicitações de Corrida em Tempo Real</SheetTitle>
                    <SheetDescription>
                        Acompanhe as corridas sendo solicitadas no momento.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-80px)]">
                     <div className="p-6 space-y-4">
                        {isLoading ? (
                             <p className="text-muted-foreground text-center">Carregando corridas...</p>
                        ) : rides.length === 0 ? (
                            <p className="text-muted-foreground text-center py-10">Nenhuma corrida pendente no momento.</p>
                        ) : (
                            rides.map((ride) => (
                                <Card key={ride.id}>
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 font-semibold">
                                                    <User className="h-4 w-4 text-primary" /> {ride.passengerName}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Car className="h-4 w-4" /> {ride.driverName}
                                                </div>
                                            </div>
                                             <div className="text-right">
                                                <p className="font-bold text-lg">{ride.fare.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                                 <Badge variant='outline'>{ride.status}</Badge>
                                            </div>
                                        </div>
                                        <Separator/>
                                         <div className="space-y-2 text-sm">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 mt-1 text-green-500"/>
                                                <p>{ride.pickupAddress}</p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 mt-1 text-red-500"/>
                                                <p>{ride.destinationAddress}</p>
                                            </div>
                                             <div className="flex items-start gap-2 text-muted-foreground">
                                                <Clock className="h-4 w-4 mt-1"/>
                                                <p>{ride.createdAt.toLocaleTimeString('pt-BR')}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                     </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
