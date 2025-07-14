
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Car, User, ArrowLeft, Upload, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Suspense } from "react";

function DocumentUploadForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { toast } = useToast();

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, documentName: string) => {
        const file = event.target.files?.[0];
        if (file) {
            toast({
                title: "Arquivo Selecionado",
                description: `${documentName}: ${file.name}`,
            });
        }
    };
    
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.push("/signup/pending");
    };

    const renderDriverDocuments = () => (
        <>
            <div className="space-y-2">
                <Label htmlFor="cnh">CNH (Carteira de Motorista)</Label>
                <Input id="cnh" type="file" onChange={(e) => handleFileSelect(e, 'CNH')} accept="image/*,.pdf" className="h-auto"/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="crlv">CRLV (Documento do Veículo)</Label>
                <Input id="crlv" type="file" onChange={(e) => handleFileSelect(e, 'CRLV')} accept="image/*,.pdf" className="h-auto"/>
            </div>
        </>
    );

    const renderPassengerDocuments = () => (
         <div className="space-y-2">
            <Label htmlFor="identity">Documento de Identidade (Frente e Verso)</Label>
            <Input id="identity" type="file" onChange={(e) => handleFileSelect(e, 'Documento de Identidade')} accept="image/*,.pdf" className="h-auto"/>
        </div>
    );

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/40">
             <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={() => router.back()}>
                <ArrowLeft />
            </Button>
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                        <FileCheck className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl">Envio de Documentos</CardTitle>
                    <CardDescription>
                        Para sua segurança, precisamos de alguns documentos para verificar sua conta.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {role === 'driver' && renderDriverDocuments()}
                        {role === 'passenger' && renderPassengerDocuments()}
                        <Button type="submit" className="w-full !mt-8 h-12 text-lg font-bold">
                            <Upload className="mr-2 h-5 w-5"/>
                            Enviar Documentos
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}


export default function DocumentUploadPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <DocumentUploadForm />
        </Suspense>
    )
}
