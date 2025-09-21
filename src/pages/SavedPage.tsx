import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FoodCard } from '@/components/FoodCard';
import { FoodDetailModal } from '@/components/FoodDetailModal';
import { getSavedIds } from '@/services/savedService';

export const SavedPage = () => {
  const [foods, setFoods] = useState<any[]>([]);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const savedIds = getSavedIds();

  useEffect(() => {
    const load = async () => {
      if (savedIds.length === 0) {
        setFoods([]);
        return;
      }
      const { data } = await supabase
        .from('food_items')
        .select(`*, restaurants (name, city, state)`) 
        .in('id', savedIds);
      setFoods(data || []);
    };
    load();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Saved</h1>
      {foods.length === 0 ? (
        <p className="text-muted-foreground">No saved dishes yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {foods.map((food) => (
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
              onClick={() => setSelectedFoodId(food.id)}
            />
          ))}
        </div>
      )}

      <FoodDetailModal
        foodId={selectedFoodId}
        isOpen={!!selectedFoodId}
        onClose={() => setSelectedFoodId(null)}
      />
    </div>
  );
};
