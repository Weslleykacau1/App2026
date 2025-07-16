
"use client";

import { useState, useEffect, useRef } from "react";
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, User, Mail, Phone, Edit, FileText, Moon, Bell, MapPin, Globe, Share2, EyeOff, Save, Car, Upload, CheckSquare, Camera, Library, LogOut, Settings, ChevronRight, Plus, Shield } from "lucide-react";
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
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useLanguage } from "@/context/language-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { BottomNavBar } from "@/components/bottom-nav-bar";


type ModalType = 'upload-photo' | null;


function DriverProfilePage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();
    const { language, changeLanguage, t } = useLanguage();
    
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [openModal, setOpenModal] = useState<ModalType>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingVehicle, setIsEditingVehicle] = useState(false);


    const [profileData, setProfileData] = useState({ name: '', email: '', phone: '', photoUrl: '', cnhUrl: '', crlvUrl: '' });
    const [vehicleData, setVehicleData] = useState({ model: '', licensePlate: '', color: '', year: '' });

    const videoRef = useRef<HTMLVideoElement>(null);
    const photoRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
    const cnhInputRef = useRef<HTMLInputElement>(null);
    const crlvInputRef = useRef<HTMLInputElement>(null);
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
                    phone: data.phone || '+55 11 98888-7777',
                    photoUrl: data.photoUrl || '',
                    cnhUrl: data.cnhUrl || '',
                    crlvUrl: data.crlvUrl || '',
                });
                setVehicleData({
                    model: data.vehicle_model || 'Toyota Corolla',
                    licensePlate: data.vehicle_license_plate || 'BRA2E19',
                    color: data.vehicle_color || 'Prata',
                    year: data.vehicle_year || '2022',
                });
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
        if (user) {
            fetchProfileData();
        }
    }, [user, language]);

    useEffect(() => {
        setIsDarkMode(theme === 'dark');
    }, [theme]);


     useEffect(() => {
        const videoElement = videoRef.current;
        const stream = videoElement?.srcObject as MediaStream | null;
        
        if (openModal !== 'upload-photo' && stream) {
            stream.getTracks().forEach(track => track.stop());
            if (videoElement) videoElement.srcObject = null;
        }

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
                title: t('toast.camera_denied_title'),
                description: t('toast.camera_denied_desc'),
              });
            }
          };
          getCameraPermission();
          
          return () => {
             if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
          }
        }
    }, [openModal, toast, t]);

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
    
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, documentName: 'cnhUrl' | 'crlvUrl') => {
        const file = event.target.files?.[0];
        if (file && user) {
            // In a real app, you'd upload this to Firebase Storage and get a URL.
            // For now, we'll simulate it with a placeholder.
            const placeholderUrl = `https://placehold.co/800x600.png?text=${documentName}`;
            
            try {
                const docRef = doc(db, "profiles", user.id);
                await updateDoc(docRef, { [documentName]: placeholderUrl });
                setProfileData(prev => ({ ...prev, [documentName]: placeholderUrl }));
                toast({
                    title: t('toast.doc_sent_title'),
                    description: t('toast.doc_sent_desc_driver', { doc: documentName === 'cnhUrl' ? 'CNH' : 'CRLV' }),
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
            });
            toast({ title: t('toast.info_saved_title'), description: t('toast.info_saved_desc') });
            setIsEditingProfile(false);
        } catch (error) {
            toast({ variant: "destructive", title: t('toast.error_title'), description: t('toast.info_save_error_desc') });
        }
    };

    const handleSaveVehicle = async () => {
        if (!user) return;

        try {
            const docRef = doc(db, "profiles", user.id);
            await updateDoc(docRef, {
                vehicle_model: vehicleData.model,
                vehicle_license_plate: vehicleData.licensePlate,
                vehicle_color: vehicleData.color,
                vehicle_year: vehicleData.year,
            });
            toast({ title: t('toast.info_saved_title'), description: t('toast.vehicle_info_saved_desc') });
             setIsEditingVehicle(false);
        } catch (error) {
             toast({ variant: "destructive", title: t('toast.error_title'), description: t('toast.vehicle_info_save_error_desc') });
        }
    }

    const handleSavePhoto = async () => {
        if (!user || !photoDataUrl) return;

        try {
            const docRef = doc(db, "profiles", user.id);
            await updateDoc(docRef, { photoUrl: photoDataUrl });
            setProfileData({ ...profileData, photoUrl: photoDataUrl });
            toast({ title: t('toast.photo_saved_title'), description: t('toast.photo_saved_desc') });
            setPhotoDataUrl(null);
            setOpenModal(null);
        } catch (error) {
            toast({ variant: "destructive", title: t('toast.error_title'), description: t('toast.photo_save_error_desc') });
        }
    }
    
    if (!user || isLoading) {
         return <div className="flex h-screen w-full items-center justify-center">{t('common.loading')}</div>;
    }
    
    const handleCloseModal = () => {
        setOpenModal(null);
    }
    
    const ModalContent = () => {
        switch(openModal) {
             case 'upload-photo':
                return (
                    <DialogContent>
                        <DialogHeader><DialogTitle>{t('profile.change_photo')}</DialogTitle></DialogHeader>
                        <div className="flex flex-col items-center space-y-4 py-4">
                            <div className="w-full max-w-sm aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center relative">
                                <video ref={videoRef} className={cn("w-full h-full object-cover", photoDataUrl && "hidden")} autoPlay muted playsInline />
                                {photoDataUrl && (
                                    <img src={photoDataUrl} alt={t('profile.your_photo_alt')} className="w-full h-full object-cover"/>
                                )}
                                {hasCameraPermission === false && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
                                        <Alert variant="destructive">
                                            <AlertTitle>{t('profile.camera_unavailable_title')}</AlertTitle>
                                            <AlertDescription>{t('profile.camera_unavailable_desc')}</AlertDescription>
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
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline">{t('common.cancel')}</Button></DialogClose>
                        </DialogFooter>
                    </DialogContent>
                );
            default:
                return null;
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/40">
            <main className="flex-1 py-6 container mx-auto px-4 pb-24">
                <div className="flex flex-col items-center text-center">
                     <div className="relative">
                        <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                            <AvatarImage src={profileData.photoUrl || undefined} data-ai-hint="person avatar" />
                            <AvatarFallback>
                                <User className="h-12 w-12 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                         <button onClick={() => setOpenModal('upload-photo')} className="absolute bottom-0 right-0 h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white border-2 border-background">
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                    <h2 className="text-2xl font-bold mt-4">{profileData.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="font-semibold text-muted-foreground">4.8 (Nota)</span>
                    </div>
                        <Badge variant="outline" className="mt-3 bg-blue-100 text-blue-800 border-blue-300">{t('roles.driver')}</Badge>
                        <p className="text-sm text-muted-foreground mt-2">{t('profile.member_since', { date: 'Fevereiro 2023' })}</p>
                </div>

                <Card className="mt-8">
                     <CardHeader className="flex flex-row items-center justify-between">
                         <div>
                            <CardTitle>{t('profile.personal_info')}</CardTitle>
                         </div>
                         {isEditingProfile ? (
                            <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={handleSaveProfile}>
                                <Save className="h-4 w-4"/> {t('common.save')}
                            </Button>
                         ) : (
                            <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={() => setIsEditingProfile(true)}>
                                <Edit className="h-4 w-4"/> {t('common.edit')}
                            </Button>
                         )}
                     </CardHeader>
                     <CardContent className="space-y-4">
                         <div>
                            <Label htmlFor="name">{t('profile.form.full_name')}</Label>
                            <Input id="name" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} disabled={!isEditingProfile} className={cn(!isEditingProfile && "bg-muted border-none")} />
                        </div>
                        <div>
                            <Label htmlFor="email">{t('profile.form.email')}</Label>
                            <Input id="email" type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} disabled={!isEditingProfile} className={cn(!isEditingProfile && "bg-muted border-none")} />
                        </div>
                        <div>
                            <Label htmlFor="phone">{t('profile.form.phone')}</Label>
                            <Input id="phone" type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} disabled={!isEditingProfile} className={cn(!isEditingProfile && "bg-muted border-none")} />
                        </div>
                     </CardContent>
                </Card>

                 <Card className="mt-6">
                     <CardHeader className="flex flex-row items-center justify-between">
                         <div>
                            <CardTitle>{t('profile.vehicle.title')}</CardTitle>
                            <CardDescription>{t('profile.vehicle.description')}</CardDescription>
                         </div>
                         {isEditingVehicle ? (
                            <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={handleSaveVehicle}>
                                <Save className="h-4 w-4"/> {t('common.save')}
                            </Button>
                         ) : (
                            <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={() => setIsEditingVehicle(true)}>
                                <Edit className="h-4 w-4"/> {t('common.edit')}
                            </Button>
                         )}
                     </CardHeader>
                     <CardContent className="space-y-4">
                         <div>
                            <Label htmlFor="model">{t('profile.vehicle.form.model')}</Label>
                            <Input id="model" value={vehicleData.model} onChange={(e) => setVehicleData({...vehicleData, model: e.target.value})} disabled={!isEditingVehicle} className={cn(!isEditingVehicle && "bg-muted border-none")} />
                        </div>
                        <div>
                            <Label htmlFor="license-plate">{t('profile.vehicle.form.license_plate')}</Label>
                            <Input id="license-plate" value={vehicleData.licensePlate} onChange={(e) => setVehicleData({...vehicleData, licensePlate: e.target.value})} disabled={!isEditingVehicle} className={cn(!isEditingVehicle && "bg-muted border-none")} />
                        </div>
                        <div>
                            <Label htmlFor="color">{t('profile.vehicle.form.color')}</Label>
                            <Input id="color" value={vehicleData.color} onChange={(e) => setVehicleData({...vehicleData, color: e.target.value})} disabled={!isEditingVehicle} className={cn(!isEditingVehicle && "bg-muted border-none")} />
                        </div>
                        <div>
                            <Label htmlFor="year">{t('profile.vehicle.form.year')}</Label>
                            <Input id="year" type="number" value={vehicleData.year} onChange={(e) => setVehicleData({...vehicleData, year: e.target.value})} disabled={!isEditingVehicle} className={cn(!isEditingVehicle && "bg-muted border-none")} />
                        </div>
                     </CardContent>
                </Card>


                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>{t('profile.documents.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{t('profile.documents.cnh_title')}</p>
                                    <p className="text-sm text-muted-foreground">{t('profile.documents.cnh_desc')}</p>
                                </div>
                                <Badge variant={profileData.cnhUrl ? 'secondary' : 'destructive'} className={cn(profileData.cnhUrl && 'gap-1.5 bg-green-100 text-green-800 border-green-300')}>
                                    {profileData.cnhUrl && <CheckSquare className="h-4 w-4"/>}
                                    {profileData.cnhUrl ? t('profile.documents.status_verified') : t('profile.documents.status_pending')}
                                </Badge>
                            </div>
                            <input type="file" ref={cnhInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'cnhUrl')} accept="image/*,.pdf" />
                            <Button variant="outline" className="w-full mt-4 gap-2" onClick={() => cnhInputRef.current?.click()}><Upload className="h-4 w-4"/> {t('profile.documents.upload_btn')}</Button>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{t('profile.documents.crlv_title')}</p>
                                    <p className="text-sm text-muted-foreground">{t('profile.documents.crlv_desc')}</p>
                                </div>
                                    <Badge variant={profileData.crlvUrl ? 'secondary' : 'destructive'} className={cn(profileData.crlvUrl && 'gap-1.5 bg-green-100 text-green-800 border-green-300')}>
                                    {profileData.crlvUrl && <CheckSquare className="h-4 w-4"/>}
                                    {profileData.crlvUrl ? t('profile.documents.status_verified') : t('profile.documents.status_pending')}
                                </Badge>
                            </div>
                            <input type="file" ref={crlvInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'crlvUrl')} accept="image/*,.pdf" />
                            <Button variant="outline" className="w-full mt-4 gap-2" onClick={() => crlvInputRef.current?.click()}><Upload className="h-4 w-4"/> {t('profile.documents.upload_btn')}</Button>
                        </div>
                    </CardContent>
                </Card>
                
                 <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Configurações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <Moon className="h-6 w-6 text-muted-foreground mt-1" />
                            <div className="flex-1">
                                <p className="font-medium">{t('profile.settings.dark_mode')}</p>
                                <p className="text-sm text-muted-foreground">{t('profile.settings.dark_mode_desc')}</p>
                            </div>
                            <Switch checked={isDarkMode} onCheckedChange={handleThemeChange} />
                        </div>
                        <Separator />
                        <div className="flex items-start justify-between gap-4">
                            <Bell className="h-6 w-6 text-muted-foreground mt-1" />
                            <div className="flex-1">
                                <p className="font-medium">{t('profile.settings.notification_sounds')}</p>
                                <p className="text-sm text-muted-foreground">{t('profile.settings.notification_sounds_desc')}</p>
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
                            </div>
                            <Select value={language} onValueChange={(value) => changeLanguage(value as 'pt' | 'en')}>
                                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pt">Português</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                     <CardHeader>
                        <CardTitle>{t('profile.settings.privacy_title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                            <Switch />
                        </div>
                    </CardContent>
                </Card>
                
                <div className="mt-8">
                     <Button variant="ghost" className="w-full h-auto justify-center items-center py-4 px-2 text-destructive hover:text-destructive" onClick={logout}>
                        <div className="flex items-center gap-4">
                           <LogOut className="h-5 w-5" />
                           <p className="font-semibold">Terminar Sessão</p>
                        </div>
                    </Button>
                </div>
            </main>
            
            <Dialog open={!!openModal} onOpenChange={(isOpen) => !isOpen && handleCloseModal()}>
                <ModalContent />
            </Dialog>
             <BottomNavBar role="driver" />
        </div>
    );
}

export default withAuth(DriverProfilePage, ["driver"]);
