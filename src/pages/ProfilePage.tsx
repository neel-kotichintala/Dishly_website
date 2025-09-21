import React, { useState, useEffect } from 'react';
import { User, Award, Star, Upload, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { FoodCard } from '@/components/FoodCard';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FoodDetailModal } from '@/components/FoodDetailModal';
import { getDeviceId } from '@/services/device';
import { getLocalReviewsByUser } from '@/services/reviewsLocal';
import { UploadMenuModal } from '@/components/UploadMenuModal';
import { uploadMenuFile } from '@/services/menuUpload';

const achievementLevels = [
  { name: 'Newcomer', min: 0, color: 'bg-gray-500' },
  { name: 'Bronze Critic', min: 100, color: 'bg-amber-600' },
  { name: 'Silver Critic', min: 500, color: 'bg-gray-400' },
  { name: 'Platinum Critic', min: 1000, color: 'bg-purple-500' },
];

export const ProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    const mockProfile = {
      display_name: 'Food Explorer',
      points: 750,
      total_reviews: 42,
      total_uploads: 8,
      achievement_level: 'Silver Critic',
      avatar_url: null,
    };
    setProfile(mockProfile);
    loadMyReviews();
  }, []);

  const loadMyReviews = async () => {
    const deviceId = getDeviceId();
    // Primary: local reviews for immediate demo reliability
    const local = getLocalReviewsByUser(deviceId);
    if (local.length > 0) {
      // Fetch food info for these reviews
      const ids = Array.from(new Set(local.map((r) => r.food_item_id)));
      const { data } = await supabase
        .from('food_items')
        .select('id, name, image_url, avg_rating, rating_count, price, restaurants (name)')
        .in('id', ids);
      const map = new Map((data || []).map((f: any) => [f.id, f]));
      const items = local
        .map((r) => ({ food_items: map.get(r.food_item_id), created_at: r.created_at }))
        .filter((x) => x.food_items);
      setUserReviews(items as any[]);
      return;
    }

    // Fallback: Supabase reviews if no local ones
    try {
      const { data } = await supabase
        .from('reviews')
        .select('*, food_items (id, name, image_url, avg_rating, rating_count, price, restaurants (name))')
        .eq('user_id', deviceId)
        .order('created_at', { ascending: false });
      setUserReviews(data || []);
    } catch {
      setUserReviews([]);
    }
  };

  const currentLevel = (() => {
    if (!profile) return achievementLevels[0];
    return (
      achievementLevels.find((level) =>
        profile.points >= level.min &&
        (achievementLevels[achievementLevels.indexOf(level) + 1]?.min > profile.points ||
          !achievementLevels[achievementLevels.indexOf(level) + 1])
      ) || achievementLevels[0]
    );
  })();

  const nextLevel = (() => {
    const currentIndex = achievementLevels.indexOf(currentLevel);
    return achievementLevels[currentIndex + 1];
  })();

  if (loading && !profile) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-48 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-6 text-center space-y-4">
        <h1 className="text-2xl font-bold">Welcome to Dishly!</h1>
        <p className="text-muted-foreground">Sign in to access your profile and start rating foods</p>
        <Link to="/auth">
          <Button variant="hero">Sign In</Button>
        </Link>
      </div>
    );
  }

  const progressToNext = nextLevel
    ? Math.min(100, (profile.points / nextLevel.min) * 100)
    : 100;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-2xl">
                {profile.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                <Badge className={`${currentLevel.color} text-white`}>
                  {currentLevel.name}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{profile.points}</div>
                  <div className="text-xs text-muted-foreground">Points</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{profile.total_reviews}</div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{profile.total_uploads}</div>
                  <div className="text-xs text-muted-foreground">Uploads</div>
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Points Progress */}
      {nextLevel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-5 w-5 text-primary" />
              Progress to {nextLevel.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{profile.points} points</span>
                <span>{nextLevel.min} points needed</span>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {nextLevel.min - profile.points} points until next level
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Menu Upload Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary-light/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Earn Points by Uploading Menus
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Help grow our food database by uploading restaurant menus. 
            Our AI will process them and award you points for each new dish added!
          </p>
          <Button variant="hero" className="w-full sm:w-auto" onClick={() => setShowUpload(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Menu
          </Button>
        </CardContent>
      </Card>

      <UploadMenuModal
        open={showUpload}
        onOpenChange={setShowUpload}
        onSubmit={async ({ restaurant, file }) => {
          try {
            const res = await uploadMenuFile(restaurant, file);
            toast({ title: 'Upload received', description: `Processing ${restaurant}…` });
          } catch (e: any) {
            toast({ title: 'Upload failed', description: e?.message || 'Please try again', variant: 'destructive' });
          }
        }}
      />

      {/* Achievement Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievementLevels.map((level) => {
              const isUnlocked = profile.points >= level.min;
              return (
                <div
                  key={level.name}
                  className={`text-center p-4 rounded-lg border ${
                    isUnlocked 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-muted/50 border-muted'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full ${level.color} mx-auto mb-2 flex items-center justify-center ${
                    !isUnlocked && 'opacity-50'
                  }`}>
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-sm font-medium">{level.name}</div>
                  <div className="text-xs text-muted-foreground">{level.min}+ points</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* My Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>My Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {userReviews.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-4xl">📝</div>
              <div>
                <h3 className="font-semibold">No reviews yet</h3>
                <p className="text-sm text-muted-foreground">Review a dish to see it here</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userReviews.map((r: any) => (
                <FoodCard
                  key={`myreview-${r.food_items?.id}`}
                  id={r.food_items?.id}
                  name={r.food_items?.name}
                  restaurant={r.food_items?.restaurants?.name}
                  image={r.food_items?.image_url}
                  rating={r.food_items?.avg_rating || 0}
                  ratingCount={r.food_items?.rating_count || 0}
                  price={r.food_items?.price}
                  onClick={() => setSelectedFoodId(r.food_items?.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FoodDetailModal
        foodId={selectedFoodId}
        isOpen={!!selectedFoodId}
        onClose={() => setSelectedFoodId(null)}
      />
    </div>
  );
};