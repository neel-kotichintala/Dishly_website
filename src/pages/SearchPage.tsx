import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, Map } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FoodCard } from '@/components/FoodCard';
import { FoodDetailModal } from '@/components/FoodDetailModal';
import { MapView } from '@/components/MapView';
import { InteractiveMap } from '@/components/InteractiveMap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { debounce } from 'lodash';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const filterChips = [
  'All',
  'Vegetarian',
  'Vegan', 
  'Gluten-Free',
  'Spicy',
  'Sweet',
  'Healthy',
  'Fast Food',
];

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        let queryBuilder = supabase
          .from('food_items')
          .select(`
            *,
            restaurants (name, city, state)
          `);

        // Text search
        queryBuilder = queryBuilder.or(
          `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`
        );

        // Apply filters
        if (activeFilter !== 'All') {
          queryBuilder = queryBuilder.contains('tags', [activeFilter.toLowerCase()]);
        }

        const { data, error } = await queryBuilder
          .order('avg_rating', { ascending: false })
          .limit(20);

        if (error) throw error;
        setResults(data || []);
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Search Error",
          description: "Failed to search for foods",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }, 300),
    [activeFilter, toast]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleFoodClick = (foodId: string) => {
    setSelectedFoodId(foodId);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for dishes, restaurants, or cuisines..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 py-6 text-base"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <MapPin className="h-4 w-4 mr-2" />
            Near Me
          </Button>
          <Button 
            variant={showMapModal ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowMapModal(true)}
          >
            <Map className="h-4 w-4 mr-2" />
            Map
          </Button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {filterChips.map((filter) => (
          <Badge
            key={filter}
            variant={activeFilter === filter ? "default" : "secondary"}
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1"
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </Badge>
        ))}
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        {query && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Searching...' : `${results.length} results for "${query}"`}
            </p>
          </div>
        )}

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((food: any) => (
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
        ) : query ? (
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl">🔍</div>
            <div>
              <h3 className="font-semibold">No results found</h3>
              <p className="text-sm text-muted-foreground">
                Try different keywords or check spelling
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl">🍽️</div>
            <div>
              <h3 className="font-semibold">Start searching</h3>
              <p className="text-sm text-muted-foreground">
                Find your next favorite dish
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Map Modal */}
      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        <DialogContent className="max-w-4xl w-[95vw]">
          <DialogHeader>
            <DialogTitle>Results on Map</DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <InteractiveMap
              foods={results}
              onFoodSelect={(id: string) => setSelectedFoodId(id)}
              height={520}
            />
          </div>
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