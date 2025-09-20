import React from 'react';
import { Star, Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="text-primary text-4xl">🍽️</div>
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
              onSave?.();
            }}
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-primary text-primary")} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm line-clamp-1">{name}</h3>
              {restaurant && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {restaurant}
                </p>
              )}
            </div>
            {price && (
              <span className="text-sm font-medium text-primary">${price}</span>
            )}
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
            <div className="flex flex-wrap gap-1">
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