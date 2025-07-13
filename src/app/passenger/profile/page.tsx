
"use client";

import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Star, Camera, User, Mail, Phone, Edit, FileText, Moon, Bell, MapPin, Globe, Share2, EyeOff } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


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
                        <Card className="mt-6">
                            <CardContent className="p-6 text-center flex flex-col items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-full">
                                    <FileText className="h-8 w-8 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold">Documentos de Passageiro</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                        Como passageiro, você não precisa enviar documentos adicionais. Sua conta está verificada.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="settings">
                       <div className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Configurações</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <Moon className="h-6 w-6 text-muted-foreground mt-1" />
                                            <div className="flex-1">
                                                <p className="font-medium">Modo Escuro</p>
                                                <p className="text-sm text-muted-foreground">Interface otimizada para motoristas</p>
                                            </div>
                                            <Switch />
                                        </div>
                                        <Separator />
                                        <div className="flex items-start justify-between gap-4">
                                            <Bell className="h-6 w-6 text-muted-foreground mt-1" />
                                            <div className="flex-1">
                                                <p className="font-medium">Notificações</p>
                                                <p className="text-sm text-muted-foreground">Receber alertas de viagens e promoções</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                        <Separator />
                                        <div className="flex items-start justify-between gap-4">
                                            <MapPin className="h-6 w-6 text-muted-foreground mt-1" />
                                            <div className="flex-1">
                                                <p className="font-medium">Compartilhar Localização</p>
                                                <p className="text-sm text-muted-foreground">Permitir rastreamento durante viagens</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between gap-4">
                                            <Globe className="h-6 w-6 text-muted-foreground" />
                                            <div className="flex-1">
                                                <p className="font-medium">Idioma</p>
                                                <p className="text-sm text-muted-foreground">Selecione seu idioma preferido</p>
                                            </div>
                                            <Select defaultValue="pt-br">
                                                <SelectTrigger className="w-[120px]">
                                                    <SelectValue placeholder="Idioma" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pt-br">Português</SelectItem>
                                                    <SelectItem value="en-us">English</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Privacidade e Segurança</CardTitle>
                                </CardHeader>
                                <CardContent>
                                     <div className="space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <Share2 className="h-6 w-6 text-muted-foreground mt-1" />
                                            <div className="flex-1">
                                                <p className="font-medium">Compartilhar dados de viagem</p>
                                                <p className="text-sm text-muted-foreground">Permitir análise para melhorar o serviço</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                        <Separator />
                                        <div className="flex items-start justify-between gap-4">
                                            <EyeOff className="h-6 w-6 text-muted-foreground mt-1" />
                                            <div className="flex-1">
                                                <p className="font-medium">Visibilidade do perfil</p>
                                                <p className="text-sm text-muted-foreground">Mostrar perfil para outros usuários</p>
                                            </div>
                                            <Switch />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                       </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

export default withAuth(ProfilePage, ["passenger"]);
