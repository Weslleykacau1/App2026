
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Clock } from "lucide-react";

export default function PendingApprovalPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md shadow-lg text-center">
        <CardHeader>
           <div className="mx-auto bg-green-100 text-green-700 rounded-full h-20 w-20 flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12" />
            </div>
          <CardTitle className="text-2xl font-bold">Cadastro Recebido!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Obrigado por se cadastrar. Seus documentos estão em análise.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-lg text-left">
                 <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6" />
                    <p className="font-semibold">
                      A aprovação pode levar até 48 horas. Você receberá um email de confirmação assim que sua conta for ativada.
                    </p>
                 </div>
            </div>
            <Button onClick={() => router.push('/')} className="w-full h-12 text-lg">
                Voltar para o Login
            </Button>
        </CardContent>
      </Card>
    </main>
  );
}
