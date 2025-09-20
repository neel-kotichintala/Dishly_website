import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FoodCard } from '@/components/FoodCard';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const RatePage = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch some trending foods as "recently viewed" placeholder
      const { data: foods, error: foodsError } = await supabase
        .from('food_items')
        .select(`
          *,
          restaurants (name, city, state)
        `)
        .limit(6);

      if (foodsError) throw foodsError;

      // Fetch restaurants
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('*')
        .limit(8);

      if (restaurantsError) throw restaurantsError;

      setRecentlyViewed(foods || []);
      setNearbyRestaurants(restaurants || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFoodClick = (foodId: string) => {
    navigate(`/food/${foodId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Rate Your Experience</h1>
        <p className="text-muted-foreground">Help others discover great food by sharing your reviews</p>
      </div>

      {/* Recently Viewed Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Recently Viewed</h2>
          </div>
          <Button variant="link" className="text-primary">
            View All
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentlyViewed.slice(0, 4).map((food: any) => (
              <FoodCard
                key={food.id}
                id={food.id}
                name={food.name}
                restaurant={food.restaurants?.name}
                image={food.image_url}
                rating={food.avg_rating || 0}
                ratingCount={food.rating_count || 0}
                tags={food.tags || []}
                price={food.price}
                onClick={() => handleFoodClick(food.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick Rate CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary-light/10 border-primary/20">
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-4xl">⭐</div>
          <div>
            <h3 className="font-semibold">Quick Rate</h3>
            <p className="text-sm text-muted-foreground">
              Found something delicious? Rate it now to help the community!
            </p>
          </div>
          <Button variant="hero" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Review
          </Button>
        </CardContent>
      </Card>

      {/* Restaurants Near You */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Restaurants Near You</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyRestaurants.map((restaurant: any) => (
              <Card key={restaurant.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{restaurant.name}</CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {restaurant.city}, {restaurant.state}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {restaurant.cuisine_type || 'Various'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="outline" size="sm" className="w-full">
                    View Menu Items
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};