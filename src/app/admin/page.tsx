
"use client";

import { useState, useEffect } from "react";
import { withAuth } from "@/components/with-auth";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Car, DollarSign, ShieldCheck, MoreHorizontal, FileCheck2, AlertCircle, X, Check, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

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

const initialUsers: User[] = [
  { id: 1, name: "João Passageiro", email: "john.p@example.com", role: "passageiro", status: "Ativo", joined: "2023-01-15", verification: "Verificado" },
  { id: 2, name: "Joana Motorista", email: "jane.d@example.com", role: "motorista", status: "Ativo", joined: "2023-02-20", verification: "Pendente" },
  { id: 3, name: "Miguel Admin", email: "mike.a@example.com", role: "admin", status: "Ativo", joined: "2023-01-01", verification: "Verificado" },
  { id: 4, name: "Sara Passageiro", email: "sarah.p@example.com", role: "passageiro", status: "Suspenso", joined: "2023-03-10", verification: "Verificado" },
  { id: 5, name: "Davi Motorista", email: "david.d@example.com", role: "motorista", status: "Ativo", joined: "2023-04-05", verification: "Rejeitado" },
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

function AdminDashboard() {
  const [revenueData, setRevenueData] = useState(initialRevenueData);
  const [users, setUsers] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const generatedData = initialRevenueData.map(item => ({
      ...item,
      total: Math.floor(Math.random() * 5000) + 1000
    }));
    setRevenueData(generatedData);
  }, []);

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
    setIsModalOpen(true);
  };
  
  const handleVerification = (userId: number, newStatus: VerificationStatus) => {
    setUsers(users.map(user => user.id === userId ? { ...user, verification: newStatus } : user));
    setIsModalOpen(false);
    toast({
        title: "Status de verificação atualizado!",
        description: `O usuário foi marcado como ${newStatus.toLowerCase()}.`,
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground">Painel do Administrador</h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,257</div>
              <p className="text-xs text-muted-foreground">+120 este mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Motoristas Ativos</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">+15 online agora</p>
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
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Administradores do Sistema</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>Visualize, edite e gerencie todos os usuários no sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verificação</TableHead>
                      <TableHead><span className="sr-only">Ações</span></TableHead>
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
                            {roleTranslations[user.role] || user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'Ativo' ? 'secondary' : 'destructive'}>{user.status}</Badge>
                        </TableCell>
                         <TableCell>
                            <Tooltip>
                                <TooltipTrigger>
                                     <div className="flex items-center gap-2">
                                        {verificationIcons[user.verification]}
                                    </div>
                                </TooltipTrigger>
                            </Tooltip>
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
            <Card className="md:col-span-2">
                 <CardHeader>
                    <CardTitle>Receita Mensal</CardTitle>
                    <CardDescription>Visão geral da receita nos últimos meses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
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
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--muted))' }}
                                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                 formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                            />
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      </div>
       {selectedUser && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
    </AppLayout>
  );
}

export default withAuth(AdminDashboard, ["admin"]);
