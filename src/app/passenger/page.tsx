"use client";

import { withAuth } from "@/components/with-auth";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { History, MapPin, Search } from "lucide-react";
import { Map } from "@/components/map";

function PassengerDashboard() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="h-[600px] shadow-lg">
                <CardHeader>
                    <CardTitle>Map</CardTitle>
                    <CardDescription>Your current location and nearby drivers.</CardDescription>
                </CardHeader>
              <CardContent className="h-full -mt-6">
                <div className="w-full h-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    <Map />
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <div className="space-y-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Request a Ride</CardTitle>
                  <CardDescription>Where do you want to go?</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pickup">Pickup Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="pickup" placeholder="Current Location" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination</Label>
                       <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="destination" placeholder="Enter destination" className="pl-10" />
                       </div>
                    </div>
                    <Button type="submit" className="w-full !mt-6" size="lg">
                        <Search className="mr-2 h-4 w-4" />
                        Find Ride
                    </Button>
                  </form>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Rides</CardTitle>
                  <CardDescription>Your ride history.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Downtown to Airport</p>
                        <p className="text-sm text-muted-foreground">Jan 15, 2024</p>
                      </div>
                      <p className="font-semibold text-primary">$25.50</p>
                    </li>
                    <li className="flex items-center justify-between">
                       <div>
                        <p className="font-medium">Mall to Home</p>
                        <p className="text-sm text-muted-foreground">Jan 14, 2024</p>
                      </div>
                      <p className="font-semibold text-primary">$12.75</p>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4">
                    <History className="mr-2 h-4 w-4" />
                    View All History
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default withAuth(PassengerDashboard, ["passenger"]);
