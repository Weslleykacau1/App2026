
"use client";

import { useState, useEffect, useRef } from "react";
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Star, User, Mail, Phone, Edit, FileText, Moon, Bell, MapPin, Globe, Share2, EyeOff, Save, LogOut, Camera, Library, Settings, History, MoreVertical, MessageCircle, AlertCircle, RefreshCcw } from "lucide-react";
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
import { getItem, setItem } from "@/lib/storage";

const PASSENGER_PROFILE_KEY = 'passenger_profile_data';
const RERIDE_REQUEST_KEY = 'reride_request';

const rideHistory = [
    {
        id: 1,
        driver: { name: 'Carlos S.', avatarUrl: 'https://placehold.co/40x40.png' },
        date: '2024-07-22',
        pickup: 'Av. Paulista, 1578, São Paulo - SP',
        destination: 'Parque Ibirapuera, São Paulo - SP',
        fare: 22.50,
        status: 'Concluída'
    },
    {
        id: 2,
        driver: { name: 'Ana L.', avatarUrl: 'https://placehold.co/40x40.png' },
        date: '2024-07-20',
        pickup: 'Rua Augusta, 900, São Paulo - SP',
        destination: 'Aeroporto de Congonhas, São Paulo - SP',
        fare: 45.80,
        status: 'Concluída'
    },
    {
        id: 3,
        driver: { name: 'Ricardo P.', avatarUrl: 'https://placehold.co/40x40.png' },
        date: '2024-07-19',
        pickup: 'Shopping Morumbi, São Paulo - SP',
        destination: 'Estádio do Morumbi, São Paulo - SP',
        fare: 15.00,
        status: 'Cancelada'
    }
];

