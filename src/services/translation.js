import axios from 'axios';

const translationCache = new Map();
const TRANSLATION_URL = 'https://api.mymemory.translated.net/get';
const GOOGLE_TRANSLATION_URL = 'https://translate.googleapis.com/translate_a/single';
const MAX_TRANSLATION_CHARS = 450;
const culinaryGlossary = [
  ['beetroot latkes', 'latkes di barbabietola'],
  ['beet latkes', 'latkes di barbabietola'],
  ['beetroot', 'barbabietola'],
  ['beets', 'barbabietole'],
  ['beet', 'barbabietola'],
  ['latkes', 'latkes'],
  ['shchi', 'shchi'],
  ['cabbage soup', 'zuppa di cavolo'],
  ['cabbage', 'cavolo'],
  ['onion', 'cipolla'],
  ['onions', 'cipolle'],
  ['potato', 'patata'],
  ['potatoes', 'patate'],
  ['carrot', 'carota'],
  ['carrots', 'carote'],
];

const applyGlossary = (text) => culinaryGlossary.reduce(
  (translatedText, [source, target]) => translatedText.replace(
    new RegExp(`\\b${source}\\b`, 'gi'),
    target,
  ),
  text,
);

const translateWithGoogle = async (text, targetLanguage, sourceLanguage) => {
  const response = await axios.get(GOOGLE_TRANSLATION_URL, {
    params: {
      client: 'gtx',
      sl: sourceLanguage,
      tl: targetLanguage,
      dt: 't',
      q: text,
    },
  });
  const translatedText = response.data?.[0]
    ?.map((segment) => segment?.[0] || '')
    .join('');

  return translatedText?.trim() ? translatedText : text;
};

const splitIntoChunks = (text, maxLength = MAX_TRANSLATION_CHARS) => {
  const words = text.match(/\S+\s*/g) || [];
  const chunks = [];
  let currentChunk = '';

  words.forEach((word) => {
    if (word.length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
      for (let index = 0; index < word.length; index += maxLength) {
        chunks.push(word.slice(index, index + maxLength));
      }
      return;
    }

    if (currentChunk.length + word.length > maxLength) {
      chunks.push(currentChunk);
      currentChunk = word;
    } else {
      currentChunk += word;
    }
  });

  if (currentChunk) chunks.push(currentChunk);
  return chunks;
};

const translateChunk = async (text, targetLanguage, sourceLanguage) => {
  if (!text || !text.trim() || targetLanguage === sourceLanguage) return text || '';

  const cacheKey = `${sourceLanguage}:${targetLanguage}:${text}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);

  try {
    const response = await axios.get(TRANSLATION_URL, {
      params: {
        q: text,
        langpair: `${sourceLanguage}|${targetLanguage}`,
      },
    });
    const responseData = response.data?.responseData;
    const translatedText = responseData?.translatedText;
    const responseStatus = response.data?.responseStatus;

    if (!translatedText || responseStatus !== 200 || /query length limit|error/i.test(translatedText)) {
      const googleTranslation = await translateWithGoogle(text, targetLanguage, sourceLanguage);
      return applyGlossary(googleTranslation);
    }

    translationCache.set(cacheKey, translatedText);
    return applyGlossary(translatedText);
  } catch (error) {
    console.warn('Translation unavailable, using original text:', error);
    try {
      return applyGlossary(await translateWithGoogle(text, targetLanguage, sourceLanguage));
    } catch (fallbackError) {
      console.warn('Fallback translation unavailable, using original text:', fallbackError);
      return applyGlossary(text);
    }
  }
};

export const translateText = async (text, targetLanguage = 'it', sourceLanguage = 'en') => {
  if (!text || !text.trim() || targetLanguage === sourceLanguage) return text || '';

  const chunks = splitIntoChunks(text);
  const translatedChunks = [];
  for (const chunk of chunks) {
    translatedChunks.push(await translateChunk(chunk, targetLanguage, sourceLanguage));
  }
  return translatedChunks.join('');
};

const translateHtml = async (html, targetLanguage) => {
  if (!html || targetLanguage === 'en') return html || '';

  const parts = html.split(/(<[^>]+>)/g);
  const translatedParts = await Promise.all(
    parts.map((part) => (part.startsWith('<') ? part : translateText(part, targetLanguage))),
  );
  return translatedParts.join('');
};

export const translateRecipe = async (recipe, targetLanguage) => {
  if (!recipe || targetLanguage === 'en') return recipe;

  const [title, instructions, extendedIngredients] = await Promise.all([
    translateText(recipe.title, targetLanguage),
    translateHtml(recipe.instructions, targetLanguage),
    Promise.all(
      (recipe.extendedIngredients || []).map(async (ingredient) => ({
        ...ingredient,
        name: await translateText(ingredient.name, targetLanguage),
        unit: await translateText(ingredient.unit, targetLanguage),
      })),
    ),
  ]);

  return {
    ...recipe,
    title: applyGlossary(title),
    instructions: applyGlossary(instructions),
    extendedIngredients,
  };
};

export const translateRecipes = async (recipes, targetLanguage) =>
  Promise.all((recipes || []).map((recipe) => translateRecipe(recipe, targetLanguage)));
