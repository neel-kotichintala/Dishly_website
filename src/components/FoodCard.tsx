import React, { useEffect, useState } from 'react';
import { Star, Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getLocalImageForFood } from '@/lib/imageMap';
import { getApproximateCoordinates, haversineMiles } from '@/lib/geo';
import { isSaved as isSavedFn, toggleSaved } from '@/services/savedService';

interface FoodCardProps {
  id: string;
  name: string;
  restaurant?: string;
  image?: string;
  rating?: number;
  ratingCount?: number;
  tags?: string[];
  price?: number;
  isHot?: boolean;
  isSaved?: boolean;
  onClick?: () => void;
  onSave?: () => void;
  className?: string;
}

export const FoodCard = ({
  id,
  name,
  restaurant,
  image,
  rating = 0,
  ratingCount = 0,
  tags = [],
  price,
  isHot = false,
  isSaved = false,
  onClick,
  onSave,
  className,
}: FoodCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [miles, setMiles] = useState<number | null>(null);
  const [saved, setSaved] = useState<boolean>(isSavedFn(id));
  const localImage = getLocalImageForFood(name);

  useEffect(() => {
    setSaved(isSavedFn(id));
  }, [id]);

  useEffect(() => {
    const dest = getApproximateCoordinates(restaurant);
    if (!dest) return;

    if (!navigator.geolocation) {
      setMiles(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const d = haversineMiles(origin, dest);
        setMiles(Math.round(d * 10) / 10);
      },
      () => setMiles(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [restaurant]);

  const resolvedImage = !imageError ? (image || localImage) : undefined;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-muted">
          {resolvedImage ? (
            <img
              src={resolvedImage}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            // Simple dish icon fallback
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-2">🍽️</div>
                <div className="text-sm font-medium text-primary px-2">{name}</div>
              </div>
            </div>
          )}
          
          {/* Hot Badge */}
          {isHot && (
            <Badge className="absolute top-2 left-2 bg-warning text-warning-foreground">
              🔥 Hot
            </Badge>
          )}
          
          {/* Save Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              const val = toggleSaved(id);
              setSaved(val);
              onSave?.();
            }}
          >
            <Heart className={cn("h-4 w-4", (saved || isSaved) && "fill-primary text-primary")} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm leading-tight line-clamp-1 min-h-[1.25rem]">{name}</h3>
              {restaurant && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 min-w-0">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{restaurant}</span>
                </p>
              )}
            </div>
            <div className="flex flex-col items-end shrink-0 w-16 text-right">
              {price && (
                <span className="text-sm font-medium text-primary">${price}</span>
              )}
              {miles !== null && (
                <span className="text-[11px] text-muted-foreground tabular-nums">{miles} mi</span>
              )}
            </div>
          </div>

          {/* Rating */}
          {ratingCount > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span className="text-xs font-medium">{rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({ratingCount})</span>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 min-h-[1.25rem]">
              {tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};