
"use client";

import { useState, useEffect } from "react";
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { getItem, removeItem } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DriverData {
  driverName: string;
  driverAvatar: string;
  rideId: string;
}

const commentSuggestions = [
    "Viagem agradável",
    "Motorista profissional",
    "Carro limpo",
    "Ótima conversa",
    "Direção segura",
];

function RateDriverPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [driverData, setDriverData] = useState<DriverData | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    useEffect(() => {
        const data = getItem<DriverData>('ride_to_rate_driver');
        if (data) {
            setDriverData(data);
        } else {
            router.replace('/passenger/request-ride');
        }
    }, [router]);
    
    const handleAddSuggestion = (suggestion: string) => {
        setComment(prev => prev ? `${prev}, ${suggestion}` : suggestion);
    }

    const handleSubmitRating = () => {
        if (rating === 0) {
            toast({
                variant: "destructive",
                title: "Avaliação incompleta",
                description: "Por favor, selecione pelo menos uma estrela.",
            });
            return;
        }

        // Here you would typically send the rating and comment to your backend,
        // associated with the driver and the rideId.
        console.log({
            rideId: driverData?.rideId,
            rating,
            comment,
        });

        removeItem('ride_to_rate_driver');

        toast({
            title: "Avaliação enviada!",
            description: "Obrigado pelo seu feedback.",
        });

        router.push('/passenger/request-ride');
    };

    if (!driverData) {
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
                    <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-background shadow-md">
                        <AvatarImage src={driverData.driverAvatar || undefined} data-ai-hint="person avatar" />
                        <AvatarFallback>{driverData.driverName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-2xl">Avalie sua viagem com {driverData.driverName}</CardTitle>
                    <CardDescription>
                        Seu feedback ajuda a manter nossa comunidade segura e confiável.
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

                    <div className="space-y-3">
                        <Textarea
                            placeholder="Deixe um comentário (opcional)..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                        />
                         <div className="flex flex-wrap gap-2">
                            {commentSuggestions.map((suggestion) => (
                                <Badge 
                                    key={suggestion} 
                                    variant="outline"
                                    onClick={() => handleAddSuggestion(suggestion)}
                                    className="cursor-pointer hover:bg-accent"
                                >
                                    {suggestion}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    
                    <Button onClick={handleSubmitRating} className="w-full h-12 text-lg font-bold">
                        Enviar Avaliação
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAuth(RateDriverPage, ["passenger"]);
