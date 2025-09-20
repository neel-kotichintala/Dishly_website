import React, { useState, useEffect } from 'react';
import { X, Star, Heart, Share2, MapPin, Navigation } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FoodDetailModalProps {
  foodId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  foodId,
  isOpen,
  onClose,
}) => {
  const [food, setFood] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, text: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (foodId && isOpen) {
      fetchFoodDetails();
    }
  }, [foodId, isOpen]);

  const fetchFoodDetails = async () => {
    if (!foodId) return;
    
    setLoading(true);
    try {
      const { data: foodData, error: foodError } = await supabase
        .from('food_items')
        .select(`
          *,
          restaurants (name, address, city, state)
        `)
        .eq('id', foodId)
        .single();

      if (foodError) throw foodError;

      // Add sample reviews for demo
      const sampleReviews = [
        {
          id: '1',
          rating: 5,
          text: 'Absolutely amazing! Best dish I\'ve had in West Lafayette.',
          created_at: '2024-01-15T10:30:00Z',
          profiles: { display_name: 'Sarah K.', avatar_url: null }
        },
        {
          id: '2', 
          rating: 4,
          text: 'Really good, would definitely order again. Great portion size.',
          created_at: '2024-01-10T15:45:00Z',
          profiles: { display_name: 'Mike R.', avatar_url: null }
        }
      ];

      setFood(foodData);
      setReviews(sampleReviews);
    } catch (error) {
      console.error('Error fetching food details:', error);
      toast({
        title: "Error",
        description: "Failed to load food details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from saved" : "Saved!",
      description: isSaved ? "Item removed from your saved list" : "Item added to your saved list",
    });
  };

  const handleSubmitReview = async () => {
    if (!newReview.rating) return;

    const reviewData = {
      id: Date.now().toString(),
      rating: newReview.rating,
      text: newReview.text,
      created_at: new Date().toISOString(),
      profiles: { display_name: 'You', avatar_url: null }
    };

    setReviews([reviewData, ...reviews]);
    setNewReview({ rating: 0, text: '' });
    setShowReviewForm(false);
    
    toast({
      title: "Review submitted!",
      description: "Thank you for your feedback",
    });
  };

  const handleGetDirections = () => {
    if (food?.restaurants) {
      const address = `${food.restaurants.address}, ${food.restaurants.city}, ${food.restaurants.state}`;
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
    }
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? 'fill-warning text-warning'
                : 'text-muted-foreground'
            } ${interactive ? 'cursor-pointer hover:fill-warning hover:text-warning' : ''}`}
            onClick={() => interactive && onRate?.(star)}
          />
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Food Details
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <div className="h-48 bg-muted animate-pulse rounded-lg"></div>
            <div className="h-24 bg-muted animate-pulse rounded-lg"></div>
          </div>
        ) : food ? (
          <div className="space-y-6">
            {/* Hero Image */}
            <div className="relative aspect-[16/10] bg-muted rounded-lg overflow-hidden">
              {food.image_url ? (
                <img
                  src={food.image_url}
                  alt={food.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <div className="text-primary text-8xl">🍽️</div>
                </div>
              )}
              
              {food.is_trending && (
                <Badge className="absolute top-4 left-4 bg-warning text-warning-foreground">
                  🔥 Hot
                </Badge>
              )}
            </div>

            {/* Food Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">{food.name}</h1>
                  {food.restaurants && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {food.restaurants.name}
                      {food.restaurants.city && `, ${food.restaurants.city}`}
                    </p>
                  )}
                </div>
                {food.price && (
                  <span className="text-2xl font-bold text-primary">${food.price}</span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                {renderStars(food.avg_rating || 0)}
                <span className="font-medium">{(food.avg_rating || 0).toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  ({food.rating_count || 0} reviews)
                </span>
              </div>

              {/* Tags */}
              {food.tags && food.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {food.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Description */}
              {food.description && (
                <p className="text-muted-foreground">{food.description}</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="rating"
                  onClick={() => setShowReviewForm(true)}
                  className="flex-1"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Rate & Review
                </Button>
                <Button 
                  variant={isSaved ? "default" : "save"} 
                  size="icon"
                  onClick={handleSave}
                >
                  <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="hero" onClick={handleGetDirections}>
                  <Navigation className="h-4 w-4 mr-2" />
                  Directions
                </Button>
              </div>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold">Write a Review</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Rating</label>
                  {renderStars(
                    newReview.rating,
                    true,
                    (rating) => setNewReview({ ...newReview, rating })
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Review</label>
                  <Textarea
                    placeholder="Share your experience with this dish..."
                    value={newReview.text}
                    onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="hero" 
                    className="flex-1"
                    disabled={!newReview.rating}
                    onClick={handleSubmitReview}
                  >
                    Submit Review
                  </Button>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="space-y-4">
              <h3 className="font-semibold">Reviews ({reviews.length})</h3>
              
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {review.profiles?.display_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {review.profiles?.display_name || 'Anonymous'}
                              </span>
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {review.text && (
                            <p className="text-sm">{review.text}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="text-4xl">📝</div>
                  <div>
                    <h4 className="font-semibold">No reviews yet</h4>
                    <p className="text-sm text-muted-foreground">
                      Be the first to review this dish!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>Food not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};