
"use client";

import { useAuth, UserRole } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, ComponentType } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  allowedRoles?: UserRole[]
) {
  const WithAuthComponent = (props: P) => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!user) {
          router.replace("/login");
        } else if (allowedRoles && !allowedRoles.includes(user.role)) {
          router.replace("/login");
        }
      }
    }, [user, isLoading, router]);

    if (isLoading || !user || (allowedRoles && !allowedRoles.includes(user.role))) {
      return (
         <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
         </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
  
  WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
}
