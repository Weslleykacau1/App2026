
"use client";

import React, { useEffect, useState } from 'react';
import MapGL, { Marker, GeolocateControl, MapRef, Source, Layer, LngLatLike } from 'react-map-gl';
import { useTheme } from "next-themes";
import { Car, Flag, MapPin } from 'lucide-react';

export function Map({ mapRef, showMovingCar, pickup, destination, route }: { mapRef?: React.Ref<MapRef>, showMovingCar?: boolean, pickup?: LngLatLike, destination?: LngLatLike, route?: LngLatLike[] | null }) {
  const { resolvedTheme } = useTheme();
  const [driverLocation, setDriverLocation] = useState({ longitude: -38.495, latitude: -3.735 });
  const [lineColor, setLineColor] = useState('#000000');
  const [userLocation, setUserLocation] = useState<{longitude: number, latitude: number} | null>(null);

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

  useEffect(() => {
    // We need to get the computed style of the primary color because Mapbox can't parse CSS variables.
    if (typeof window !== 'undefined') {
      const primaryColorHsl = getComputedStyle(document.documentElement).getPropertyValue('--primary');
      if (primaryColorHsl) {
        // Convert HSL string "234.9 91.5% 67.5%" to a usable color for Mapbox
        const [h, s, l] = primaryColorHsl.split(' ').map(parseFloat);
        setLineColor(`hsl(${h}, ${s}%, ${l}%)`);
      }
    }
    
    // Get user's current location to display on map
    navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation({ longitude, latitude });
        },
        (error) => console.error("Error getting user location:", error),
        { enableHighAccuracy: true }
    );

  }, [resolvedTheme]);

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

  const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> | null = route ? {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: route
    }
  } : null;
  
  const routeLayer: Layer = {
    id: 'route',
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': lineColor,
      'line-width': 6,
      'line-opacity': 0.8
    }
  };


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
      
      {pickup && (
         <Marker longitude={pickup[0]} latitude={pickup[1]} anchor="center">
            <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-md"></div>
         </Marker>
      )}


      {destination && (
        <Marker longitude={destination[0]} latitude={destination[1]} anchor="center">
            <Flag className="h-8 w-8 text-red-500" fill="currentColor" />
        </Marker>
      )}

      {routeGeoJSON && (
        <Source type="geojson" data={routeGeoJSON}>
            <Layer {...routeLayer} />
        </Source>
      )}

      {userLocation && !showMovingCar && (
          <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} anchor="center">
              <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-lg">
                 <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L3 22L12 18L21 22L12 2Z" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" strokeWidth="1" strokeLinejoin="round"/>
                      </svg>
                 </div>
              </div>
          </Marker>
      )}

      {showMovingCar && (
        <Marker longitude={driverLocation.longitude} latitude={driverLocation.latitude} anchor="bottom">
          <Car className="h-8 w-8 text-foreground" />
        </Marker>
      )}
    </MapGL>
  );
}
