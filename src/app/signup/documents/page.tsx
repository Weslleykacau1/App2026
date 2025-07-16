
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Car, User, ArrowLeft, Upload, FileCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import React, { Suspense, useState, ChangeEvent } from "react";
import { useAuth } from "@/context/auth-context";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface DocumentFiles {
    cnh?: File;
    crlv?: File;
    identity?: File;
}

function DocumentUploadForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');
    const { toast } = useToast();
    const [files, setFiles] = useState<DocumentFiles>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>, documentName: keyof DocumentFiles) => {
        const file = event.target.files?.[0];
        if (file) {
            setFiles(prev => ({ ...prev, [documentName]: file }));
            toast({
                title: "Arquivo Selecionado",
                description: `${file.name}`,
            });
        }
    };
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!userId) {
            toast({ variant: "destructive", title: "Erro", description: "ID do usuário não encontrado." });
            return;
        }

        setIsSubmitting(true);

        try {
            // In a real app, you'd upload these files to Firebase Storage
            // and get the download URLs. For now, we'll just create placeholder URLs.
            const dataToUpdate: { [key: string]: string } = {};

            if (role === 'driver') {
                if (files.cnh) dataToUpdate.cnhUrl = `https://placeholder.co/doc.png?text=CNH`;
                if (files.crlv) dataToUpdate.crlvUrl = `https://placeholder.co/doc.png?text=CRLV`;
            } else if (role === 'passenger') {
                if (files.identity) dataToUpdate.identityDocumentUrl = `https://placeholder.co/doc.png?text=ID`;
            }
            
            const userDocRef = doc(db, "profiles", userId);
            await updateDoc(userDocRef, dataToUpdate);
            
            router.push("/signup/pending");

        } catch (error) {
            console.error("Error saving documents:", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar os documentos." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderDriverDocuments = () => (
        <>
            <div className="space-y-2">
                <Label htmlFor="cnh">CNH (Carteira de Motorista)</Label>
                <Input id="cnh" type="file" onChange={(e) => handleFileSelect(e, 'cnh')} accept="image/*,.pdf" className="h-auto" required/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="crlv">CRLV (Documento do Veículo)</Label>
                <Input id="crlv" type="file" onChange={(e) => handleFileSelect(e, 'crlv')} accept="image/*,.pdf" className="h-auto" required/>
            </div>
        </>
    );

    const renderPassengerDocuments = () => (
         <div className="space-y-2">
            <Label htmlFor="identity">Documento de Identidade (Frente e Verso)</Label>
            <Input id="identity" type="file" onChange={(e) => handleFileSelect(e, 'identity')} accept="image/*,.pdf" className="h-auto" required/>
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
                        <Button type="submit" className="w-full !mt-8 h-12 text-lg font-bold" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Upload className="mr-2 h-5 w-5"/>}
                            {isSubmitting ? 'Enviando...' : 'Enviar Documentos'}
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