function ProfilePage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();

    const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '', phone: '+55 11 99999-8888', cpf: '123.456.789-00' });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const idInputRef = useRef<HTMLInputElement>(null);
    const addressInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [language, setLanguage] = useState("pt-br");

    const [activeTab, setActiveTab] = useState("profile");
    const videoRef = useRef<HTMLVideoElement>(null);
    const photoRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsDarkMode(theme === 'dark');
        const savedData = getItem(PASSENGER_PROFILE_KEY);
        if (savedData) {
            setProfileData(savedData);
        }
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

    const handleEditToggle = () => {
        if (isEditing) {
            setItem(PASSENGER_PROFILE_KEY, profileData);
            toast({
                title: "Informações Salvas!",
                description: "Seus dados foram atualizados com sucesso.",
            })
        }
        setIsEditing(!isEditing);
    }
    
    const handleRequestAgain = (ride: typeof rideHistory[0]) => {
        if (ride.status === 'Cancelada') {
             toast({
                variant: 'destructive',
                title: "Não é possível repetir",
                description: "Esta corrida foi cancelada.",
            })
            return;
        }
        setItem(RERIDE_REQUEST_KEY, { pickup: ride.pickup, destination: ride.destination });
        router.push('/passenger');
    }


    if (!user) return null;

    const getInitials = (name: string) => {
        if (!name) return '';
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
                                <Button onClick={() => { setActiveTab('profile'); toast({ title: "Foto salva!"}) }}>Salvar Foto</Button>
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
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold">Perfil</h1>
                    <Button variant="ghost" size="icon" onClick={logout}>
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </header>
            
            <main className="flex-1 py-6 container mx-auto px-4">
                 <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4 bg-muted/60 rounded-lg p-1">
                        <TabsTrigger value="profile">Perfil</TabsTrigger>
                        <TabsTrigger value="history">Histórico</TabsTrigger>
                        <TabsTrigger value="documents">Documentos</TabsTrigger>
                        <TabsTrigger value="settings"><Settings/></TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile" className="mt-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                                    <AvatarImage src={photoDataUrl || "https://placehold.co/112x112.png"} data-ai-hint="person avatar" />
                                    <AvatarFallback>{getInitials(profileData.name)}</AvatarFallback>
                                </Avatar>
                                <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background" onClick={() => setActiveTab('upload-photo')}>
                                    <Camera className="h-4 w-4"/>
                                </Button>
                            </div>
                            <h2 className="text-2xl font-bold">{profileData.name}</h2>
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
                                    <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={handleEditToggle}>
                                        {isEditing ? <Save className="h-4 w-4"/> : <Edit className="h-4 w-4"/>}
                                        {isEditing ? 'Salvar' : 'Editar'}
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Nome Completo</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="name" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} disabled={!isEditing} className={cn("pl-10", !isEditing && "bg-muted border-none")} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="email" type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} disabled={!isEditing} className={cn("pl-10", !isEditing && "bg-muted border-none")} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Telefone</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="phone" type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} disabled={!isEditing} className={cn("pl-10", !isEditing && "bg-muted border-none")} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="cpf">CPF</Label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="cpf" value={profileData.cpf} onChange={(e) => setProfileData({...profileData, cpf: e.target.value})} disabled={!isEditing} className={cn("pl-10", !isEditing && "bg-muted border-none")} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="history">
                        <div className="space-y-4 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2"><History/> Histórico de Corridas</CardTitle>
                                    <CardDescription>Veja os detalhes de suas viagens anteriores.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     {rideHistory.length > 0 ? (
                                        rideHistory.map((ride) => (
                                            <div key={ride.id} className="border p-4 rounded-lg space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={ride.driver.avatarUrl} data-ai-hint="person avatar" />
                                                            <AvatarFallback>{ride.driver.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold">{ride.driver.name}</p>
                                                            <p className="text-sm text-muted-foreground">{new Date(ride.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-lg">{ride.fare.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                                         <Badge variant={ride.status === 'Concluída' ? 'secondary' : 'destructive'}>{ride.status}</Badge>
                                                    </div>
                                                </div>
                                                <Separator/>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 mt-1 text-primary"/>
                                                        <p><span className="font-medium text-muted-foreground">De:</span> {ride.pickup}</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 mt-1 text-red-500"/>
                                                         <p><span className="font-medium text-muted-foreground">Para:</span> {ride.destination}</p>
                                                    </div>
                                                </div>
                                                <Separator/>
                                                 <Button 
                                                    variant="outline" 
                                                    className="w-full mt-2"
                                                    onClick={() => handleRequestAgain(ride)}
                                                    disabled={ride.status === 'Cancelada'}
                                                >
                                                    <RefreshCcw className="mr-2 h-4 w-4"/>
                                                    Solicitar Novamente
                                                </Button>
                                            </div>
                                        ))
                                     ) : (
                                        <p className="text-muted-foreground text-center py-8">Nenhuma corrida no seu histórico ainda.</p>
                                     )}
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
                                                <p className="font-medium">Documento de Identidade (RG/CPF)</p>
                                                <p className="text-sm text-muted-foreground">Para verificação de conta</p>
                                            </div>
                                            <Badge variant="destructive">Pendente</Badge>
                                        </div>
                                        <input type="file" ref={idInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'Documento de Identidade')} accept="image/*,.pdf" />
                                        <Button variant="outline" className="w-full mt-4" onClick={() => idInputRef.current?.click()}>Enviar arquivo</Button>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Comprovante de Endereço</p>
                                                <p className="text-sm text-muted-foreground">Opcional, para segurança</p>
                                            </div>
                                            <Badge variant="destructive">Pendente</Badge>
                                        </div>
                                        <input type="file" ref={addressInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'Comprovante de Endereço')} accept="image/*,.pdf" />
                                        <Button variant="outline" className="w-full mt-4" onClick={() => addressInputRef.current?.click()}>Enviar arquivo</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="settings">
                       <div className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2"><Settings/></CardTitle>
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
                                            <div className="flex items-center gap-2">
                                                <Select value={language} onValueChange={setLanguage}>
                                                    <SelectTrigger className="w-[120px]">
                                                        <SelectValue placeholder="Idioma" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pt-br">Português</SelectItem>
                                                        <SelectItem value="en-us">English</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button size="sm" onClick={() => toast({ title: "Idioma atualizado!" })}>Aplicar</Button>
                                            </div>
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
                                            <Switch defaultChecked />
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
