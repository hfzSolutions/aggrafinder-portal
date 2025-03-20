import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories';
import { pricingOptions } from '@/data/toolsData';

interface UserPreferencesProps {
  userId: string;
  onPreferencesSaved?: () => void;
}

interface UserPreferences {
  preferred_categories: string[];
  preferred_pricing: string;
  receive_recommendations: boolean;
}

export function UserPreferences({
  userId,
  onPreferencesSaved,
}: UserPreferencesProps) {
  const { categories, loading: categoriesLoading } = useSupabaseCategories();
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferred_categories: [],
    preferred_pricing: 'All',
    receive_recommendations: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!userId) return;

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          // Not found is expected for new users
          throw error;
        }

        if (data) {
          setPreferences({
            preferred_categories: data.preferred_categories || [],
            preferred_pricing: data.preferred_pricing || 'All',
            receive_recommendations: data.receive_recommendations !== false,
          });
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [userId]);

  const handleCategoryToggle = (category: string) => {
    if (category === 'All') return;

    setPreferences((prev) => {
      const isSelected = prev.preferred_categories.includes(category);

      if (isSelected) {
        return {
          ...prev,
          preferred_categories: prev.preferred_categories.filter(
            (c) => c !== category
          ),
        };
      } else {
        return {
          ...prev,
          preferred_categories: [...prev.preferred_categories, category],
        };
      }
    });
  };

  const handlePricingChange = (value: string) => {
    setPreferences((prev) => ({
      ...prev,
      preferred_pricing: value,
    }));
  };

  const handleRecommendationsToggle = (checked: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      receive_recommendations: checked,
    }));
  };

  const savePreferences = async () => {
    if (!userId) return;

    try {
      setSaving(true);

      const { error } = await supabase.from('user_preferences').upsert(
        {
          user_id: userId,
          preferred_categories: preferences.preferred_categories,
          preferred_pricing: preferences.preferred_pricing,
          receive_recommendations: preferences.receive_recommendations,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false,
        }
      );

      if (error) throw error;

      toast.success('Preferences saved successfully');

      if (onPreferencesSaved) {
        onPreferencesSaved();
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading || categoriesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading preferences...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-secondary rounded w-3/4"></div>
            <div className="h-4 bg-secondary rounded w-1/2"></div>
            <div className="h-4 bg-secondary rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Preferred Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {categories
            .filter((category) => category !== 'All')
            .map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={preferences.preferred_categories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <Label htmlFor={`category-${category}`} className="text-sm">
                  {category}
                </Label>
              </div>
            ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Preferred Pricing</h3>
        <RadioGroup
          value={preferences.preferred_pricing}
          onValueChange={handlePricingChange}
          className="grid grid-cols-2 md:grid-cols-4 gap-2"
        >
          {pricingOptions
            .filter((option) => option !== 'All')
            .map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`pricing-${option}`} />
                <Label htmlFor={`pricing-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
        </RadioGroup>
      </div>

      <div className="flex items-center space-x-2 space-y-2">
        <Checkbox
          id="receive-recommendations"
          checked={preferences.receive_recommendations}
          onCheckedChange={handleRecommendationsToggle}
        />
        <Label htmlFor="receive-recommendations">
          Receive personalized tool recommendations
        </Label>
      </div>

      <Button onClick={savePreferences} disabled={saving}>
        {saving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
}
