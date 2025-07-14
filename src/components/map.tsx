
"use client";

import React, { useEffect, useState } from 'react';
import MapGL, { Marker, GeolocateControl, MapRef } from 'react-map-gl';
import { useTheme } from "next-themes";
import { Car } from 'lucide-react';

export function Map({ mapRef, showMovingCar }: { mapRef?: React.Ref<MapRef>, showMovingCar?: boolean }) {
  const { resolvedTheme } = useTheme();
  const [driverLocation, setDriverLocation] = useState({ longitude: -38.495, latitude: -3.735 });

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (showMovingCar) {
      interval = setInterval(() => {
        setDriverLocation(loc => ({
          longitude: loc.longitude + (Math.random() - 0.5) * 0.002,
          latitude: loc.latitude + (Math.random() - 0.5) * 0.002,
        }));
      }, 2000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [showMovingCar]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <p className="text-muted-foreground text-center p-4">
          O token do Mapbox não está configurado. Por favor, adicione-o às suas variáveis de ambiente.
        </p>
      </div>
    );
  }

  const mapStyle = resolvedTheme === 'dark' 
    ? 'mapbox://styles/mapbox/dark-v11' 
    : 'mapbox://styles/mapbox/streets-v12';

  return (
    <MapGL
      ref={mapRef}
      mapboxAccessToken={mapboxToken}
      initialViewState={{
        longitude: -38.5267,
        latitude: -3.7327,
        zoom: 12
      }}
      style={{width: '100%', height: '100%'}}
      mapStyle={mapStyle}
    >
      <GeolocateControl style={{display: 'none'}} position="top-left" trackUserLocation={true} />
      {/* User's Location */}
      <Marker longitude={-38.5267} latitude={-3.7327} anchor="center">
         <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-md"></div>
      </Marker>

      {showMovingCar ? (
        <Marker longitude={driverLocation.longitude} latitude={driverLocation.latitude} anchor="bottom">
          <Car className="h-8 w-8 text-foreground" />
        </Marker>
      ) : (
        <>
            {/* Ride X Cars */}
            <Marker longitude={-38.495} latitude={-3.735} anchor="bottom">
                <Car className="h-8 w-8 text-foreground" />
            </Marker>
            <Marker longitude={-38.55} latitude={-3.75} anchor="bottom">
                <Car className="h-8 w-8 text-foreground" />
            </Marker>
            {/* Confort Cars */}
            <Marker longitude={-38.51} latitude={-3.72} anchor="bottom">
                <Car className="h-8 w-8 text-secondary" />
            </Marker>
                <Marker longitude={-38.54} latitude={-3.76} anchor="bottom">
                <Car className="h-8 w-8 text-secondary" />
            </Marker>
        </>
      )}
    </MapGL>
  );
}
