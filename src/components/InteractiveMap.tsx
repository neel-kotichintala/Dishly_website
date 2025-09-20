import React, { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getApproximateCoordinates } from '@/lib/geo';

interface InteractiveMapProps {
  foods: any[];
  onFoodSelect?: (foodId: string) => void;
  height?: number;
}

const JS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_JS_API_KEY as string | undefined;

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ foods, onFoodSelect, height = 480 }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: any;
    let infoWindow: any;
    let markers: any[] = [];

    const init = async () => {
      if (!JS_API_KEY) return;
      const loader = new Loader({ apiKey: JS_API_KEY, version: 'weekly' });
      await loader.load();
      if (!mapRef.current) return;

      map = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 40.4259, lng: -86.9081 },
        zoom: 14,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        ],
      });

      infoWindow = new (window as any).google.maps.InfoWindow();

      markers = foods.map((food) => {
        const placeName = food.restaurants?.name;
        const coords = getApproximateCoordinates(placeName) || { lat: 40.4259, lng: -86.9081 };
        const rating = (food.avg_rating || 0).toFixed(1);

        // Modern teardrop pointer with rating and proper shadow
        const iconSvg = `
          <svg width="40" height="56" viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="ds" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.25"/>
              </filter>
            </defs>
            <g filter="url(#ds)">
              <path d="M20 1.5c-9.94 0-18 8.06-18 18 0 10.5 12.5 24 18 36.5C25.5 43.5 38 30 38 19.5c0-9.94-8.06-18-18-18z" fill="#ea580c" stroke="white" stroke-width="3"/>
              <circle cx="20" cy="20" r="10" fill="rgba(255,255,255,0.18)"/>
              <text x="20" y="24" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${rating}</text>
            </g>
          </svg>
        `;

        const marker = new (window as any).google.maps.Marker({
          position: coords,
          map,
          title: food.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(iconSvg),
            scaledSize: new (window as any).google.maps.Size(40, 56),
            anchor: new (window as any).google.maps.Point(20, 56), // tip of the pin
          },
        });

        marker.addListener('mouseover', () => {
          infoWindow.setContent(`
            <div style="padding:6px; max-width:220px;">
              <div style="font-weight:600;">${food.name}</div>
              <div style="color:#555; font-size:12px;">${placeName || ''}</div>
            </div>
          `);
          infoWindow.open(map, marker);
        });
        marker.addListener('mouseout', () => infoWindow.close());

        marker.addListener('click', () => {
          onFoodSelect && onFoodSelect(food.id);
        });

        return marker;
      });
    };

    init();

    return () => {
      markers.forEach((m) => m && m.setMap(null));
    };
  }, [foods, onFoodSelect]);

  return (
    <Card className="w-full overflow-hidden relative" style={{ height }}>
      {JS_API_KEY ? (
        <div ref={mapRef} className="w-full h-full" />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-sm">Google Maps JS API key missing.</p>
            <p className="text-xs text-muted-foreground">Add VITE_GOOGLE_MAPS_JS_API_KEY to use interactive pins.</p>
          </div>
        </div>
      )}
      {foods.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur">
            📍 {foods.length} dishes found nearby
          </Badge>
        </div>
      )}
    </Card>
  );
};
