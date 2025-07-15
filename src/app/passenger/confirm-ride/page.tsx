
"use client";

import { useState, useEffect, useRef } from 'react';
import { withAuth } from '@/components/with-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Map } from '@/components/map';
import { useRouter } from 'next/navigation';
import type { MapRef, LngLatLike } from 'react-map-gl';
import { ArrowLeft, User, CreditCard, Users, Check, Loader2, Wallet, Landmark, ChevronDown } from 'lucide-react';
import { getItem, setItem, removeItem } from '@/lib/storage';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from '@/context/auth-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const RIDE_DETAILS_KEY = 'ride_details_for_confirmation';
const RIDE_REQUEST_KEY = 'pending_ride_request';

interface RideDetails {
    pickup: {
        place_name: string;
        center: [number, number];
    };
    destination: {
        place_name: string;
        center: [number, number];
    };
    fare: number;
    category: string;
    route: LngLatLike[];
}

type PaymentMethod = "Cartão de Crédito" | "PIX" | "Dinheiro";

function ConfirmRidePage() {
    const router = useRouter();
    const mapRef = useRef<MapRef>(null);
    const { user } = useAuth();
    const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
    const { toast } = useToast();
    const [isRequesting, setIsRequesting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cartão de Crédito");
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    useEffect(() => {
        const details = getItem<RideDetails>(RIDE_DETAILS_KEY);
        if (details) {
            setRideDetails(details);
            // Center map on route
            setTimeout(() => {
                if(mapRef.current && details.pickup && details.destination) {
                     mapRef.current.fitBounds([details.pickup.center as LngLatLike, details.destination.center as LngLatLike], { padding: 100, duration: 1000 });
                }
            }, 500);
        } else {
            // No details, go back to request page
            router.replace('/passenger/request-ride');
        }

        return () => {
             removeItem(RIDE_DETAILS_KEY);
        }
    }, [router]);
    
    const paymentIcons: { [key in PaymentMethod]: React.ReactNode } = {
        "Cartão de Crédito": <CreditCard className="h-6 w-6 text-primary"/>,
        "PIX": <Landmark className="h-6 w-6 text-primary"/>,
        "Dinheiro": <Wallet className="h-6 w-6 text-primary"/>
    }

    const handleSelectPayment = (method: PaymentMethod) => {
        setPaymentMethod(method);
        setIsPopoverOpen(false);
    }

    const handleConfirmSelection = async () => {
        if (!rideDetails || !user) return;
        setIsRequesting(true);

        try {
            // Find an available driver
            const driversQuery = query(
                collection(db, "profiles"), 
                where("role", "==", "motorista"), 
                where("status", "==", "Ativo"), 
                limit(1)
            );
            
            const querySnapshot = await getDocs(driversQuery);

            if (querySnapshot.empty) {
                toast({
                    variant: "destructive",
                    title: "Nenhum motorista disponível",
                    description: "Por favor, tente novamente mais tarde.",
                });
                setIsRequesting(false);
                return;
            }

            const driverDoc = querySnapshot.docs[0];
            const driverData = driverDoc.data();

             // Create ride document in Firestore
            const rideDocRef = await addDoc(collection(db, "rides"), {
                passengerId: user.id,
                passengerName: user.name,
                driverId: driverDoc.id,
                driverName: driverData.name || 'Motorista',
                pickupAddress: rideDetails.pickup.place_name,
                destinationAddress: rideDetails.destination.place_name,
                pickupCoords: {
                    lat: rideDetails.pickup.center[1],
                    lng: rideDetails.pickup.center[0]
                },
                destinationCoords: {
                    lat: rideDetails.destination.center[1],
                    lng: rideDetails.destination.center[0]
                },
                fare: rideDetails.fare,
                category: rideDetails.category,
                paymentMethod: paymentMethod,
                status: "pending",
                createdAt: serverTimestamp(),
            });


            // This would be the final request sent to the backend/drivers
            const finalRideRequest = {
                id: rideDocRef.id, // Add ride ID from firestore
                fare: rideDetails.fare,
                pickupAddress: rideDetails.pickup.place_name,
                destination: rideDetails.destination.place_name,
                tripDistance: 8.2, // Mock data
                tripTime: 20, // Mock data
                rideCategory: rideDetails.category,
                paymentMethod: paymentMethod,
                passenger: {
                    name: user.name,
                    avatarUrl: `https://placehold.co/80x80.png`,
                    rating: 4.8
                },
                 driver: {
                    id: driverDoc.id,
                    name: driverData.name || 'Motorista',
                    avatarUrl: driverData.avatarUrl || `https://placehold.co/80x80.png`,
                    rating: driverData.rating || 4.9,
                    vehicle: {
                        model: driverData.vehicle_model || 'Veículo Padrão',
                        licensePlate: driverData.vehicle_license_plate || 'ABC-1234'
                    },
                    eta: Math.floor(Math.random() * 5) + 3, // Mock eta 3-8 mins
                },
                route: {
                    pickup: { lat: rideDetails.pickup.center[1], lng: rideDetails.pickup.center[0] },
                    destination: { lat: rideDetails.destination.center[1], lng: rideDetails.destination.center[0] },
                    coordinates: rideDetails.route
                }
            };

            setItem(RIDE_REQUEST_KEY, finalRideRequest);

            toast({
                title: "Solicitação Enviada!",
                description: "Buscando o melhor motorista para você.",
            });

            // Redirect back to the request page which will now show the searching state
            router.push('/passenger/request-ride');

        } catch (error) {
            console.error("Error finding driver:", error);
            toast({
                variant: "destructive",
                title: "Erro ao solicitar corrida",
                description: "Não foi possível encontrar um motorista. Tente novamente.",
            });
        } finally {
            setIsRequesting(false);
        }
    };

    if (!rideDetails) {
        return <div className="h-screen w-screen flex items-center justify-center bg-muted">Carregando...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <div className="absolute inset-0 h-full w-full z-0">
                <Map 
                    mapRef={mapRef} 
                    pickup={rideDetails.pickup.center as LngLatLike}
                    destination={rideDetails.destination.center as LngLatLike}
                    route={rideDetails.route}
                />
            </div>

            <header className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center pointer-events-none">
                <Button
                    variant="default"
                    size="icon"
                    className="h-12 w-12 rounded-full shadow-lg pointer-events-auto bg-card text-card-foreground hover:bg-card/90"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
            </header>

            <div className="absolute bottom-0 left-0 right-0 z-10 p-2 space-y-2">
                <Card className="shadow-2xl rounded-2xl bg-card">
                    <CardContent className="p-4 space-y-4">
                        <div className="bg-primary/10 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Image src="https://placehold.co/100x100.png" data-ai-hint="car side" alt="Car" width={60} height={60} />
                                    <div>
                                        <h3 className="font-bold text-lg">Viagem</h3>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>6 min</span>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4"/>
                                                <span>4</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">{rideDetails.fare.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                            </div>
                        </div>

                         <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full h-auto justify-between p-3">
                                    <div className="flex items-center gap-3">
                                        {paymentIcons[paymentMethod]}
                                        <p className="font-semibold">{paymentMethod}</p>
                                    </div>
                                    <ChevronDown className="h-5 w-5 text-muted-foreground"/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-1">
                                <div className="space-y-1">
                                    <Button variant="ghost" className="w-full justify-start gap-3 p-3 h-auto" onClick={() => handleSelectPayment("Cartão de Crédito")}>
                                        <CreditCard className="h-6 w-6 text-primary"/>
                                        <div>
                                            <p className="font-semibold">Cartão de Crédito</p>
                                            <p className="text-xs text-muted-foreground text-left">Final **** 1234</p>
                                        </div>
                                    </Button>
                                     <Button variant="ghost" className="w-full justify-start gap-3 p-3 h-auto" onClick={() => handleSelectPayment("PIX")}>
                                        <Landmark className="h-6 w-6 text-primary"/>
                                        <p className="font-semibold">PIX</p>
                                    </Button>
                                     <Button variant="ghost" className="w-full justify-start gap-3 p-3 h-auto" onClick={() => handleSelectPayment("Dinheiro")}>
                                        <Wallet className="h-6 w-6 text-primary"/>
                                        <p className="font-semibold">Dinheiro</p>
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                        
                        <Button className="w-full h-14 text-lg font-bold bg-green-500 hover:bg-green-600" onClick={handleConfirmSelection} disabled={isRequesting}>
                            {isRequesting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            {isRequesting ? "Solicitando..." : "Selecionar Viagem"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default withAuth(ConfirmRidePage, ["passenger"]);
