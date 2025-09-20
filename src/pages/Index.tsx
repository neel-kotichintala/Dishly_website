import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, ChefHat } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FoodCard } from '@/components/FoodCard';
import { Link, useNavigate } from 'react-router-dom';
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
    navigate(`/food/${foodId}`);
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

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,847</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Dishes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hotFoods.length}</div>
            <p className="text-xs text-muted-foreground">Trending this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">In West Lafayette</p>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-semibold">Ready to share your taste?</h2>
        <p className="text-muted-foreground">Join thousands of food lovers and discover your next favorite dish</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth">
            <Button variant="hero" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
          <Link to="/search">
            <Button variant="outline" className="w-full sm:w-auto">
              Explore Foods
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;