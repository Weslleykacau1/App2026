
"use client";

import { useState, useEffect, useRef } from 'react';
import { withAuth } from '@/components/with-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Map } from '@/components/map';
import { useRouter } from 'next/navigation';
import type { MapRef, LngLatLike } from 'react-map-gl';
import { ArrowLeft, User, CreditCard, Users, Check } from 'lucide-react';
import { getItem, setItem, removeItem } from '@/lib/storage';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

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

function ConfirmRidePage() {
    const router = useRouter();
    const mapRef = useRef<MapRef>(null);
    const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
    const { toast } = useToast();

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

    const handleConfirmSelection = () => {
        if (!rideDetails) return;

        // This would be the final request sent to the backend/drivers
        const finalRideRequest = {
            fare: rideDetails.fare * 0.9, // Apply 10% discount
            pickupAddress: rideDetails.pickup.place_name,
            destination: rideDetails.destination.place_name,
            tripDistance: 8.2, // Mock data
            tripTime: 20, // Mock data
            rideCategory: rideDetails.category,
            passenger: {
                name: 'Passageiro', // Replace with actual user name
                avatarUrl: `https://placehold.co/80x80.png`,
                rating: 4.8
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
    };

    if (!rideDetails) {
        return <div className="h-screen w-screen flex items-center justify-center bg-muted">Carregando...</div>;
    }

    const discountedFare = rideDetails.fare * 0.9;

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
                    <div className="bg-blue-500 text-white text-sm font-semibold p-2 text-center rounded-t-2xl flex items-center justify-center gap-2">
                        <Check className="h-4 w-4"/> 10% de desconto aplicado
                    </div>
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
                                    <p className="font-bold text-lg">R${discountedFare.toFixed(2)}</p>
                                    <p className="text-sm text-muted-foreground line-through">R${rideDetails.fare.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <CreditCard className="h-6 w-6 text-primary"/>
                            <p className="font-semibold flex-1">Cartão de Crédito</p>
                            <span className="text-sm text-muted-foreground">**** 1234</span>
                        </div>
                        
                        <Button className="w-full h-14 text-lg font-bold bg-green-500 hover:bg-green-600" onClick={handleConfirmSelection}>
                            Selecionar Viagem
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default withAuth(ConfirmRidePage, ["passenger"]);
