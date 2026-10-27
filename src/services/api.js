const MEALDB_URL = 'https://www.themealdb.com/api/json/v1/1';
const REQUEST_TIMEOUT_MS = 10000;
const DEFAULT_PAGE_SIZE = 12;
let vegetarianCatalogPromise = null;
const SEARCH_ALIASES = {
  peperone: ['pepper', 'peppers', 'bell pepper'],
  peperoni: ['pepper', 'peppers', 'bell pepper'],
  patata: ['potato', 'potatoes'],
  patate: ['potato', 'potatoes'],
  pomodoro: ['tomato', 'tomatoes'],
  pomodori: ['tomato', 'tomatoes'],
  melanzana: ['aubergine', 'eggplant'],
  melanzane: ['aubergine', 'eggplant'],
  zucchina: ['courgette', 'zucchini'],
  zucchine: ['courgette', 'zucchini'],
  cipolla: ['onion', 'onions'],
  cipolle: ['onion', 'onions'],
  carota: ['carrot', 'carrots'],
  carote: ['carrot', 'carrots'],
  cavolo: ['cabbage'],
  fagioli: ['bean', 'beans'],
};

const normalizeSearchTerm = (term) => term
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLocaleLowerCase();

const getSearchTerms = (query, queryVariants = []) => {
  const baseTerms = [query, ...queryVariants]
    .map(normalizeSearchTerm)
    .filter(Boolean);
  const aliases = baseTerms.flatMap((term) => SEARCH_ALIASES[term] || []);
  return [...new Set([...baseTerms, ...aliases])];
};

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

const fetchVegetarianCatalog = async () => {
  if (!vegetarianCatalogPromise) {
    vegetarianCatalogPromise = fetchJson(`${MEALDB_URL}/filter.php?c=Vegetarian`)
      .then((data) => (Array.isArray(data?.meals) ? data.meals : []))
      .catch((error) => {
        vegetarianCatalogPromise = null;
        throw error;
      });
  }

  return vegetarianCatalogPromise;
};

const fetchFromMealDb = async (query = '', options = {}) => {
  const {
    offset = 0,
    limit = DEFAULT_PAGE_SIZE,
    queryVariants = [],
  } = options;
  const meals = await fetchVegetarianCatalog();
  if (options.signal?.aborted) {
    throw new DOMException('The request was aborted.', 'AbortError');
  }
  const searchTerms = getSearchTerms(query, queryVariants);
  const filteredMeals = searchTerms.length
    ? meals.filter((meal) => {
      const mealName = normalizeSearchTerm(meal.strMeal || '');
      return searchTerms.some((term) => mealName.includes(term));
    })
    : meals;
  const page = filteredMeals.slice(offset, offset + limit);

  return {
    results: page.map(mapMealToRecipe),
    nextOffset: offset + page.length,
    hasMore: offset + page.length < filteredMeals.length,
  };
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
