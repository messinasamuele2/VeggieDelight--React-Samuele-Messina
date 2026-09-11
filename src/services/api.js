import axios from 'axios';

const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes';
const MEALDB_URL = 'https://www.themealdb.com/api/json/v1/1';

const mapMealToRecipe = (meal) => ({
  id: `meal-${meal.idMeal}`,
  title: meal.strMeal || 'Vegetarian recipe',
  image: meal.strMealThumb || '',
  extendedIngredients: Array.from({ length: 20 }, (_, index) => index + 1)
    .map((index) => ({
      name: meal[`strIngredient${index}`],
      amount: '',
      unit: meal[`strMeasure${index}`] || '',
    }))
    .filter((ingredient) => ingredient.name?.trim()),
  instructions: meal.strInstructions || '',
  readyInMinutes: null,
  servings: null,
  aggregateLikes: 0,
});

const fetchFromMealDb = async (query = '', options = {}) => {
  const response = await axios.get(`${MEALDB_URL}/filter.php`, {
    params: { c: 'Vegetarian' },
    signal: options.signal,
  });
  const meals = response.data?.meals || [];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredMeals = normalizedQuery
    ? meals.filter((meal) => meal.strMeal.toLowerCase().includes(normalizedQuery))
    : meals;

  return { results: filteredMeals.slice(0, 12).map(mapMealToRecipe) };
};

export const fetchVegetarianRecipes = async (query = '', offset = 0, options = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}/complexSearch`, {
      params: {
        apiKey: API_KEY,
        diet: 'vegetarian',
        query: query,
        number: 12,
        offset: offset,
        addRecipeInformation: true,
      },
      signal: options.signal,
    });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error) || error.name === 'AbortError') throw error;
    console.error('Error fetching recipes:', error);
    console.warn('Spoonacular unavailable. Using TheMealDB fallback.');
    return fetchFromMealDb(query, options);
  }
};

export const fetchRecipeDetails = async (id, options = {}) => {
  if (String(id).startsWith('meal-')) {
    const mealId = String(id).replace('meal-', '');
    const response = await axios.get(`${MEALDB_URL}/lookup.php`, {
      params: { i: mealId },
      signal: options.signal,
    });
    const meal = response.data?.meals?.[0];
    if (!meal) throw new Error('Recipe not found');
    return mapMealToRecipe(meal);
  }

  try {
    const response = await axios.get(`${BASE_URL}/${id}/information`, {
      params: {
        apiKey: API_KEY,
      },
      signal: options.signal,
    });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error) || error.name === 'AbortError') throw error;
    console.error('Error fetching recipe details:', error);
    throw error;
  }
};
