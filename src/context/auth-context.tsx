
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
  login: (credentials: LoginCredentials, overrideRole?: UserRole) => void;
  logout: () => void;
  isLoading: boolean;
  isSubmitting: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "driverweek@gmail.com";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const docRef = doc(db, "profiles", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const profileData = docSnap.data();
          const isSpecialAdmin = firebaseUser.email === ADMIN_EMAIL;
          
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            ...profileData,
            // The admin user ALWAYS has the 'admin' role internally.
            role: isSpecialAdmin ? 'admin' : profileData.role,
          } as User);

        } else if (firebaseUser.email === ADMIN_EMAIL) {
          // If profile doesn't exist but it's the admin, create a temporary profile
           setUser({
                id: firebaseUser.uid,
                name: "Admin",
                email: ADMIN_EMAIL,
                role: "admin",
                status: "Ativo",
                verification: "Verificado"
            });
        }
        else {
          // If profile doesn't exist, sign out the user
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials, overrideRole?: UserRole) => {
    setIsSubmitting(true);
    if (!credentials.email || !credentials.password) {
        toast({ variant: "destructive", title: "Erro", description: "Email e senha são obrigatórios." });
        setIsSubmitting(false);
        return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const firebaseUser = userCredential.user;

      if (firebaseUser) {
        const docRef = doc(db, "profiles", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        const isSpecialAdmin = firebaseUser.email === ADMIN_EMAIL;
        let finalRole: UserRole | undefined = overrideRole;
        

        if (docSnap.exists()) {
          const profileData = docSnap.data();
          // If it's the admin, the role is ALWAYS admin, unless overridden for testing.
          const dbRole = isSpecialAdmin ? 'admin' : profileData.role;

          // If no override, use the role from DB (which is now correctly 'admin' for the admin user).
          if (!finalRole) {
            finalRole = dbRole;
          }
           // Update user state.
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            ...profileData,
            role: dbRole,
          } as User);

        } else if (isSpecialAdmin) {
            // This is the special admin user without a profile, create a temporary one
            if (!finalRole) {
              finalRole = 'admin';
            }
            setUser({
                id: firebaseUser.uid,
                name: "Admin",
                email: ADMIN_EMAIL,
                role: 'admin', // Always admin role
                status: "Ativo",
                verification: "Verificado"
            });
        } else {
            await signOut(auth);
            throw new Error("Usuário não encontrado ou perfil incompleto. Por favor, cadastre-se.");
        }
        
        if (finalRole) {
          router.push(`/${finalRole}`);
        } else {
            throw new Error("Não foi possível determinar o perfil do usuário.");
        }

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
    await signOut(auth);
    setUser(null);
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
