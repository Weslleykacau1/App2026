
"use client";

import { useState, useEffect } from "react";
import { withAuth } from "@/components/with-auth";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Car, DollarSign, ShieldCheck, MoreHorizontal, FileCheck2, AlertCircle, X, Check, FileText, Settings, Save, UserPlus, Moon, ThumbsUp, ThumbsDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MapGL, { Marker } from 'react-map-gl';
import { useTheme } from 'next-themes';
import { getItem, setItem } from "@/lib/storage";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";


type UserRole = "passageiro" | "motorista" | "admin";
type UserStatus = "Ativo" | "Suspenso";
type VerificationStatus = "Verificado" | "Pendente" | "Rejeitado";

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joined: string;
  verification: VerificationStatus;
}

interface OnlineDriver {
    id: number;
    name: string;
    lat: number;
    lng: number;
}

const addUserFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
  role: z.enum(["passenger", "driver", "admin"], {
    required_error: "Você precisa selecionar um perfil.",
  }),
});


const initialUsers: User[] = [
  { id: 1, name: "Passageiro Padrão", email: "passenger@tridriver.com", role: "passageiro", status: "Ativo", joined: "2024-01-01", verification: "Verificado" },
  { id: 2, name: "Motorista Padrão", email: "driver@tridriver.com", role: "motorista", status: "Ativo", joined: "2024-01-01", verification: "Verificado" },
  { id: 3, name: "Admin Padrão", email: "admin@tridriver.com", role: "admin", status: "Ativo", joined: "2024-01-01", verification: "Verificado" },
  { id: 4, name: "Weslley Kacau", email: "weslley.kacau@gmail.com", role: "admin", status: "Ativo", joined: "2024-07-25", verification: "Verificado" },
];

const initialRevenueData = [
  { name: "Jan", total: 0 },
  { name: "Fev", total: 0 },
  { name: "Mar", total: 0 },
  { name: "Abr", total: 0 },
  { name: "Mai", total: 0 },
  { name: "Jun", total: 0 },
  { name: "Jul", total: 0 },
  { name: "Ago", total: 0 },
  { name: "Set", total: 0 },
  { name: "Out", total: 0 },
  { name: "Nov", total: 0 },
  { name: "Dez", total: 0 },
];

const roleTranslations: { [key in UserRole]: string } = {
  passageiro: "Passageiro",
  motorista: "Motorista",
  admin: "Admin",
};

const verificationIcons: { [key in VerificationStatus]: React.ReactNode } = {
    "Verificado": <FileCheck2 className="h-5 w-5 text-green-500" />,
    "Pendente": <AlertCircle className="h-5 w-5 text-yellow-500" />,
    "Rejeitado": <AlertCircle className="h-5 w-5 text-red-500" />,
};

const ADMIN_USERS_KEY = 'admin_users_data';
const ADMIN_FARES_KEY = 'admin_fares_data';


