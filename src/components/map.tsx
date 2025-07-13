
"use client";

import React from 'react';
import MapGL, { Marker, GeolocateControl, MapRef } from 'react-map-gl';
import { useTheme } from "next-themes";
import { Car } from 'lucide-react';

export function Map({ mapRef }: { mapRef?: React.Ref<MapRef> }) {
  const { resolvedTheme } = useTheme();

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
        longitude: -46.6333,
        latitude: -23.5505,
        zoom: 12
      }}
      style={{width: '100%', height: '100%'}}
      mapStyle={mapStyle}
    >
      <GeolocateControl style={{display: 'none'}} position="top-left" trackUserLocation={true} />
      {/* User's Location */}
      <Marker longitude={-46.6333} latitude={-23.5505} anchor="center">
         <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-md"></div>
      </Marker>
      {/* Ride X Cars */}
       <Marker longitude={-46.65} latitude={-23.56} anchor="bottom">
        <Car className="h-8 w-8 text-foreground" />
      </Marker>
       <Marker longitude={-46.60} latitude={-23.54} anchor="bottom">
        <Car className="h-8 w-8 text-foreground" />
      </Marker>
      {/* Confort Cars */}
       <Marker longitude={-46.64} latitude={-23.57} anchor="bottom">
        <Car className="h-8 w-8 text-secondary" />
      </Marker>
        <Marker longitude={-46.62} latitude={-23.53} anchor="bottom">
        <Car className="h-8 w-8 text-secondary" />
      </Marker>
    </MapGL>
  );
}
