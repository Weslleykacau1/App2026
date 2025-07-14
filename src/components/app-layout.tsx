import { ReactNode } from "react";
import { Car, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/auth-context";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
            <Car className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary font-headline">TriDriver</h1>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
               <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="h-5 w-5" />
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
