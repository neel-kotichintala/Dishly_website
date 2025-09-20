import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buildEmbedSearchForFoods } from '@/lib/maps';

interface MapViewProps {
  foods: any[];
  onFoodSelect?: (foodId: string) => void;
  height?: number;
}

export const MapView: React.FC<MapViewProps> = ({ foods, onFoodSelect, height = 384 }) => {
  const url = useMemo(() => buildEmbedSearchForFoods(foods || []), [foods]);

  return (
    <Card className="w-full overflow-hidden relative" style={{ height }}>
      {url ? (
        <iframe
          title="results-map"
          src={url}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">Map unavailable</div>
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