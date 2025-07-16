
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, User, ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth, UserRole } from "@/context/auth-context";
import { Separator } from "@/components/ui/separator";

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g>
    </svg>
);


const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
  role: z.enum(["passenger", "driver"], {
    required_error: "Você precisa selecionar um perfil.",
  }),
  terms: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar os termos e a política de privacidade.",
  }),
});

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { loginWithGoogle, isSubmitting: isGoogleSubmitting } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      terms: false,
    },
    mode: "onChange",
  });

  const role = form.watch("role");

  const handleGoogleSignup = () => {
      if (!role) {
          toast({
              variant: "destructive",
              title: "Perfil não selecionado",
              description: "Por favor, selecione se você é um passageiro ou motorista antes de continuar.",
          });
          return;
      }
      loginWithGoogle(role as UserRole);
  };


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      
      if (userCredential.user) {
        const user = userCredential.user;
        
        await setDoc(doc(db, "profiles", user.uid), {
          name: values.name,
          email: values.email,
          role: values.role,
          status: 'Ativo',
          verification: 'Pendente',
          photoUrl: '',
          cnhUrl: '',
          crlvUrl: '',
          identityDocumentUrl: '',
          addressProofUrl: '',
          homeAddress: '',
          workAddress: '',
        });
        
        toast({
          title: "Cadastro realizado!",
          description: "Agora, por favor, envie seus documentos para verificação.",
        });
        router.push(`/signup/documents?role=${values.role}&userId=${user.uid}`);

      }
    } catch (error: any) {
       if (error.code === 'auth/email-already-in-use') {
         toast({
            variant: "destructive",
            title: "Erro no Cadastro",
            description: "Este e-mail já está em uso. Por favor, faça o login.",
        });
        router.push('/login');
       } else {
         toast({
            variant: "destructive",
            title: "Erro no Cadastro",
            description: error.message || "Ocorreu um erro. Por favor, tente novamente.",
          });
       }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm">
        <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={() => router.push('/')}>
            <ArrowLeft />
        </Button>
        <div className="text-center mb-8">
            <Car className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-4xl font-bold text-primary mt-2">Criar Conta</h1>
            <p className="text-muted-foreground">Comece sua jornada com TriDriver.</p>
        </div>
        
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3 pt-2">
                    <FormLabel>Eu sou...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4"
                      >
                        <FormItem className="flex-1">
                          <RadioGroupItem value="passenger" id="passenger" className="sr-only" />
                          <FormLabel htmlFor="passenger" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                            <User className="mb-3 h-6 w-6" />
                            Passageiro
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex-1">
                          <RadioGroupItem value="driver" id="driver" className="sr-only" />
                           <FormLabel htmlFor="driver" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                            <Car className="mb-3 h-6 w-6" />
                            Motorista
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {role && (
                <div className="space-y-4 animate-in fade-in-0 slide-in-from-top-4 duration-500">
                  <div className="relative my-6 w-full">
                      <Separator />
                      <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">Continue com</span>
                  </div>
                  <Button onClick={handleGoogleSignup} variant="outline" className="w-full h-12 text-base font-semibold" disabled={isGoogleSubmitting}>
                      {isGoogleSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                      Google
                  </Button>
                  <div className="relative my-6 w-full">
                      <Separator />
                      <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">OU</span>
                  </div>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Nome Completo" {...field} className="h-12 text-base" />
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
                        <FormControl>
                          <Input placeholder="Email" {...field} className="h-12 text-base" />
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
                        <FormControl>
                          <Input type="password" placeholder="Senha" {...field} className="h-12 text-base" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Aceitar termos e condições
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Eu concordo com a nossa{" "}
                            <Link href="#" className="underline hover:text-primary">
                              Política de Privacidade
                            </Link>{" "}
                            e{" "}
                            <Link href="#" className="underline hover:text-primary">
                              Termos de Uso
                            </Link>
                            .
                          </p>
                           <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                   <Button type="submit" className="w-full !mt-6 h-12 text-lg font-bold" disabled={!form.formState.isValid || isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Cadastrando...' : 'Continuar com Email'}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Entrar
            </Link>
          </div>
      </div>
    </main>
  );
}
