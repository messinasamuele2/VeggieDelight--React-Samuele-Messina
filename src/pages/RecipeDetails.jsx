import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchRecipeDetails } from '../services/api';
import { translateRecipe } from '../services/translation.js';
import { RecipeContext } from '../context/RecipeContext.js';
import { getMessages } from '../i18n.js';
import { plainTextFromHtml } from '../utils/content.js';
import './RecipeDetails.css';

const RecipeDetails = () => {
  const { id } = useParams();
  const { language } = useContext(RecipeContext);
  const copy = getMessages(language);
  const detailsError = copy.detailsError;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const getDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchRecipeDetails(id, { signal: controller.signal });
        const translatedRecipe = await translateRecipe(data, language);
        if (!controller.signal.aborted) setRecipe(translatedRecipe);
      } catch (requestError) {
        if (requestError.name !== 'CanceledError' && requestError.name !== 'AbortError') {
          setError(detailsError);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    getDetails();

    return () => controller.abort();
  }, [id, language, detailsError]);

  if (loading) return <div className="details-status" role="status" aria-live="polite"><div className="loader" aria-hidden="true"></div><span className="sr-only">{copy.loadingDetails}</span></div>;
  if (error) return <div className="details-status error">{error}</div>;
  if (!recipe) return null;

  return (
    <div className="recipe-details-container">
      <Link to="/" className="back-link">← {copy.backToSearch}</Link>
      
      <div className="details-header">
        <h1 className="details-title">{recipe.title}</h1>
        <div className="details-meta">
          {recipe.readyInMinutes && <span>⏱ {recipe.readyInMinutes} {copy.minutes}</span>}
          {recipe.servings && <span>👥 {recipe.servings} {copy.servings}</span>}
          {recipe.aggregateLikes > 0 && <span>❤️ {recipe.aggregateLikes} {copy.likes}</span>}
        </div>
      </div>

      <div className="details-content">
        <div className="details-image-container">
          <img src={recipe.image} alt={recipe.title || 'Recipe'} className="details-image" />
        </div>
        
        <div className="details-info">
          <section className="ingredients-section">
            <h2>{copy.ingredients}</h2>
            <ul className="ingredients-list">
              {recipe.extendedIngredients?.map((ing, index) => (
                <li key={index}>
                  <strong>{ing.amount} {ing.unit}</strong> {ing.name}
                </li>
              ))}
            </ul>
          </section>
          
          <section className="instructions-section">
            <h2>{copy.instructions}</h2>
            <div 
              className="instructions-text"
            >
              {plainTextFromHtml(recipe.instructions) || copy.noInstructions}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
