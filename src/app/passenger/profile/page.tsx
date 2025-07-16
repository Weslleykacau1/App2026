
"use client";

import { useState, useEffect, useRef } from "react";
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Star, User, Mail, Phone, Edit, FileText, Moon, Bell, MapPin, Globe, Share2, EyeOff, Save, LogOut, Camera, Library, Settings, History, MoreVertical, MessageCircle, AlertCircle, RefreshCcw, CheckSquare } from "lucide-react";
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

function ProfilePage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();
    const { language, changeLanguage, t } = useLanguage();

    const [profileData, setProfileData] = useState({ name: '', email: '', phone: '', cpf: '', photoUrl: '', identityDocumentUrl: '', addressProofUrl: '' });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const idInputRef = useRef<HTMLInputElement>(null);
    const addressInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("profile");
    const videoRef = useRef<HTMLVideoElement>(null);
    const photoRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const fetchProfileData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const docRef = doc(db, "profiles", user.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setProfileData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '+55 11 99999-8888',
                    cpf: data.cpf || '123.456.789-00',
                    photoUrl: data.photoUrl || '',
                    identityDocumentUrl: data.identityDocumentUrl || '',
                    addressProofUrl: data.addressProofUrl || '',
                });
            } else {
                 throw new Error("Perfil não encontrado.");
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
            toast({
                variant: "destructive",
                title: t('toast.profile_load_error_title'),
                description: t('toast.profile_load_error_desc'),
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        setIsDarkMode(theme === 'dark');
        fetchProfileData();
    }, [theme, t]);

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
                title: t('toast.camera_denied_title'),
                description: t('toast.camera_denied_desc'),
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
    }, [activeTab, toast, t]);

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
    
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, documentName: 'identityDocumentUrl' | 'addressProofUrl') => {
        const file = event.target.files?.[0];
        if (file && user) {
            const placeholderUrl = `https://placehold.co/800x600.png?text=${documentName}`;
            try {
                const docRef = doc(db, "profiles", user.id);
                await updateDoc(docRef, { [documentName]: placeholderUrl });
                setProfileData(prev => ({ ...prev, [documentName]: placeholderUrl }));
                toast({
                    title: t('toast.doc_sent_title'),
                    description: t('toast.doc_sent_desc_passenger'),
                });
            } catch (error) {
                toast({ variant: "destructive", title: t('toast.error_title'), description: t('toast.doc_send_error_desc') });
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
            toast({ title: t('toast.info_saved_title'), description: t('toast.info_saved_desc') });
        } catch (error) {
            toast({ variant: "destructive", title: t('toast.error_title'), description: t('toast.info_save_error_desc') });
        }
        setIsEditing(false);
    }

    const handleSavePhoto = async () => {
        if (!user || !photoDataUrl) return;

        try {
            const docRef = doc(db, "profiles", user.id);
            await updateDoc(docRef, { photoUrl: photoDataUrl });
            setProfileData({ ...profileData, photoUrl: photoDataUrl });
            toast({ title: t('toast.photo_saved_title'), description: t('toast.photo_saved_desc') });
            setPhotoDataUrl(null);
            setActiveTab('profile');
        } catch (error) {
            toast({ variant: "destructive", title: t('toast.error_title'), description: t('toast.photo_save_error_desc') });
        }
    }
    
    const handleRequestAgain = (ride: typeof rideHistory[0]) => {
        if (ride.status === 'Cancelada') {
             toast({
                variant: 'destructive',
                title: t('toast.reride_cancelled_title'),
                description: t('toast.reride_cancelled_desc'),
            })
            return;
        }
        setItem(RERIDE_REQUEST_KEY, { pickup: ride.pickup, destination: ride.destination });
        router.push('/passenger');
    }

    if (!user || isLoading) {
      return <div className="flex h-screen w-full items-center justify-center">{t('common.loading')}</div>;
    }


    if (activeTab === 'upload-photo') {
        return (
            <div className="flex flex-col min-h-screen bg-muted/40">
                <header className="sticky top-0 z-10 bg-background border-b shadow-sm">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <Button variant="ghost" size="icon" onClick={() => setActiveTab('profile')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-semibold">{t('profile.change_photo')}</h1>
                        <div className="w-9 h-9"></div>
                    </div>
                </header>
                <main className="flex-1 py-6 container mx-auto px-4">
                     <div className="flex flex-col items-center space-y-4">
                        <div className="w-full max-w-sm aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center relative">
                            <video ref={videoRef} className={cn("w-full h-full object-cover", photoDataUrl && "hidden")} autoPlay muted playsInline />
                            {photoDataUrl && (
                                <img src={photoDataUrl} alt={t('profile.your_photo_alt')} className="w-full h-full object-cover"/>
                            )}
                             {!(hasCameraPermission) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
                                    <Alert variant="destructive">
                                        <AlertTitle>{t('profile.camera_unavailable_title')}</AlertTitle>
                                        <AlertDescription>
                                            {t('profile.camera_unavailable_desc')}
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}
                        </div>
                        <canvas ref={photoRef} className="hidden"></canvas>
                        <input type="file" ref={galleryInputRef} className="hidden" onChange={handleGalleryFileSelect} accept="image/*" />

                        
                        {photoDataUrl ? (
                            <div className="flex flex-col space-y-2 w-full max-w-sm">
                                <Button onClick={handleSavePhoto}>{t('profile.save_photo')}</Button>
                                <Button variant="ghost" onClick={() => setPhotoDataUrl(null)}>{t('profile.take_another')}</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                                <Button onClick={takePhoto} disabled={!hasCameraPermission}>
                                    <Camera className="mr-2"/> {t('profile.take_photo_btn')}
                                </Button>
                                <Button variant="outline" onClick={() => galleryInputRef.current?.click()}>
                                    <Library className="mr-2"/> {t('profile.choose_from_gallery')}
                                </Button>
                            </div>
                        )}
                        { !photoDataUrl && <Button variant="ghost" onClick={() => setActiveTab('profile')}>{t('common.cancel')}</Button> }
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
                    <h1 className="text-lg font-semibold">{t('profile.title')}</h1>
                    <Button variant="ghost" size="icon" onClick={logout}>
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </header>
            
            <main className="flex-1 py-6 container mx-auto px-4">
                 <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4 bg-muted/60 rounded-lg p-1">
                        <TabsTrigger value="profile">{t('profile.tabs.profile')}</TabsTrigger>
                        <TabsTrigger value="history">{t('profile.tabs.history')}</TabsTrigger>
                        <TabsTrigger value="documents">{t('profile.tabs.documents')}</TabsTrigger>
                        <TabsTrigger value="settings"><Settings/></TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile" className="mt-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                                    <AvatarImage src={profileData.photoUrl || undefined} data-ai-hint="person avatar" />
                                    <AvatarFallback>
                                        <User className="h-12 w-12 text-muted-foreground" />
                                    </AvatarFallback>
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
                             <Badge variant="outline" className="mt-3 bg-blue-100 text-blue-800 border-blue-300">{t('roles.passenger')}</Badge>
                             <p className="text-sm text-muted-foreground mt-2">{t('profile.member_since', { date: 'Janeiro 2023' })}</p>
                        </div>

                        <Card className="mt-8">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold">{t('profile.personal_info')}</h3>
                                    <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}>
                                        {isEditing ? <Save className="h-4 w-4"/> : <Edit className="h-4 w-4"/>}
                                        {isEditing ? t('common.save') : t('common.edit')}
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">{t('profile.form.full_name')}</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="name" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} disabled={!isEditing} className={cn("pl-10", !isEditing && "bg-muted border-none")} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="email">{t('profile.form.email')}</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="email" type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} disabled={!isEditing} className={cn("pl-10", !isEditing && "bg-muted border-none")} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">{t('profile.form.phone')}</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="phone" type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} disabled={!isEditing} className={cn("pl-10", !isEditing && "bg-muted border-none")} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="cpf">{t('profile.form.cpf')}</Label>
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
                                    <CardTitle className="text-lg flex items-center gap-2"><History/> {t('profile.history.title')}</CardTitle>
                                    <CardDescription>{t('profile.history.description')}</CardDescription>
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
                                                         <Badge variant={ride.status === 'Concluída' ? 'secondary' : 'destructive'}>{t(`profile.history.status.${ride.status.toLowerCase()}`)}</Badge>
                                                    </div>
                                                </div>
                                                <Separator/>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 mt-1 text-primary"/>
                                                        <p><span className="font-medium text-muted-foreground">{t('profile.history.from')}:</span> {ride.pickup}</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 mt-1 text-red-500"/>
                                                         <p><span className="font-medium text-muted-foreground">{t('profile.history.to')}:</span> {ride.destination}</p>
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
                                                    {t('profile.history.request_again_btn')}
                                                </Button>
                                            </div>
                                        ))
                                     ) : (
                                        <p className="text-muted-foreground text-center py-8">{t('profile.history.no_rides')}</p>
                                     )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="documents">
                        <div className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">{t('profile.documents.title')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{t('profile.documents.id_title')}</p>
                                                <p className="text-sm text-muted-foreground">{t('profile.documents.id_desc')}</p>
                                            </div>
                                             <Badge variant={profileData.identityDocumentUrl ? 'secondary' : 'destructive'} className={cn(profileData.identityDocumentUrl && 'gap-1.5 bg-green-100 text-green-800 border-green-300')}>
                                                {profileData.identityDocumentUrl && <CheckSquare className="h-4 w-4"/>}
                                                {profileData.identityDocumentUrl ? t('profile.documents.status_verified') : t('profile.documents.status_pending')}
                                            </Badge>
                                        </div>
                                        <input type="file" ref={idInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'identityDocumentUrl')} accept="image/*,.pdf" />
                                        <Button variant="outline" className="w-full mt-4" onClick={() => idInputRef.current?.click()}>{t('profile.documents.upload_btn')}</Button>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{t('profile.documents.address_proof_title')}</p>
                                                <p className="text-sm text-muted-foreground">{t('profile.documents.address_proof_desc')}</p>
                                            </div>
                                             <Badge variant={profileData.addressProofUrl ? 'secondary' : 'destructive'} className={cn(profileData.addressProofUrl && 'gap-1.5 bg-green-100 text-green-800 border-green-300')}>
                                                {profileData.addressProofUrl && <CheckSquare className="h-4 w-4"/>}
                                                {profileData.addressProofUrl ? t('profile.documents.status_verified') : t('profile.documents.status_pending')}
                                            </Badge>
                                        </div>
                                        <input type="file" ref={addressInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'addressProofUrl')} accept="image/*,.pdf" />
                                        <Button variant="outline" className="w-full mt-4" onClick={() => addressInputRef.current?.click()}>{t('profile.documents.upload_btn')}</Button>
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
                                                <p className="font-medium">{t('profile.settings.dark_mode')}</p>
                                                <p className="text-sm text-muted-foreground">{t('profile.settings.dark_mode_desc')}</p>
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
                                                <p className="font-medium">{t('profile.settings.notifications')}</p>
                                                <p className="text-sm text-muted-foreground">{t('profile.settings.notifications_desc')}</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                        <Separator />
                                        <div className="flex items-start justify-between gap-4">
                                            <MapPin className="h-6 w-6 text-muted-foreground mt-1" />
                                            <div className="flex-1">
                                                <p className="font-medium">{t('profile.settings.location')}</p>
                                                <p className="text-sm text-muted-foreground">{t('profile.settings.location_desc')}</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between gap-4">
                                            <Globe className="h-6 w-6 text-muted-foreground" />
                                            <div className="flex-1">
                                                <p className="font-medium">{t('profile.settings.language')}</p>
                                                <p className="text-sm text-muted-foreground">{t('profile.settings.language_desc')}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Select value={language} onValueChange={(value) => changeLanguage(value as 'pt' | 'en')}>
                                                    <SelectTrigger className="w-[120px]">
                                                        <SelectValue placeholder="Idioma" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pt">Português</SelectItem>
                                                        <SelectItem value="en">English</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">{t('profile.settings.privacy_title')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                     <div className="space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <Share2 className="h-6 w-6 text-muted-foreground mt-1" />
                                            <div className="flex-1">
                                                <p className="font-medium">{t('profile.settings.privacy_share_data')}</p>
                                                <p className="text-sm text-muted-foreground">{t('profile.settings.privacy_share_data_desc')}</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                        <Separator />
                                        <div className="flex items-start justify-between gap-4">
                                            <EyeOff className="h-6 w-6 text-muted-foreground mt-1" />
                                            <div className="flex-1">
                                                <p className="font-medium">{t('profile.settings.privacy_visibility')}</p>
                                                <p className="text-sm text-muted-foreground">{t('profile.settings.privacy_visibility_desc')}</p>
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

    
