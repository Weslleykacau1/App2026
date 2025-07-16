
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, Mail, Phone, Edit, FileText, Moon, Bell, MapPin, Globe, Share2, EyeOff, Save, LogOut, Camera, Library, Settings, History, Shield, ShieldCheck, Home, Briefcase, Plus, Calendar, ChevronRight, Upload, CheckSquare } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getItem, setItem } from "@/lib/storage";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useLanguage } from "@/context/language-context";
import { BottomNavBar } from "@/components/bottom-nav-bar";

const RERIDE_REQUEST_KEY = 'reride_request';

type ModalType = 'saved-locations' | 'upload-photo' | null;
type AddressType = 'home' | 'work';

function ProfilePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, logout, fetchUserProfile } = useAuth();
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();
    const { language, changeLanguage, t } = useLanguage();
    const [isDarkMode, setIsDarkMode] = useState(false);

    const [profileData, setProfileData] = useState({ name: '', email: '', phone: '', cpf: '', photoUrl: '', identityDocumentUrl: '', addressProofUrl: '', homeAddress: '', workAddress: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [openModal, setOpenModal] = useState<ModalType>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    
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
        if (user) {
            fetchProfileData();
        }
    }, [user, language]);
    
     useEffect(() => {
        setIsDarkMode(theme === 'dark');
    }, [theme]);


     useEffect(() => {
        const videoElement = videoRef.current;
        let stream: MediaStream | null = null;
        if (videoElement) {
            stream = videoElement.srcObject as MediaStream | null;
        }

        const stopStream = () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                if(videoElement) videoElement.srcObject = null;
            }
        };

        if (openModal !== 'upload-photo') {
            stopStream();
        } else {
            const getCameraPermission = async () => {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
        }

        return () => {
            stopStream();
        };
    }, [openModal, toast]);

    const takePhoto = () => {
        const video = videoRef.current;
        const photo = photoRef.current;

        if (video && photo) {
            const size = Math.min(video.videoWidth, video.videoHeight);
            const x = (video.videoWidth - size) / 2;
            const y = (video.videoHeight - size) / 2;
        
            photo.width = 300;
            photo.height = 300;

            const context = photo.getContext('2d');
            if (context) {
                context.drawImage(video, x, y, size, size, 0, 0, 300, 300);
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
             setIsEditingProfile(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar as informações." });
        }
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
    
    const handleOpenAddressModal = (type: AddressType) => {
        setAddressTypeToSet(type);
        setAddressInput(type === 'home' ? profileData.homeAddress : profileData.workAddress);
        setOpenModal('saved-locations');
    };
    
    const handleThemeChange = (checked: boolean) => {
        const newTheme = checked ? 'dark' : 'light';
        setTheme(newTheme);
        setIsDarkMode(checked);
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
            setOpenModal(null);
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
    
    const handleCloseModal = () => {
        setOpenModal(null);
    }


    const ModalContent = () => {
        if (openModal === 'upload-photo') return (
            <Dialog open={openModal === 'upload-photo'} onOpenChange={(isOpen) => !isOpen && handleCloseModal()}>
                 <DialogContent>
                    <DialogHeader><DialogTitle>Alterar Foto</DialogTitle></DialogHeader>
                    <div className="flex flex-col items-center space-y-4 py-4">
                        <div className="w-full max-w-sm aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center relative">
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
            </Dialog>
        );
        
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/40">
            <main className="flex-1 pb-24 container mx-auto px-4">
                <div className="flex flex-col items-center text-center my-6">
                    <div className="relative">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                           <AvatarImage src={profileData.photoUrl || undefined} data-ai-hint="person avatar" />
                            <AvatarFallback>
                                <User className="h-12 w-12 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                        <button onClick={() => setOpenModal('upload-photo')} className="absolute bottom-0 right-0 h-7 w-7 bg-primary rounded-full flex items-center justify-center text-white border-2 border-background">
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold mt-4">{profileData.name}</h1>
                </div>

                <Card className="bg-blue-100/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm mb-6">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-blue-500 text-white h-10 w-10 flex items-center justify-center rounded-lg">
                           <ShieldCheck className="h-6 w-6"/>
                        </div>
                        <p className="flex-1 font-medium text-blue-800 dark:text-blue-200">
                           Lembre-se de usar sempre o cinto de segurança.
                        </p>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                     <CardHeader className="flex flex-row items-center justify-between">
                         <div>
                            <CardTitle>Dados pessoais</CardTitle>
                         </div>
                         {isEditingProfile ? (
                            <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={handleSaveProfile}>
                                <Save className="h-4 w-4"/> Salvar
                            </Button>
                         ): (
                                <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={() => setIsEditingProfile(true)}>
                                <Edit className="h-4 w-4"/> Editar
                            </Button>
                        )}
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input id="name" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} disabled={!isEditingProfile} className={cn(!isEditingProfile && "bg-muted border-none")} />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} disabled={!isEditingProfile} className={cn(!isEditingProfile && "bg-muted border-none")} />
                        </div>
                        <div>
                            <Label htmlFor="phone">Whatsapp</Label>
                            <Input id="phone" type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} disabled={!isEditingProfile} className={cn(!isEditingProfile && "bg-muted border-none")} />
                        </div>
                        <div>
                            <Label htmlFor="cpf">CPF</Label>
                            <Input id="cpf" value={profileData.cpf} onChange={(e) => setProfileData({...profileData, cpf: e.target.value})} disabled={!isEditingProfile} className={cn(!isEditingProfile && "bg-muted border-none")} />
                        </div>
                     </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Documentos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                </Card>

                <Card className="mb-6">
                     <CardHeader>
                        <CardTitle>Histórico de Viagens</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        {renderMenuItem(<History className="h-5 w-5 text-muted-foreground" />, "Ver seu histórico completo", () => router.push('/passenger/history'))}
                    </CardContent>
                </Card>

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
                
                 <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Configurações</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-4">
                                <Moon className="h-5 w-5 text-muted-foreground"/>
                                <p className="font-semibold">Modo escuro</p>
                            </div>
                            <Switch checked={isDarkMode} onCheckedChange={handleThemeChange} />
                        </div>
                         <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-4">
                                <Globe className="h-5 w-5 text-muted-foreground"/>
                                <p className="font-semibold">Idioma</p>
                            </div>
                             <Select value={language} onValueChange={(value) => changeLanguage(value as 'pt' | 'en')}>
                                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pt">Português</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between py-4">
                           <div className="flex items-center gap-4">
                                <Bell className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="font-semibold">Notificações</p>
                                </div>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardContent className="p-2">
                        {renderMenuItem(<LogOut className="h-5 w-5 text-destructive"/>, "Terminar sessão", logout)}
                    </CardContent>
                </Card>
            </main>

            <Sheet open={openModal === 'saved-locations'} onOpenChange={(isOpen) => !isOpen && handleCloseModal()}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Adicionar Endereço</SheetTitle>
                        <SheetDescription>
                            Adicione ou edite seus endereços salvos para um acesso mais rápido.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="py-4">
                        <Label htmlFor="address-input">Endereço de {addressTypeToSet === 'home' ? 'Casa' : 'Trabalho'}</Label>
                        <Input id="address-input" value={addressInput} onChange={(e) => setAddressInput(e.target.value)} />
                    </div>
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button type="button" variant="outline">Cancelar</Button>
                        </SheetClose>
                        <Button onClick={handleSaveAddress}>Salvar Endereço</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <ModalContent />
            <BottomNavBar role="passenger" />
        </div>
    );
}


export default function ProfilePage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <ProfilePageContent />
        </Suspense>
    )
}

    