
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, User, Car, Clock, DollarSign, Loader2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { setItem } from '@/lib/storage';
import { useAuth } from '@/context/auth-context';

interface RideRequest {
    id: string;
    passengerId: string;
    passengerName: string;
    driverId: string;
    driverName: string;
    pickupAddress: string;
    destinationAddress: string;
    fare: number;
    status: string;
    category: string;
    createdAt: Date;
    paymentMethod: string;
    pickupCoords: { lat: number; lng: number };
    destinationCoords: { lat: number; lng: number };
    route?: any; // Assuming route data might be stored here
}

interface AvailableRidesDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const RIDE_REQUEST_KEY = 'pending_ride_request';

export function AvailableRidesDrawer({ open, onOpenChange }: AvailableRidesDrawerProps) {
    const { user: driver } = useAuth();
    const router = useRouter();
    const [rides, setRides] = useState<RideRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!open) return;

        setIsLoading(true);
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
    }, [open]);

    const handleAcceptRide = (ride: RideRequest) => {
        if (!driver) return;

        const rideRequestForDriver = {
            id: ride.id,
            fare: ride.fare,
            pickupAddress: ride.pickupAddress,
            destination: ride.destinationAddress,
            tripDistance: 0, // This would need to be calculated or stored
            tripTime: 0, // This would need to be calculated or stored
            rideCategory: ride.category,
            paymentMethod: ride.paymentMethod,
            passenger: {
                name: ride.passengerName,
                avatarUrl: `https://placehold.co/80x80.png`,
                rating: 4.8 // This should come from passenger profile
            },
            driver: {
                id: driver.id,
                name: driver.name,
                avatarUrl: `https://placehold.co/80x80.png`, // driver avatar
                rating: 4.9, // driver rating
                vehicle: {
                    model: driver.vehicle_model || 'Veículo Padrão',
                    licensePlate: driver.vehicle_license_plate || 'ABC-1234'
                },
                eta: Math.floor(Math.random() * 5) + 3,
            },
            route: {
                pickup: { lat: ride.pickupCoords.lat, lng: ride.pickupCoords.lng },
                destination: { lat: ride.destinationCoords.lat, lng: ride.destinationCoords.lng },
                coordinates: ride.route || []
            }
        };

        setItem(RIDE_REQUEST_KEY, rideRequestForDriver);
        onOpenChange(false);
        router.push('/driver/accept-ride');
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[540px] p-0">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle>Corridas Disponíveis</SheetTitle>
                    <SheetDescription>
                        Visualize e aceite corridas pendentes.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-80px)]">
                     <div className="p-6 space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : rides.length === 0 ? (
                            <p className="text-muted-foreground text-center py-10">Nenhuma corrida disponível no momento.</p>
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
                                                    <Car className="h-4 w-4" /> {ride.category}
                                                </div>
                                            </div>
                                             <div className="text-right">
                                                <p className="font-bold text-lg">{ride.fare.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                                 <Badge variant='outline'>{ride.paymentMethod}</Badge>
                                            </div>
                                        </div>
                                        <Separator/>
                                         <div className="space-y-2 text-sm">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 mt-1 text-green-500"/>
                                                <p><span className="font-semibold text-muted-foreground">De:</span> {ride.pickupAddress}</p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 mt-1 text-red-500"/>
                                                 <p><span className="font-semibold text-muted-foreground">Para:</span> {ride.destinationAddress}</p>
                                            </div>
                                             <div className="flex items-start gap-2 text-muted-foreground">
                                                <Clock className="h-4 w-4 mt-1"/>
                                                <p>{ride.createdAt.toLocaleTimeString('pt-BR')}</p>
                                            </div>
                                        </div>
                                        <Button className="w-full" onClick={() => handleAcceptRide(ride)}>
                                            Aceitar Corrida
                                        </Button>
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
