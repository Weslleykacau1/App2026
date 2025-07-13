
"use client";

import { useState, useEffect, useRef } from "react";
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Star, User, Mail, Phone, Edit, FileText, Moon, Bell, MapPin, Globe, Share2, EyeOff, Save, Car, Upload, CheckSquare, Camera, Library } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";


function DriverProfilePage() {
    const router = useRouter();
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { toast } = useToast();
    
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingVehicle, setIsEditingVehicle] = useState(false);

    const [activeTab, setActiveTab] = useState("profile");

    const videoRef = useRef<HTMLVideoElement>(null);
    const photoRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
    const cnhInputRef = useRef<HTMLInputElement>(null);
    const crlvInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        setIsDarkMode(theme === 'dark');
    }, [theme]);

     useEffect(() => {
        if (activeTab === 'upload-photo') {
          const getCameraPermission = async () => {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({video: true});
              setHasCameraPermission(true);
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
              }
            } catch (error) {
              console.error('Error accessing camera:', error);
              setHasCameraPermission(false);
              toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings to use this feature.',
              });
            }
          };
          getCameraPermission();
        } else {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [activeTab, toast]);

    const takePhoto = () => {
        const video = videoRef.current;
        const photo = photoRef.current;

        if (video && photo) {
        const width = 300;
        const height = video.videoHeight / (video.videoWidth / width);
        
        photo.width = width;
        photo.height = height;

        const context = photo.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, width, height);
            setPhotoDataUrl(photo.toDataURL('image/png'));
        }
        }
    };
    
    const handleGalleryFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoDataUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


    const handleThemeChange = (checked: boolean) => {
        const newTheme = checked ? 'dark' : 'light';
        setTheme(newTheme);
        setIsDarkMode(checked);
    };
    
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, documentName: string) => {
        const file = event.target.files?.[0];
        if (file) {
            toast({
                title: "Arquivo Selecionado",
                description: `${documentName}: ${file.name}`,
            });
        }
    };

    const handleEditToggle = (editor: 'profile' | 'vehicle') => {
        if (editor === 'profile') {
            setIsEditingProfile(!isEditingProfile);
            if (isEditingProfile) {
                 toast({
                    title: "Informações Salvas!",
                    description: "Seus dados foram atualizados com sucesso.",
                })
            }
        } else if (editor === 'vehicle') {
            setIsEditingVehicle(!isEditingVehicle);
             if (isEditingVehicle) {
                 toast({
                    title: "Informações Salvas!",
                    description: "Os dados do veículo foram atualizados.",
                })
            }
        }
    }

    if (!user) return null;

    const getInitials = (name: string) => {
        const names = name.split(' ');
        const initials = names.map(n => n[0]).join('');
        return initials.toUpperCase();
    }
    
    if (activeTab === 'upload-photo') {
        return (
            <div className="flex flex-col min-h-screen bg-muted/40">
                <header className="sticky top-0 z-10 bg-background border-b shadow-sm">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <Button variant="ghost" size="icon" onClick={() => setActiveTab('profile')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-semibold">Alterar Foto</h1>
                        <div className="w-9 h-9"></div>
                    </div>
                </header>
                <main className="flex-1 py-6 container mx-auto px-4">
                     <div className="flex flex-col items-center space-y-4">
                        <div className="w-full max-w-sm aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
                            {hasCameraPermission === false && !photoDataUrl ? (
                                <Alert variant="destructive">
                                    <AlertTitle>Câmera Indisponível</AlertTitle>
                                    <AlertDescription>
                                        Permita o acesso à câmera para continuar ou escolha uma foto da galeria.
                                    </AlertDescription>
                                </Alert>
                            ) : photoDataUrl ? (
                                <img src={photoDataUrl} alt="Sua foto" className="w-full h-full object-cover"/>
                            ) : (
                                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                            )}
                        </div>
                        <canvas ref={photoRef} className="hidden"></canvas>
                        <input type="file" ref={galleryInputRef} className="hidden" onChange={handleGalleryFileSelect} accept="image/*" />

                        
                        {photoDataUrl ? (
                            <div className="flex flex-col space-y-2 w-full max-w-sm">
                                <Button onClick={() => { setPhotoDataUrl(null); setActiveTab('profile'); toast({ title: "Foto salva!"}) }}>Salvar Foto</Button>
                                <Button variant="ghost" onClick={() => setPhotoDataUrl(null)}>Tirar Outra</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                                <Button onClick={takePhoto} disabled={!hasCameraPermission}>
                                    <Camera className="mr-2"/> Tirar Foto
                                </Button>
                                <Button variant="outline" onClick={() => galleryInputRef.current?.click()}>
                                    <Library className="mr-2"/> Escolher da Galeria
                                </Button>
                            </div>
                        )}
                        { !photoDataUrl && <Button variant="ghost" onClick={() => setActiveTab('profile')}>Cancelar</Button> }
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/40">
            <header className="sticky top-0 z-10 bg-background border-b shadow-sm">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <Button variant="default" className="h-10 w-10 p-0 rounded-lg" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold">Perfil</h1>
                    <div className="w-9 h-9"></div>
                </div>
            </header>
            
            <main className="flex-1 py-6 container mx-auto px-4">
                 <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4 bg-muted/60 rounded-lg p-1">
                        <TabsTrigger value="profile">Perfil</TabsTrigger>
                        <TabsTrigger value="vehicle">Veículo</TabsTrigger>
                        <TabsTrigger value="documents">Documentos</TabsTrigger>
                        <TabsTrigger value="settings">Configurações</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile" className="mt-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                                    <AvatarImage src={photoDataUrl || "https://placehold.co/112x112.png"} data-ai-hint="person avatar" />
                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                                <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background" onClick={() => setActiveTab('upload-photo')}>
                                    <Camera className="h-4 w-4"/>
                                </Button>
                            </div>
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                <span className="font-semibold text-muted-foreground">4.8</span>
                            </div>
                             <Badge variant="outline" className="mt-3 bg-blue-100 text-blue-800 border-blue-300">Motorista</Badge>
                             <p className="text-sm text-muted-foreground mt-2">Membro desde Fevereiro 2023</p>
                        </div>

                        <Card className="mt-8">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                                    <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={() => handleEditToggle('profile')}>
                                        {isEditingProfile ? <Save className="h-4 w-4"/> : <Edit className="h-4 w-4"/>}
                                        {isEditingProfile ? 'Salvar' : 'Editar'}
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Nome Completo</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="name" defaultValue={user.name} disabled={!isEditingProfile} className={cn("pl-10", !isEditingProfile && "bg-muted border-none")} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="email" type="email" defaultValue={user.email} disabled={!isEditingProfile} className={cn("pl-10", !isEditingProfile && "bg-muted border-none")} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Telefone</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="phone" type="tel" defaultValue="+55 11 98888-7777" disabled={!isEditingProfile} className={cn("pl-10", !isEditingProfile && "bg-muted border-none")} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="vehicle">
                        <div className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg">Gerenciamento de Veículo</CardTitle>
                                        <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={() => handleEditToggle('vehicle')}>
                                            {isEditingVehicle ? <Save className="h-4 w-4"/> : <Edit className="h-4 w-4"/>}
                                            {isEditingVehicle ? 'Salvar' : 'Editar'}
                                        </Button>
                                    </div>
                                    <CardDescription>Mantenha as informações do seu veículo atualizadas.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div>
                                        <Label htmlFor="model">Modelo do Veículo</Label>
                                        <Input id="model" defaultValue="Toyota Corolla" disabled={!isEditingVehicle} className={cn(!isEditingVehicle && "bg-muted border-none")} />
                                    </div>
                                    <div>
                                        <Label htmlFor="license-plate">Placa</Label>
                                        <Input id="license-plate" defaultValue="BRA2E19" disabled={!isEditingVehicle} className={cn(!isEditingVehicle && "bg-muted border-none")} />
                                    </div>
                                    <div>
                                        <Label htmlFor="color">Cor</Label>
                                        <Input id="color" defaultValue="Prata" disabled={!isEditingVehicle} className={cn(!isEditingVehicle && "bg-muted border-none")} />
                                    </div>
                                    <div>
                                        <Label htmlFor="year">Ano</Label>
                                        <Input id="year" type="number" defaultValue="2022" disabled={!isEditingVehicle} className={cn(!isEditingVehicle && "bg-muted border-none")} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="documents">
                        <div className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Gerenciamento de Documentos</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">CNH</p>
                                                <p className="text-sm text-muted-foreground">Carteira de Motorista</p>
                                            </div>
                                            <Badge variant="secondary" className="gap-1.5 bg-green-100 text-green-800 border-green-300"><CheckSquare className="h-4 w-4"/> Verificado</Badge>
                                        </div>
                                        <input type="file" ref={cnhInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'CNH')} accept="image/*,.pdf" />
                                        <Button variant="outline" className="w-full mt-4 gap-2" onClick={() => cnhInputRef.current?.click()}><Upload className="h-4 w-4"/> Enviar novo arquivo</Button>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">CRLV</p>
                                                <p className="text-sm text-muted-foreground">Documento do Veículo</p>
                                            </div>
                                             <Badge variant="secondary" className="gap-1.5 bg-green-100 text-green-800 border-green-300"><CheckSquare className="h-4 w-4"/> Verificado</Badge>
                                        </div>
                                        <input type="file" ref={crlvInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'CRLV')} accept="image/*,.pdf" />
                                        <Button variant="outline" className="w-full mt-4 gap-2" onClick={() => crlvInputRef.current?.click()}><Upload className="h-4 w-4"/> Enviar novo arquivo</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
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
                                                <p className="text-sm text-muted-foreground">Alterne entre o tema claro e escuro</p>
                                            </div>
                                            <Switch
                                                checked={isDarkMode}
                                                onCheckedChange={handleThemeChange}
                                            />
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

export default withAuth(DriverProfilePage, ["driver"]);

    
