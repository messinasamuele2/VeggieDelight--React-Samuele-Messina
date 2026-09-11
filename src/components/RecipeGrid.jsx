import React, { useContext } from 'react';
import { RecipeContext } from '../context/RecipeContext.js';
import { getMessages } from '../i18n.js';
import RecipeCard from './RecipeCard.jsx';
import './RecipeGrid.css';

const RecipeGrid = () => {
  const { recipes, loading, error, language } = useContext(RecipeContext);
  const copy = getMessages(language);

  if (loading) {
    return (
      <div className="status-container" role="status" aria-live="polite" aria-busy="true">
        <div className="loader" aria-hidden="true"></div>
        <p>{copy.loadingRecipes}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-container error" role="alert">
        <p>⚠️ {error}</p>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="status-container">
        <p>{copy.noRecipes}</p>
      </div>
    );
  }

  return (
    <div className="recipe-grid">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
};

export default RecipeGrid;
