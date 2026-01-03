// src/pages/Community.tsx
import { useState } from 'react';
import { Recipe } from '../types/recipe';
import RecipeCard from '../components/RecipeCard';
import { mockRecipes } from '../utils/mockData';

const Community = () => {
  const [recipes] = useState<Recipe[]>(mockRecipes);

  return (
    <div className="community">
      <h2>厨友社区</h2>
      <div className="recipes-grid">
        {recipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default Community;
