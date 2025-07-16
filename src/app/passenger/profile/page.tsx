
"use client";

import { useState, useEffect, useRef } from "react";
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, Mail, Phone, Edit, FileText, Moon, Bell, MapPin, Globe, Share2, EyeOff, Save, LogOut, Camera, Library, Settings, History, Shield, ShieldCheck, Home, Briefcase, Plus, Calendar, ChevronRight } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getItem, setItem } from "@/lib/storage";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useLanguage } from "@/context/language-context";


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

type ModalType = 'personal-data' | 'security' | 'login-security' | 'saved-locations' | 'language' | 'communication' | 'upload-photo' | 'history' | 'documents' | null;
type AddressType = 'home' | 'work';

function ProfilePage() {
    const router = useRouter();
    const { user, logout, fetchUserProfile } = useAuth();
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();
    const { language, changeLanguage, t } = useLanguage();

    const [profileData, setProfileData] = useState({ name: '', email: '', phone: '', cpf: '', photoUrl: '', identityDocumentUrl: '', addressProofUrl: '', homeAddress: '', workAddress: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [openModal, setOpenModal] = useState<ModalType>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // States for saved addresses
    const [addressTypeToSet, setAddressTypeToSet] = useState<AddressType | null>(null);
    const [addressInput, setAddressInput] = useState("");

    const videoRef = useRef<HTMLVideoElement>(null);
    const photoRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const idInputRef = useRef<HTMLInputElement>(null);
    const addressInputRef = useRef<HTMLInputElement>(null);

    const fetchProfileData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await fetchUserProfile(user);
            if (data) {
                setProfileData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '+55 11 99999-8888',
                    cpf: data.cpf || '123.456.789-00',
                    photoUrl: data.photoUrl || '',
                    identityDocumentUrl: data.identityDocumentUrl || '',
                    addressProofUrl: data.addressProofUrl || '',
                    homeAddress: data.homeAddress || '',
                    workAddress: data.workAddress || '',
                });
            } else {
                 throw new Error("Perfil não encontrado.");
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
            toast({
                variant: "destructive",
                title: "Erro ao carregar perfil",
                description: "Não foi possível carregar seus dados.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchProfileData();
    }, [user, language]);

     useEffect(() => {
        if (openModal === 'upload-photo') {
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
                title: "Acesso negado",
                description: "Por favor, habilite o acesso à câmera.",
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
    }, [openModal, toast, t]);

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
            reader.onload = (e) => setPhotoDataUrl(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, documentName: 'identityDocumentUrl' | 'addressProofUrl') => {
        const file = event.target.files?.[0];
        if (file && user) {
            const placeholderUrl = `https://placehold.co/800x600.png?text=${documentName}`;
            try {
                const docRef = doc(db, "profiles", user.id);
                await updateDoc(docRef, { [documentName]: placeholderUrl });
                setProfileData(prev => ({ ...prev, [documentName]: placeholderUrl }));
                toast({ title: "Documento enviado para análise." });
            } catch (error) {
                toast({ variant: "destructive", title: "Erro", description: "Não foi possível enviar o documento." });
            }
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        try {
            const docRef = doc(db, "profiles", user.id);
            await updateDoc(docRef, {
                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone,
                cpf: profileData.cpf
            });
            toast({ title: "Informações Salvas!" });
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar as informações." });
        }
        setIsEditing(false);
    };

    const handleSavePhoto = async () => {
        if (!user || !photoDataUrl) return;
        try {
            const docRef = doc(db, "profiles", user.id);
            await updateDoc(docRef, { photoUrl: photoDataUrl });
            setProfileData({ ...profileData, photoUrl: photoDataUrl });
            toast({ title: "Foto salva!" });
            setPhotoDataUrl(null);
            setOpenModal(null);
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar sua foto." });
        }
    };
    
    const handleRequestAgain = (ride: typeof rideHistory[0]) => {
        if (ride.status === 'Cancelada') {
             toast({ variant: 'destructive', title: "Não é possível repetir", description: "Esta corrida foi cancelada." });
            return;
        }
        setItem(RERIDE_REQUEST_KEY, { pickup: ride.pickup, destination: ride.destination });
        router.push('/passenger');
    };

    const handleOpenAddressModal = (type: AddressType) => {
        setAddressTypeToSet(type);
        setAddressInput(type === 'home' ? profileData.homeAddress : profileData.workAddress);
        setOpenModal('saved-locations');
    };

    const handleSaveAddress = async () => {
        if (!user || !addressTypeToSet) return;
        const fieldToUpdate = addressTypeToSet === 'home' ? 'homeAddress' : 'workAddress';
        try {
            const userDocRef = doc(db, "profiles", user.id);
            await updateDoc(userDocRef, { [fieldToUpdate]: addressInput });
            setProfileData(prev => ({ ...prev, [fieldToUpdate]: addressInput }));
            toast({ title: 'Endereço salvo!' });
            setAddressInput("");
            setAddressTypeToSet(null);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao salvar', description: 'Não foi possível salvar o endereço.' });
        }
    };

    const renderMenuItem = (icon: React.ReactNode, text: string, onClick: () => void, subtext?: string) => (
        <>
            <Button variant="ghost" className="w-full h-auto justify-between items-center py-4 px-2" onClick={onClick}>
                <div className="flex items-center gap-4">
                    {icon}
                    <div className="text-left">
                        <p className="font-semibold">{text}</p>
                        {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
                    </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Separator />
        </>
    );

    if (!user || isLoading) {
      return <div className="flex h-screen w-full items-center justify-center">Carregando...</div>;
    }

    const ModalContent = () => {
        if (openModal === 'personal-data') return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Dados pessoais</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <div className="flex justify-end">
                        <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}>
                            {isEditing ? <Save className="h-4 w-4"/> : <Edit className="h-4 w-4"/>}
                            {isEditing ? 'Salvar' : 'Editar'}
                        </Button>
                    </div>
                    <div>
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} disabled={!isEditing} className={cn(!isEditing && "bg-muted border-none")} />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} disabled={!isEditing} className={cn(!isEditing && "bg-muted border-none")} />
                    </div>
                    <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} disabled={!isEditing} className={cn(!isEditing && "bg-muted border-none")} />
                    </div>
                    <div>
                        <Label htmlFor="cpf">CPF</Label>
                        <Input id="cpf" value={profileData.cpf} onChange={(e) => setProfileData({...profileData, cpf: e.target.value})} disabled={!isEditing} className={cn(!isEditing && "bg-muted border-none")} />
                    </div>
                </div>
                <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Fechar</Button></DialogClose></DialogFooter>
            </DialogContent>
        );

        if (openModal === 'security' || openModal === 'login-security') return (
            <DialogContent>
                <DialogHeader><DialogTitle>Segurança</DialogTitle></DialogHeader>
                <div className="py-4 text-center">Funcionalidade em desenvolvimento.</div>
                <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Fechar</Button></DialogClose></DialogFooter>
            </DialogContent>
        );

        if (openModal === 'saved-locations') return (
            <DialogContent>
                <DialogHeader><DialogTitle>Adicionar Endereço</DialogTitle></DialogHeader>
                 <div className="py-4">
                    <Label htmlFor="address-input">Endereço de {addressTypeToSet === 'home' ? 'Casa' : 'Trabalho'}</Label>
                    <Input id="address-input" value={addressInput} onChange={(e) => setAddressInput(e.target.value)} />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                    <Button onClick={handleSaveAddress}>Salvar Endereço</Button>
                </DialogFooter>
            </DialogContent>
        );

        if (openModal === 'language') return (
             <DialogContent>
                <DialogHeader><DialogTitle>Idioma</DialogTitle></DialogHeader>
                <div className="py-4">
                    <Select value={language} onValueChange={(value) => changeLanguage(value as 'pt' | 'en')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pt">Português</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter><DialogClose asChild><Button type="button">Confirmar</Button></DialogClose></DialogFooter>
            </DialogContent>
        );
        
        if (openModal === 'communication') return (
            <DialogContent>
                 <DialogHeader><DialogTitle>Preferências de Comunicação</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <Bell className="h-6 w-6 text-muted-foreground mt-1" />
                        <div className="flex-1">
                            <p className="font-medium">Notificações</p>
                            <p className="text-sm text-muted-foreground">Receba atualizações sobre suas viagens</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </div>
                <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Fechar</Button></DialogClose></DialogFooter>
            </DialogContent>
        );

        if (openModal === 'upload-photo') return (
            <DialogContent>
                <DialogHeader><DialogTitle>Alterar Foto</DialogTitle></DialogHeader>
                 <div className="flex flex-col items-center space-y-4 py-4">
                    <div className="w-full max-w-sm aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center relative">
                        <video ref={videoRef} className={cn("w-full h-full object-cover", photoDataUrl && "hidden")} autoPlay muted playsInline />
                        {photoDataUrl && (<img src={photoDataUrl} alt="Sua foto" className="w-full h-full object-cover"/>)}
                         {hasCameraPermission === false && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
                                <Alert variant="destructive"><AlertDescription>Acesso à câmera indisponível.</AlertDescription></Alert>
                            </div>
                        )}
                    </div>
                    <canvas ref={photoRef} className="hidden"></canvas>
                    <input type="file" ref={galleryInputRef} className="hidden" onChange={handleGalleryFileSelect} accept="image/*" />
                    
                    {photoDataUrl ? (
                        <div className="flex flex-col space-y-2 w-full max-w-sm">
                            <Button onClick={handleSavePhoto}>Salvar Foto</Button>
                            <Button variant="ghost" onClick={() => setPhotoDataUrl(null)}>Tirar Outra</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                            <Button onClick={takePhoto} disabled={!hasCameraPermission}><Camera className="mr-2"/> Tirar Foto</Button>
                            <Button variant="outline" onClick={() => galleryInputRef.current?.click()}><Library className="mr-2"/> Galeria</Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        );
        
        if (openModal === 'documents') return (
            <DialogContent>
                <DialogHeader><DialogTitle>Documentos</DialogTitle></DialogHeader>
                 <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6 p-1">
                    <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Documento de Identidade (RG/CPF)</p>
                                <p className="text-sm text-muted-foreground">Para verificação de conta</p>
                            </div>
                             <Badge variant={profileData.identityDocumentUrl ? 'secondary' : 'destructive'} className={cn(profileData.identityDocumentUrl && 'gap-1.5 bg-green-100 text-green-800 border-green-300')}>
                                {profileData.identityDocumentUrl && <CheckSquare className="h-4 w-4"/>}
                                {profileData.identityDocumentUrl ? 'Verificado' : 'Pendente'}
                            </Badge>
                        </div>
                        <input type="file" ref={idInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'identityDocumentUrl')} accept="image/*,.pdf" />
                        <Button variant="outline" className="w-full mt-4" onClick={() => idInputRef.current?.click()}>Enviar novo arquivo</Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Comprovante de Endereço</p>
                                <p className="text-sm text-muted-foreground">Opcional, para segurança</p>
                            </div>
                             <Badge variant={profileData.addressProofUrl ? 'secondary' : 'destructive'} className={cn(profileData.addressProofUrl && 'gap-1.5 bg-green-100 text-green-800 border-green-300')}>
                                {profileData.addressProofUrl && <CheckSquare className="h-4 w-4"/>}
                                {profileData.addressProofUrl ? 'Verificado' : 'Pendente'}
                            </Badge>
                        </div>
                        <input type="file" ref={addressInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'addressProofUrl')} accept="image/*,.pdf" />
                        <Button variant="outline" className="w-full mt-4" onClick={() => addressInputRef.current?.click()}>Enviar novo arquivo</Button>
                    </div>
                </div>
                 </ScrollArea>
                <DialogFooter><DialogClose asChild><Button variant="outline">Fechar</Button></DialogClose></DialogFooter>
            </DialogContent>
        );

        if (openModal === 'history') return (
            <DialogContent>
                 <DialogHeader><DialogTitle>Histórico de Corridas</DialogTitle></DialogHeader>
                 <ScrollArea className="max-h-[60vh]">
                     <div className="space-y-4 p-1">
                         {rideHistory.length > 0 ? (
                            rideHistory.map((ride) => (
                                <div key={ride.id} className="border p-4 rounded-lg space-y-3">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold">{new Date(ride.date).toLocaleDateString('pt-BR')}</p>
                                        <p className="font-bold">{ride.fare.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                    </div>
                                    <Separator/>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-medium text-muted-foreground">De:</span> {ride.pickup}</p>
                                        <p><span className="font-medium text-muted-foreground">Para:</span> {ride.destination}</p>
                                    </div>
                                </div>
                            ))
                         ) : (
                            <p className="text-muted-foreground text-center py-8">Nenhuma corrida no seu histórico ainda.</p>
                         )}
                     </div>
                 </ScrollArea>
                 <DialogFooter><DialogClose asChild><Button variant="outline">Fechar</Button></DialogClose></DialogFooter>
            </DialogContent>
        )

        return null;
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/40">
            <header className="bg-background">
                <div className="container mx-auto px-4 h-16 flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </div>
            </header>
            
            <main className="flex-1 pb-6 container mx-auto px-4">
                {/* Profile Header */}
                <div className="flex flex-col items-center text-center my-6">
                    <div className="relative">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-md" onClick={() => setOpenModal('upload-photo')}>
                            <AvatarImage src={profileData.photoUrl || undefined} data-ai-hint="person avatar" />
                            <AvatarFallback>
                                <User className="h-12 w-12 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                        <button onClick={() => setOpenModal('upload-photo')} className="absolute bottom-0 right-0 h-7 w-7 bg-green-500 rounded-full flex items-center justify-center text-white border-2 border-background">
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold mt-4">{profileData.name}</h1>
                </div>

                {/* Calendar Banner */}
                <Card className="bg-green-100/50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-sm mb-6">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-green-500 text-white h-10 w-10 flex items-center justify-center rounded-lg">
                           <Calendar className="h-6 w-6"/>
                        </div>
                        <p className="flex-1 font-medium text-green-800 dark:text-green-200">
                           Associe o calendário para sugestões personalizadas
                        </p>
                    </CardContent>
                </Card>

                {/* Account Section */}
                <Card className="mb-6">
                    <CardContent className="p-2">
                        {renderMenuItem(<User className="h-5 w-5 text-muted-foreground"/>, "Dados pessoais", () => setOpenModal('personal-data'))}
                        {renderMenuItem(<Shield className="h-5 w-5 text-muted-foreground"/>, "Segurança", () => setOpenModal('security'))}
                        {renderMenuItem(<ShieldCheck className="h-5 w-5 text-muted-foreground"/>, "Login e segurança", () => setOpenModal('login-security'))}
                    </CardContent>
                </Card>

                {/* Saved Locations Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Locais guardados</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        {renderMenuItem(<Home className="h-5 w-5 text-muted-foreground"/>, profileData.homeAddress || "Insira a morada de casa", () => handleOpenAddressModal('home'))}
                        {renderMenuItem(<Briefcase className="h-5 w-5 text-muted-foreground"/>, profileData.workAddress || "Insira a morada do trabalho", () => handleOpenAddressModal('work'))}
                        {renderMenuItem(<Plus className="h-5 w-5 text-muted-foreground"/>, "Adicionar um local", () => toast({title: "Em breve!"}))}
                    </CardContent>
                </Card>
                
                {/* Other Settings Section */}
                 <Card>
                    <CardContent className="p-2">
                        {renderMenuItem(<Globe className="h-5 w-5 text-muted-foreground"/>, "Idioma", () => setOpenModal('language'), language === 'pt' ? 'Português' : 'English')}
                        {renderMenuItem(<Bell className="h-5 w-5 text-muted-foreground"/>, "Preferências de comunicação", () => setOpenModal('communication'))}
                    </CardContent>
                </Card>

                <Button variant="ghost" className="w-full mt-6" onClick={logout}>Sair da conta</Button>
            </main>

            <Dialog open={!!openModal} onOpenChange={(isOpen) => !isOpen && setOpenModal(null)}>
                <ModalContent />
            </Dialog>
        </div>
    );
}

export default withAuth(ProfilePage, ["passenger"]);

    