function AdminDashboard() {
  const [revenueData, setRevenueData] = useState(initialRevenueData);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [onlineDrivers, setOnlineDrivers] = useState<OnlineDriver[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [fares, setFares] = useState({ comfort: "1.80", executive: "2.20" });
  const { toast } = useToast();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const form = useForm<z.infer<typeof addUserFormSchema>>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "passenger",
    },
  });
  
  useEffect(() => {
    setIsDarkMode(theme === 'dark');
    const savedUsers = getItem<User[]>(ADMIN_USERS_KEY);
    if (savedUsers) {
        setUsers(savedUsers);
    } else {
        setUsers(initialUsers); // Set initial users if none are saved
    }
    const savedFares = getItem<{ comfort: string, executive: string }>(ADMIN_FARES_KEY);
    if (savedFares) {
        setFares(savedFares);
    }
  }, [theme]);

  useEffect(() => {
    // Generate revenue data
    const generatedData = initialRevenueData.map(item => ({
      ...item,
      total: Math.floor(Math.random() * 5000) + 1000
    }));
    setRevenueData(generatedData);
    
    // Set online drivers based on the main users list
    const activeDrivers = users
        .filter(u => u.role === 'motorista' && u.status === 'Ativo')
        .map(driver => ({
            id: driver.id,
            name: driver.name,
            lat: -3.7327 + (Math.random() - 0.5) * 0.05,
            lng: -38.5267 + (Math.random() - 0.5) * 0.05,
        }));
    setOnlineDrivers(activeDrivers);

    // Simulate real-time driver location updates
    const interval = setInterval(() => {
        setOnlineDrivers(drivers => 
            drivers.map(driver => ({
                ...driver,
                lat: driver.lat + (Math.random() - 0.5) * 0.001,
                lng: driver.lng + (Math.random() - 0.5) * 0.001,
            }))
        );
    }, 3000);

    return () => clearInterval(interval);

  }, [users]);

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light';
    setTheme(newTheme);
    setIsDarkMode(checked);
  };

  const handleOpenDocuments = (user: User) => {
    if (user.role === 'admin') {
         toast({
            variant: "default",
            title: "Não aplicável",
            description: "Administradores não possuem documentos para verificação.",
        });
        return;
    }
    setSelectedUser(user);
    setIsDocsModalOpen(true);
  };
  
  const handleVerification = (userId: number, newStatus: VerificationStatus) => {
    const updatedUsers = users.map(user => user.id === userId ? { ...user, verification: newStatus } : user);
    setUsers(updatedUsers);
    setItem(ADMIN_USERS_KEY, updatedUsers);
    setIsDocsModalOpen(false);
    toast({
        title: "Status de verificação atualizado!",
        description: `O usuário foi marcado como ${newStatus.toLowerCase()}.`,
    });
  };

  const handleFareChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'comfort' | 'executive') => {
    setFares({ ...fares, [category]: e.target.value });
  };

  const handleSaveFares = () => {
    setItem(ADMIN_FARES_KEY, fares);
    toast({
      title: "Tarifas Salvas!",
      description: `Comfort: R$${fares.comfort}/km, Executive: R$${fares.executive}/km`,
    });
  };
  
  const handleAddUserSubmit = (values: z.infer<typeof addUserFormSchema>) => {
    const newUser: User = {
        id: users.length + 1,
        name: values.name,
        email: values.email,
        role: values.role as UserRole,
        status: "Ativo",
        joined: new Date().toISOString().split('T')[0],
        verification: "Pendente"
    }
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setItem(ADMIN_USERS_KEY, updatedUsers);
    setIsAddUserModalOpen(false);
    form.reset();
    toast({
        title: "Usuário Adicionado!",
        description: `${values.name} foi adicionado ao sistema.`,
    });
  };

  const mapStyle = resolvedTheme === 'dark' 
    ? 'mapbox://styles/mapbox/dark-v11' 
    : 'mapbox://styles/mapbox/streets-v12';

  return (
    <AppLayout>
      <TooltipProvider>
      <div className="container mx-auto py-8">
        <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Painel do Administrador</h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">+1 este mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Motoristas Online</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onlineDrivers.length}</div>
              <p className="text-xs text-muted-foreground">Em tempo real</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 1.2M</div>
              <p className="text-xs text-muted-foreground">+5.2% este mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins Ativos</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
              <p className="text-xs text-muted-foreground">Administradores do Sistema</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Gerenciamento de Usuários</CardTitle>
                        <CardDescription>Visualize, edite e gerencie todos os usuários no sistema.</CardDescription>
                    </div>
                    <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
                        <DialogTrigger asChild>
                             <Button>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Adicionar Usuário
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                                <DialogDescription>
                                    Preencha os detalhes abaixo para criar uma nova conta de usuário.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleAddUserSubmit)} className="space-y-4">
                                     <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome Completo</FormLabel>
                                            <FormControl>
                                            <Input placeholder="Ex: João da Silva" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                            <Input type="email" placeholder="Ex: joao.silva@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Senha Temporária</FormLabel>
                                            <FormControl>
                                            <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="role"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Função</FormLabel>
                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione um perfil" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="passenger">Passageiro</SelectItem>
                                                    <SelectItem value="driver">Motorista</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                     <DialogFooter className="pt-4">
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline">Cancelar</Button>
                                        </DialogClose>
                                        <Button type="submit">Criar Usuário</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                      <TableHead><span className="sr-only">Menu</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person avatar" />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : user.role === 'motorista' ? 'secondary' : 'outline'}>
                            {roleTranslations[user.role as UserRole] || user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                           <Tooltip>
                                <TooltipTrigger>
                                     <div className="flex items-center gap-2">
                                        <Badge variant={user.verification === 'Verificado' ? 'secondary' : user.verification === 'Pendente' ? 'default' : 'destructive'}>
                                            {user.verification}
                                        </Badge>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{user.verification}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TableCell>
                         <TableCell>
                            {user.verification === 'Pendente' ? (
                                <div className="flex gap-2 justify-center">
                                    <Button size="sm" variant="destructive" onClick={() => handleVerification(user.id, 'Rejeitado')}>
                                        <ThumbsDown className="mr-2 h-4 w-4"/> Rejeitar
                                    </Button>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleVerification(user.id, 'Verificado')}>
                                       <ThumbsUp className="mr-2 h-4 w-4"/> Aprovar
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground">-</div>
                            )}
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Abrir menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleOpenDocuments(user)}>
                                        Ver Documentos
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>Editar</DropdownMenuItem>
                                    <DropdownMenuItem>Suspender</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <div>
                        <CardTitle>Motoristas Online</CardTitle>
                        <CardDescription>Localização dos motoristas em tempo real.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="h-[460px] w-full relative rounded-b-lg overflow-hidden">
                        {mapboxToken ? (
                            <MapGL
                                mapboxAccessToken={mapboxToken}
                                initialViewState={{
                                longitude: -38.5267,
                                latitude: -3.7327,
                                zoom: 12
                                }}
                                style={{ width: '100%', height: '100%' }}
                                mapStyle={mapStyle}
                            >
                                {onlineDrivers.map(driver => (
                                    <Marker key={driver.id} longitude={driver.lng} latitude={driver.lat}>
                                        <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-lg">
                                            <Car className="h-5 w-5 text-primary"/>
                                        </div>
                                    </Marker>
                                ))}
                            </MapGL>
                        ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                <p className="text-muted-foreground text-center p-4">
                                O token do Mapbox não está configurado.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Receita Mensal</CardTitle>
                    <CardDescription>Visão geral da receita nos últimos meses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={revenueData}>
                            <XAxis
                                dataKey="name"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `R$${value / 1000}k`}
                            />
                            <RechartsTooltip
                                cursor={{ fill: 'hsl(var(--muted))' }}
                                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                            />
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Tarifas por Categoria</CardTitle>
                        <CardDescription>Defina o valor por km para cada categoria de viagem.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 items-center gap-4">
                            <Label htmlFor="comfort-fare">Comfort (R$/km)</Label>
                            <Input id="comfort-fare" type="number" value={fares.comfort} onChange={(e) => handleFareChange(e, 'comfort')} step="0.01" />
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <Label htmlFor="executive-fare">Executive (R$/km)</Label>
                            <Input id="executive-fare" type="number" value={fares.executive} onChange={(e) => handleFareChange(e, 'executive')} step="0.01" />
                        </div>
                            <Button onClick={handleSaveFares} className="w-full">
                            <Save className="mr-2 h-4 w-4" /> Salvar Tarifas
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Configurações do Painel</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
       {selectedUser && (
            <Dialog open={isDocsModalOpen} onOpenChange={setIsDocsModalOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Documentos de {selectedUser.name}</DialogTitle>
                        <CardDescription>
                            Verifique os documentos enviados pelo usuário.
                             <Badge variant={selectedUser.verification === 'Verificado' ? 'secondary' : selectedUser.verification === 'Pendente' ? 'default' : 'destructive'} className="ml-2">
                                {selectedUser.verification}
                            </Badge>
                        </CardDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        {selectedUser.role === 'motorista' && (
                            <>
                                <div className="space-y-2">
                                    <h4 className="font-semibold">CNH (Carteira de Motorista)</h4>
                                     <a href="https://placehold.co/800x600.png" target="_blank" rel="noopener noreferrer">
                                        <Image src="https://placehold.co/800x600.png" data-ai-hint="document license" alt="CNH" width={800} height={600} className="rounded-lg border aspect-[4/3] object-cover" />
                                     </a>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold">CRLV (Documento do Veículo)</h4>
                                    <a href="https://placehold.co/800x600.png" target="_blank" rel="noopener noreferrer">
                                        <Image src="https://placehold.co/800x600.png" data-ai-hint="document registration" alt="CRLV" width={800} height={600} className="rounded-lg border aspect-[4/3] object-cover" />
                                    </a>
                                </div>
                            </>
                        )}
                        {selectedUser.role === 'passageiro' && (
                            <div className="space-y-2">
                                <h4 className="font-semibold">Documento de Identidade</h4>
                                 <a href="https://placehold.co/800x600.png" target="_blank" rel="noopener noreferrer">
                                     <Image src="https://placehold.co/800x600.png" data-ai-hint="document id" alt="Documento" width={800} height={600} className="rounded-lg border aspect-[4/3] object-cover" />
                                 </a>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2">
                         <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Fechar
                            </Button>
                        </DialogClose>
                       <div className="flex gap-2">
                             <Button type="button" variant="destructive" onClick={() => handleVerification(selectedUser.id, 'Rejeitado')}>
                                <X className="mr-2 h-4 w-4" /> Rejeitar
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => handleVerification(selectedUser.id, 'Verificado')}>
                                <Check className="mr-2 h-4 w-4" /> Aprovar
                            </Button>
                       </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
      </TooltipProvider>
    </AppLayout>
  );
}

export default withAuth(AdminDashboard, ["admin"]);

    