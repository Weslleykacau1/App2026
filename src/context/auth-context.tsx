
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export type UserRole = "passenger" | "driver" | "admin";
export type VerificationStatus = "Verificado" | "Pendente" | "Rejeitado";
export type UserStatus = "Ativo" | "Suspenso";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  verification: VerificationStatus;
  phone?: string;
  cpf?: string;
  vehicle_model?: string;
  vehicle_license_plate?: string;
  vehicle_color?: string;
  vehicle_year?: string;
}

interface LoginCredentials {
    email: string;
    password?: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => void;
  logout: () => void;
  isLoading: boolean;
  isSubmitting: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch profile data from Supabase
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser({
            id: session.user.id,
            ...profile
          } as User);
        } else {
          // This case might happen if profile creation failed after signup
          // Or if user was deleted from profiles table but not from auth.users
          setUser(null);
          // Ensure user is fully logged out if their profile is missing
          await supabase.auth.signOut();
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsSubmitting(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword(credentials);

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Immediately verify if a profile exists for this user
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', authData.user.id)
          .single();
        
        if (profileError || !profile) {
          // If no profile, sign out immediately and show an error
          await supabase.auth.signOut();
          throw new Error("Usuário não encontrado ou perfil incompleto. Por favor, cadastre-se.");
        }
        
        // Profile exists, onAuthStateChange will handle setting the user and redirecting.
        // We can manually route here if we want faster navigation.
        router.push(`/${profile.role}`);

      } else {
         throw new Error("Ocorreu um erro inesperado durante o login.");
      }

    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Erro no Login",
        description: error.message || "Credenciais inválidas ou erro no servidor.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null); // Clear user state immediately
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isSubmitting }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
