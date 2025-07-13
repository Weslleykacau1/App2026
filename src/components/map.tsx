"use client";

import React from 'react';
import MapGL, { Marker, GeolocateControl } from 'react-map-gl';
import { useTheme } from "next-themes";
import { Pin } from 'lucide-react';

export function Map() {
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
      mapboxAccessToken={mapboxToken}
      initialViewState={{
        longitude: -46.6333,
        latitude: -23.5505,
        zoom: 12
      }}
      style={{width: '100%', height: '100%'}}
      mapStyle={mapStyle}
    >
      <GeolocateControl position="top-left" trackUserLocation={true} />
      <Marker longitude={-46.6333} latitude={-23.5505} anchor="bottom">
        <Pin className="h-8 w-8 text-primary fill-primary" />
      </Marker>
       <Marker longitude={-46.65} latitude={-23.56} anchor="bottom">
        <Pin className="h-8 w-8 text-secondary fill-secondary" />
      </Marker>
       <Marker longitude={-46.60} latitude={-23.54} anchor="bottom">
        <Pin className="h-8 w-8 text-secondary fill-secondary" />
      </Marker>
    </MapGL>
  );
}
