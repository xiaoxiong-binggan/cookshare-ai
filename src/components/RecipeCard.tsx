// src/components/RecipeCard.tsx
import { Recipe } from '../types/recipe';

const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
  <div className="recipe-card">
    <img src={recipe.imageUrl} alt={recipe.title} />
    <h3>{recipe.title}</h3>
    <p>{recipe.description}</p>
    <a href={recipe.videoUrl} target="_blank" rel="noopener noreferrer">
      👉 查看视频
    </a>
  </div>
);

export default RecipeCard;
