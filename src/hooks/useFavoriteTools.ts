import { useState, useEffect } from 'react';
import { AITool } from '@/types/tools';

interface UseFavoriteToolsReturn {
  favoriteTools: string[];
  addFavorite: (toolId: string) => void;
  removeFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
}

export const useFavoriteTools = (): UseFavoriteToolsReturn => {
  const [favoriteTools, setFavoriteTools] = useState<string[]>([]);

  // Load favorites from localStorage on initial render
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorite_tools');
    if (storedFavorites) {
      try {
        setFavoriteTools(JSON.parse(storedFavorites));
      } catch (error) {
        console.error('Error parsing favorite tools:', error);
        localStorage.removeItem('favorite_tools');
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('favorite_tools', JSON.stringify(favoriteTools));
  }, [favoriteTools]);

  const addFavorite = (toolId: string) => {
    if (!favoriteTools.includes(toolId)) {
      setFavoriteTools((prev) => [...prev, toolId]);
    }
  };

  const removeFavorite = (toolId: string) => {
    setFavoriteTools((prev) => prev.filter((id) => id !== toolId));
  };

  const isFavorite = (toolId: string) => {
    return favoriteTools.includes(toolId);
  };

  return { favoriteTools, addFavorite, removeFavorite, isFavorite };
};
