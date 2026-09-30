const MEALDB_URL = 'https://www.themealdb.com/api/json/v1/1';
const REQUEST_TIMEOUT_MS = 10000;

const fetchJson = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortRequest = () => controller.abort();

  if (options.signal?.aborted) {
    abortRequest();
  } else {
    options.signal?.addEventListener('abort', abortRequest, { once: true });
  }

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener('abort', abortRequest);
  }
};

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
  const data = await fetchJson(`${MEALDB_URL}/filter.php?c=Vegetarian`, options);
  const meals = Array.isArray(data?.meals) ? data.meals : [];
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredMeals = normalizedQuery
    ? meals.filter((meal) => meal.strMeal?.toLocaleLowerCase().includes(normalizedQuery))
    : meals;

  return { results: filteredMeals.slice(0, 12).map(mapMealToRecipe) };
};

export const fetchVegetarianRecipes = async (query = '', options = {}) => {
  return fetchFromMealDb(query, options);
};

export const fetchRecipeDetails = async (id, options = {}) => {
  const recipeId = String(id);
  const mealId = recipeId.match(/^meal-(\d+)$/)?.[1];
  if (!mealId) throw new Error('Invalid recipe id');

  const data = await fetchJson(`${MEALDB_URL}/lookup.php?i=${mealId}`, options);
  const meal = data?.meals?.[0];
  if (!meal) throw new Error('Recipe not found');
  return mapMealToRecipe(meal);
};
