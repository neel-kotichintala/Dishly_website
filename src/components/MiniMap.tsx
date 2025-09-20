import React, { useEffect, useState } from 'react';
import { buildEmbedPlaceUrl, buildEmbedDirectionsUrl } from '@/lib/maps';

interface MiniMapProps {
  restaurantName?: string;
  height?: number;
  showDirections?: boolean;
  destinationAddress?: string; // optional richer address
}

export const MiniMap: React.FC<MiniMapProps> = ({ restaurantName, height = 160, showDirections = false, destinationAddress }) => {
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!showDirections) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setOrigin(null);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [showDirections]);

  const destination = destinationAddress || restaurantName || 'West Lafayette, IN';
  const url = showDirections
    ? buildEmbedDirectionsUrl(origin, destination)
    : buildEmbedPlaceUrl(destination);

  return (
    <div className="w-full rounded-md border overflow-hidden" style={{ height }}>
      {url ? (
        <iframe
          title="map"
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
    </div>
  );
};
