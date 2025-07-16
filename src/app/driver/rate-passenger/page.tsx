
"use client";

import { useState, useEffect } from "react";
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { getItem, removeItem } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface RideData {
  fare: number;
  passenger: {
    name: string;
    avatarUrl: string;
  };
}

function RatePassengerPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [rideData, setRideData] = useState<RideData | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    useEffect(() => {
        const data = getItem<RideData>('ride_to_rate_data');
        if (data) {
            setRideData(data);
        } else {
            // No data to rate, maybe page was reloaded. Go to dash.
            router.replace('/driver');
        }
    }, [router]);

    const handleSubmitRating = () => {
        if (rating === 0) {
            toast({
                variant: "destructive",
                title: "Avaliação incompleta",
                description: "Por favor, selecione pelo menos uma estrela.",
            });
            return;
        }

        // Here you would typically send the rating and comment to your backend.
        console.log({
            passenger: rideData?.passenger.name,
            rating,
            comment,
        });

        removeItem('ride_to_rate_data');

        toast({
            title: "Avaliação enviada!",
            description: "Obrigado pelo seu feedback.",
        });

        router.push('/driver');
    };

    if (!rideData) {
        return (
             <div className="w-full h-screen bg-muted flex items-center justify-center">
                <p className="text-muted-foreground text-center p-4">
                Carregando...
                </p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/40">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Avalie sua corrida com {rideData.passenger.name}</CardTitle>
                    <CardDescription>
                        Seu feedback ajuda a manter nossa comunidade segura e confiável.
                        A corrida foi de {rideData.fare.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={cn(
                                    "h-10 w-10 cursor-pointer transition-colors",
                                    rating >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50"
                                )}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>

                    <div className="space-y-2">
                        <Textarea
                            placeholder="Deixe um comentário (opcional)..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                        />
                    </div>
                    
                    <Button onClick={handleSubmitRating} className="w-full h-12 text-lg font-bold">
                        Enviar Avaliação
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAuth(RatePassengerPage, ["driver"]);
