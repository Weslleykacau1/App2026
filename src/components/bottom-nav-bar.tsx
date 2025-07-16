
"use client";

import { cn } from "@/lib/utils";
import { Home, History, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/language-context";

interface BottomNavBarProps {
    role: "passenger" | "driver";
}

export function BottomNavBar({ role }: BottomNavBarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = role === 'passenger' ? [
        { href: '/passenger/request-ride', label: 'Início', icon: Home },
        { href: '/passenger/profile?showHistory=true', label: 'Viagens', icon: History },
        { href: '/passenger/profile', label: 'Conta', icon: User },
    ] : [
        { href: '/driver', label: 'Início', icon: Home },
        { href: '/driver/statistics', label: 'Viagens', icon: History },
        { href: '/driver/profile', label: 'Conta', icon: User },
    ];
    
    const isItemActive = (href: string) => {
        // Special case for profile to not be active when history is shown
        if (href === '/passenger/profile' && pathname === '/passenger/profile' && new URLSearchParams(window.location.search).has('showHistory')) {
            return false;
        }
        if (href.includes('?')) {
            return pathname === href.split('?')[0] && new URLSearchParams(window.location.search).has('showHistory');
        }
        return pathname === href;
    };


    return (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background shadow-[0_-1px_4px_rgba(0,0,0,0.05)]">
            <div className="container mx-auto flex h-16 max-w-md items-center justify-around px-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isItemActive(item.href);
                    return (
                         <button
                            key={item.href}
                            onClick={() => router.push(item.href)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 text-xs font-medium w-20 h-full rounded-lg transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    )
}
