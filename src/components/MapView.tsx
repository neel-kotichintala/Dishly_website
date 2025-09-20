import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MapViewProps {
  foods: any[];
  onFoodSelect?: (foodId: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({ foods, onFoodSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: 'AIzaSyAf5qQXTEvSDvy_jQeBPywA2cPQSPPgevo',
        version: 'weekly',
      });

      try {
        await loader.load();
        setIsLoaded(true);

        if (mapRef.current) {
          // Center on West Lafayette
          const map = new (window as any).google.maps.Map(mapRef.current, {
            center: { lat: 40.4259, lng: -86.9081 },
            zoom: 14,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          mapInstanceRef.current = map;

          // Add markers for each food item
          foods.forEach((food) => {
            if (food.restaurants) {
              // Use approximate coordinates for demo (in real app, you'd store these in the database)
              const coordinates = getApproximateCoordinates(food.restaurants.name);
              
              const marker = new (window as any).google.maps.Marker({
                position: coordinates,
                map: map,
                title: food.name,
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="14" fill="#ea580c" stroke="white" stroke-width="3"/>
                      <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${food.avg_rating ? food.avg_rating.toFixed(1) : '?'}</text>
                    </svg>
                  `),
                  scaledSize: new (window as any).google.maps.Size(32, 32),
                }
              });

              const infoWindow = new (window as any).google.maps.InfoWindow({
                content: `
                  <div style="padding: 8px; max-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${food.name}</h3>
                    <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${food.restaurants.name}</p>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                      <span style="color: #ea580c; font-weight: bold;">★ ${food.avg_rating ? food.avg_rating.toFixed(1) : 'No rating'}</span>
                      <span style="color: #666; font-size: 12px;">(${food.rating_count || 0} reviews)</span>
                    </div>
                    ${food.price ? `<p style="margin: 0; font-weight: bold; color: #ea580c;">$${food.price}</p>` : ''}
                  </div>
                `
              });

              marker.addListener('click', () => {
                infoWindow.open(map, marker);
                if (onFoodSelect) {
                  onFoodSelect(food.id);
                }
              });
            }
          });
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
  }, [foods, onFoodSelect]);

  // Helper function to get approximate coordinates (in real app, store these in database)
  const getApproximateCoordinates = (restaurantName: string) => {
    const coordinates: { [key: string]: { lat: number; lng: number } } = {
      'Triple XXX Family Restaurant': { lat: 40.4242, lng: -86.9081 },
      'Nine Irish Brothers': { lat: 40.4236, lng: -86.9067 },
      'Mad Mushroom': { lat: 40.4239, lng: -86.9075 },
      'Greyhouse Coffee': { lat: 40.4251, lng: -86.9086 },
      'Bruno\'s Swiss Inn': { lat: 40.4189, lng: -86.8842 },
      'Harry\'s Chocolate Shop': { lat: 40.4238, lng: -86.9073 },
      'Puccini\'s Smiling Teeth': { lat: 40.4156, lng: -86.8683 },
      'Korea Garden': { lat: 40.4235, lng: -86.9065 },
    };

    return coordinates[restaurantName] || { lat: 40.4259, lng: -86.9081 };
  };

  return (
    <Card className="w-full h-96 overflow-hidden">
      <div ref={mapRef} className="w-full h-full">
        {!isLoaded && (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
      </div>
      
      {isLoaded && foods.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur">
            📍 {foods.length} dishes found nearby
          </Badge>
        </div>
      )}
    </Card>
  );
};