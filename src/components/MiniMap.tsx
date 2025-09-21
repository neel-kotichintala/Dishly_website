import React, { useEffect, useState } from 'react';
import { buildEmbedPlaceUrl, buildEmbedDirectionsUrl, buildDirectionsLink } from '@/lib/maps';

interface MiniMapProps {
  restaurantName?: string;
  height?: number;
  showDirections?: boolean;
  destinationAddress?: string; // optional richer address
}

const DEFAULT_CENTER = { lat: 40.4259, lng: -86.9081 }; // West Lafayette center

export const MiniMap: React.FC<MiniMapProps> = ({ restaurantName, height = 160, showDirections = false, destinationAddress }) => {
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!showDirections) return;
    if (!navigator.geolocation) {
      setOrigin(DEFAULT_CENTER);
      setDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setDenied(false);
      },
      () => {
        // Fallback to town center so a route still renders
        setOrigin(DEFAULT_CENTER);
        setDenied(true);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [showDirections]);

  const destination = destinationAddress || restaurantName || 'West Lafayette, IN';
  const url = showDirections
    ? buildEmbedDirectionsUrl(origin, destination)
    : buildEmbedPlaceUrl(destination);

  const externalLink = buildDirectionsLink([destination]);

  return (
    <div className="w-full rounded-md border overflow-hidden">
      <div style={{ height }}>
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
      {showDirections && externalLink && (
        <div className="flex items-center justify-between p-2 text-xs text-muted-foreground">
          <span>{denied ? 'Using approximate start. Enable location for precise directions.' : 'Directions from your location.'}</span>
          <a href={externalLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">Open in Google Maps</a>
        </div>
      )}
    </div>
  );
};
