import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Heart, Share2, MapPin, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const FoodDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, text: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchFoodDetails();
    }
  }, [id]);

  const fetchFoodDetails = async () => {
    try {
      const { data: foodData, error: foodError } = await supabase
        .from('food_items')
        .select(`
          *,
          restaurants (name, address, city, state)
        `)
        .eq('id', id)
        .single();

      if (foodError) throw foodError;

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (display_name, avatar_url)
        `)
        .eq('food_item_id', id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      setFood(foodData);
      setReviews(reviewsData || []);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded-lg"></div>
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-48 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="container mx-auto px-4 py-6 text-center space-y-4">
        <h1 className="text-2xl font-bold">Food not found</h1>
        <Button onClick={() => navigate('/')} variant="outline">
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Food Details</h1>
      </div>

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
      <Card>
        <CardContent className="p-6 space-y-4">
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
          <div className="flex gap-2 pt-4">
            <Button
              variant="rating"
              onClick={() => setShowReviewForm(true)}
              className="flex-1"
            >
              <Star className="h-4 w-4 mr-2" />
              Rate & Review
            </Button>
            <Button variant="save" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Button variant="outline" className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Add Photos
              </Button>
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
              >
                Submit Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews Section */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review: any) => (
              <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.profiles?.avatar_url} />
                    <AvatarFallback>
                      {review.profiles?.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
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
                    
                    {review.verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="text-4xl">📝</div>
              <div>
                <h3 className="font-semibold">No reviews yet</h3>
                <p className="text-sm text-muted-foreground">
                  Be the first to review this dish!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};