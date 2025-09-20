import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FoodCard } from '@/components/FoodCard';
import { FoodDetailModal } from '@/components/FoodDetailModal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const categoryChips = [
  { name: 'Trending', icon: '🔥' },
  { name: 'Burgers', icon: '🍔' },
  { name: 'Pizza', icon: '🍕' },
  { name: 'Desserts', icon: '🍰' },
  { name: 'Asian', icon: '🍜' },
  { name: 'Healthy', icon: '🥗' },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hotFoods, setHotFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchHotFoods();
  }, []);

  const fetchHotFoods = async () => {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select(`
          *,
          restaurants (name, city, state)
        `)
        .eq('is_trending', true)
        .order('avg_rating', { ascending: false })
        .limit(6);

      if (error) throw error;
      setHotFoods(data || []);
    } catch (error) {
      console.error('Error fetching hot foods:', error);
      toast({
        title: "Error",
        description: "Failed to load trending foods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleFoodClick = (foodId: string) => {
    setSelectedFoodId(foodId);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">What are you craving today?</h1>
          <p className="text-muted-foreground">Discover amazing foods and share your taste</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 pr-4 py-6 text-center rounded-full border-2 border-primary/20 focus:border-primary"
          />
          {searchQuery && (
            <Button
              onClick={handleSearch}
              className="absolute right-2 top-2 rounded-full"
              size="sm"
            >
              Search
            </Button>
          )}
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categoryChips.map((category) => (
          <Badge
            key={category.name}
            variant="secondary"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2"
          >
            <span className="mr-1">{category.icon}</span>
            {category.name}
          </Badge>
        ))}
      </div>

      {/* Hot Foods Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Hot Right Now</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="aspect-[3/4] animate-pulse">
                <div className="bg-muted h-full rounded-lg"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {hotFoods.map((food: any) => (
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
                isHot={food.is_trending}
                onClick={() => handleFoodClick(food.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recommended for You Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Recommended for You</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {hotFoods.slice(0, 4).map((food: any) => (
            <FoodCard
              key={`rec-${food.id}`}
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
      </section>

      {/* Food Detail Modal */}
      <FoodDetailModal
        foodId={selectedFoodId}
        isOpen={!!selectedFoodId}
        onClose={() => setSelectedFoodId(null)}
      />
    </div>
  );
};

export default Index;