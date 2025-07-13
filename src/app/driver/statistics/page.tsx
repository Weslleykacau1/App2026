
"use client";

import { useState, useEffect } from "react";
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ArrowLeft, Car, DollarSign } from "lucide-react";
import { useRouter } from 'next/navigation';

const initialWeeklyData = [
  { name: "Seg", total: 0 },
  { name: "Ter", total: 0 },
  { name: "Qua", total: 0 },
  { name: "Qui", total: 0 },
  { name: "Sex", total: 0 },
  { name: "Sáb", total: 0 },
  { name: "Dom", total: 0 },
];

function StatisticsPage() {
  const router = useRouter();
  const [weeklyData, setWeeklyData] = useState(initialWeeklyData);

  useEffect(() => {
    // Generate random data on client-side to avoid hydration mismatch
    const generatedData = initialWeeklyData.map(item => ({
      ...item,
      total: Math.floor(Math.random() * 300) + 50
    }));
    setWeeklyData(generatedData);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Estatísticas</h1>
          <div className="w-9 h-9"></div>
        </div>
      </header>
      <main className="flex-1 py-6 container mx-auto px-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ganhos de Hoje</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$156,50</div>
              <p className="text-xs text-muted-foreground">Ganhos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Corridas de Hoje</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Corridas</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ganhos da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
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
                  tickFormatter={(value) => `R$${value}`}
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

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-muted-foreground">Taxa de Aceitação</span>
                <span className="text-sm font-bold text-primary">92%</span>
              </div>
              <Progress value={92} />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-muted-foreground">Taxa de Cancelamento</span>
                <span className="text-sm font-bold text-destructive">5%</span>
              </div>
              <Progress value={5} className="[&>div]:bg-destructive" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default withAuth(StatisticsPage, ["driver"]);
