import React, { useEffect, useState } from 'react';
import { Clock, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FoodCard } from '@/components/FoodCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getRecentIds } from '@/services/recentService';
import { FoodDetailModal } from '@/components/FoodDetailModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const RatePage = () => {
  const [recentFoods, setRecentFoods] = useState<any[]>([]);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<any[]>([]);
  const [restaurantFoods, setRestaurantFoods] = useState<any[]>([]);
  const [selectedRestaurantName, setSelectedRestaurantName] = useState<string | null>(null);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([loadRecentFoods(), loadRestaurants()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentFoods = async () => {
    const ids = getRecentIds();
    if (ids.length === 0) {
      setRecentFoods([]);
      return;
    }
    const { data } = await supabase
      .from('food_items')
      .select(`*, restaurants (name, city, state)`) 
      .in('id', ids);
    const map = new Map((data || []).map((f: any) => [f.id, f]));
    const ordered = ids.map((id) => map.get(id)).filter(Boolean);
    setRecentFoods(ordered as any[]);
  };

  const loadRestaurants = async () => {
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .limit(8);
    setNearbyRestaurants(data || []);
  };

  const handleViewMenu = async (restaurantName: string) => {
    try {
      setSelectedRestaurantName(restaurantName);
      setShowMenuModal(true);

      // Find restaurant id by name, then fetch its food items
      const { data: rest } = await supabase
        .from('restaurants')
        .select('id, name, city, state')
        .eq('name', restaurantName)
        .single();

      if (!rest) {
        setRestaurantFoods([]);
        return;
      }

      const { data: foods } = await supabase
        .from('food_items')
        .select('*, restaurants (name, city, state)')
        .eq('restaurant_id', (rest as any).id)
        .order('avg_rating', { ascending: false });

      setRestaurantFoods(foods || []);
    } catch (e) {
      setRestaurantFoods([]);
    }
  };

  const visibleRecent = showAllRecent ? recentFoods : recentFoods.slice(0, 4);

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
          {recentFoods.length > 4 && (
            <Button variant="ghost" size="sm" onClick={() => setShowAllRecent(!showAllRecent)}>
              {showAllRecent ? 'Show less' : 'View all'}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : recentFoods.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items yet — start exploring!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleRecent.map((food: any) => (
              <FoodCard
                key={`recent-${food.id}`}
                id={food.id}
                name={food.name}
                restaurant={food.restaurants?.name}
                image={food.image_url}
                rating={food.avg_rating || 0}
                ratingCount={food.rating_count || 0}
                tags={food.tags || []}
                price={food.price}
                onClick={() => setSelectedFoodId(food.id)}
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
              <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
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
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewMenu(restaurant.name)}>
                    View Menu Items
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Restaurant Menu Items Modal */}
      <Dialog open={showMenuModal} onOpenChange={setShowMenuModal}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRestaurantName || 'Menu Items'}</DialogTitle>
          </DialogHeader>
          {restaurantFoods.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items found.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {restaurantFoods.map((food: any) => (
                <FoodCard
                  key={`menu-${food.id}`}
                  id={food.id}
                  name={food.name}
                  restaurant={food.restaurants?.name}
                  image={food.image_url}
                  rating={food.avg_rating || 0}
                  ratingCount={food.rating_count || 0}
                  tags={food.tags || []}
                  price={food.price}
                  onClick={() => setSelectedFoodId(food.id)}
                />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Food Detail Modal */}
      <FoodDetailModal
        foodId={selectedFoodId}
        isOpen={!!selectedFoodId}
        onClose={() => setSelectedFoodId(null)}
      />
    </div>
  );
};