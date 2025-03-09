
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSupabaseCategories = () => {
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        const { data, error: supabaseError } = await supabase
          .from('categories')
          .select('name')
          .order('id');
        
        if (supabaseError) {
          throw new Error(supabaseError.message);
        }
        
        // Extract category names
        const categoryNames = data.map(item => item.name);
        setCategories(categoryNames);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};
