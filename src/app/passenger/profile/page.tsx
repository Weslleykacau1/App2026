"use client";

import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Star, Camera, User, Mail, Phone, Edit, FileText } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ProfilePage() {
    const router = useRouter();
    const { user } = useAuth();

    if (!user) return null;

    const getInitials = (name: string) => {
        const names = name.split(' ');
        const initials = names.map(n => n[0]).join('');
        return initials.toUpperCase();
    }
    
    return (
        <div className="flex flex-col min-h-screen bg-muted/40">
            <header className="sticky top-0 z-10 bg-background border-b shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold">Perfil</h1>
                    <Button variant="ghost" size="icon">
                        <Camera className="h-5 w-5" />
                    </Button>
                </div>
            </header>
            
            <main className="flex-1 py-6 container mx-auto px-4">
                 <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/60 rounded-lg p-1">
                        <TabsTrigger value="profile">Perfil</TabsTrigger>
                        <TabsTrigger value="documents">Documentos</TabsTrigger>
                        <TabsTrigger value="settings">Configurações</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile" className="mt-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                                    <AvatarImage src={`https://placehold.co/112x112.png`} data-ai-hint="person avatar" />
                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                                <Button size="icon" className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground">
                                    <Camera className="h-4 w-4" />
                                </Button>
                            </div>
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                <span className="font-semibold text-muted-foreground">4.8</span>
                            </div>
                             <Badge variant="outline" className="mt-3 bg-blue-100 text-blue-800 border-blue-300">Passageiro</Badge>
                             <p className="text-sm text-muted-foreground mt-2">Membro desde Janeiro 2023</p>
                        </div>

                        <Card className="mt-8">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                                    <Button variant="ghost" size="sm" className="gap-1.5 text-primary">
                                        <Edit className="h-4 w-4"/>
                                        Editar
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Nome Completo</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="name" defaultValue={user.name} readOnly className="pl-10 bg-muted border-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="email" type="email" defaultValue={user.email} readOnly className="pl-10 bg-muted border-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Telefone</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="phone" type="tel" defaultValue="+55 11 99999-8888" readOnly className="pl-10 bg-muted border-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="cpf">CPF</Label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="cpf" defaultValue="123.456.789-00" readOnly className="pl-10 bg-muted border-none" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="documents">
                        <p className="text-center text-muted-foreground py-12">Seus documentos aparecerão aqui.</p>
                    </TabsContent>
                    <TabsContent value="settings">
                       <p className="text-center text-muted-foreground py-12">Suas configurações aparecerão aqui.</p>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

export default withAuth(ProfilePage, ["passenger"]);