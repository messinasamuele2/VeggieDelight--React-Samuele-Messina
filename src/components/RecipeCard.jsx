import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { RecipeContext } from '../context/RecipeContext.js';
import { getMessages } from '../i18n.js';
import './RecipeCard.css';

const RecipeCard = ({ recipe }) => {
  const { language } = useContext(RecipeContext);
  const copy = getMessages(language);

  return (
    <Link to={`/recipe/${recipe.id}`} className="recipe-card">
      <div className="card-image-container">
        <img src={recipe.image} alt={recipe.title || 'Recipe'} className="recipe-image" loading="lazy" />
      </div>
      <div className="card-content">
        <h3 className="recipe-title">{recipe.title}</h3>
        <span className="view-recipe">{copy.viewRecipe} ➔</span>
      </div>
    </Link>
  );
};

export default RecipeCard;
