"use client";

import { withAuth } from "@/components/with-auth";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, MapPin, Star, TrendingUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

function DriverDashboard() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold tracking-tight">Driver Dashboard</h2>
            <div className="flex items-center space-x-2">
                <Switch id="availability" />
                <Label htmlFor="availability" className="font-medium">Online</Label>
            </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$145.32</div>
                    <p className="text-xs text-muted-foreground">+20.1% from yesterday</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">4.92</div>
                    <p className="text-xs text-muted-foreground">Excellent</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">3 since last week</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">95%</div>
                    <p className="text-xs text-muted-foreground">Last 50 requests</p>
                </CardContent>
            </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Incoming Ride Requests</CardTitle>
            <CardDescription>Accept a request to start a trip.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 border rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                   <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="person portrait" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Jane Doe <Badge variant="outline">4.8 ★</Badge></p>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>2.5 miles away</span>
                  </div>
                </div>
              </div>
              <div className="text-right md:text-left flex-shrink-0">
                  <p className="font-bold text-lg text-primary">$18.45</p>
                  <p className="text-sm text-muted-foreground">15 min trip</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" className="flex-1 md:flex-initial">Decline</Button>
                <Button className="flex-1 md:flex-initial">Accept</Button>
              </div>
            </div>
            <Separator />
            <div className="p-4 border rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 opacity-60">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                   <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="person face" />
                  <AvatarFallback>MS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Mike Smith <Badge variant="outline">4.9 ★</Badge></p>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                     <MapPin className="h-3 w-3" />
                    <span>5.1 miles away</span>
                  </div>
                </div>
              </div>
               <div className="text-right md:text-left flex-shrink-0">
                  <p className="font-bold text-lg text-primary">$24.00</p>
                  <p className="text-sm text-muted-foreground">22 min trip</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" className="flex-1 md:flex-initial">Decline</Button>
                <Button className="flex-1 md:flex-initial">Accept</Button>
              </div>
            </div>
             <p className="text-center text-sm text-muted-foreground pt-4">No more requests currently.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default withAuth(DriverDashboard, ["driver"]);
